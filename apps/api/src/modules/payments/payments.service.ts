import type { Gateway, Prisma } from "@prisma/client";
import { prisma, type Tx } from "../../shared/prisma.js";
import { enqueue } from "../../shared/outbox.js";
import { logger } from "../../shared/logger.js";
import { n } from "../../shared/money.js";
import { invalidateCatalog } from "../catalog/catalog.service.js";
import { mockGateway } from "./gateways/mock.js";
import { stripeGateway } from "./gateways/stripe.js";
import { jiopayGateway } from "./gateways/jiopay.js";
import type { PaidAmount, PaymentGateway } from "./gateways/types.js";
import { decidePaid, type PaidDecision } from "./payment-rules.js";

export const gatewayFor = (g: Gateway): PaymentGateway => (g === "stripe" ? stripeGateway : g === "jiopay" ? jiopayGateway : mockGateway);

export type MarkPaidInfo = {
  /** The gateway this confirmation came from. Must be the gateway the order's payment was created with. */
  via: Gateway;
  gatewayPaymentId?: string;
  method?: string;
  raw?: unknown;
  /** Amount the gateway says it collected. Required for real gateways. */
  paid?: PaidAmount | null;
};
export type MarkPaidOutcome = PaidDecision | "not_found";

/** Row lock on the order: every state change below runs while holding it, so concurrent webhooks / retries are serialised. */
async function lockOrder(tx: Tx, orderId: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Order" WHERE "id" = ${orderId} FOR UPDATE`;
  if (rows.length === 0) return null;
  return tx.order.findUnique({ where: { id: orderId }, include: { lines: true, payments: { orderBy: { createdAt: "asc" } } } });
}

const rawObject = (raw: unknown): Record<string, unknown> => (raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {});

/**
 * Payment truth comes from here only (webhook, mock page, or reconciler) — never from the browser redirect.
 * Idempotent and safe under concurrency: the order row is locked (SELECT … FOR UPDATE) for the whole transaction,
 * so of N simultaneous confirmations exactly one moves stock, counts the coupon and queues the emails.
 */
export const paymentsService = {
  async markPaid(orderId: string, info: MarkPaidInfo): Promise<{ outcome: MarkPaidOutcome }> {
    const outcome = await prisma.$transaction(async (tx): Promise<MarkPaidOutcome> => {
      const order = await lockOrder(tx, orderId);
      if (!order) return "not_found";
      const payment = order.payments[0];
      if (!payment) return "gateway_mismatch";
      const expected = { amount: n(payment.amount), currency: payment.currency };
      const decision = decidePaid({ orderStatus: order.status, paymentStatus: order.paymentStatus, paymentRecordStatus: payment.status, paymentGateway: payment.gateway }, info.via, info.paid, expected);
      const seen = rawObject(payment.raw);

      if (decision === "amount_mismatch") {
        // Do not mark paid. Keep the evidence on the payment and ask a human — once per order.
        if (seen.review !== "amount_mismatch") {
          await tx.payment.update({ where: { id: payment.id }, data: { raw: { ...seen, review: "amount_mismatch", reported: (info.paid ?? null) as Prisma.InputJsonValue, expected, gatewayPaymentId: info.gatewayPaymentId ?? null } as Prisma.InputJsonObject } });
          await enqueue("email.payment_review", { orderId, reason: "amount_mismatch" }, tx);
        }
        return decision;
      }
      if (decision === "needs_review") {
        // Money arrived for an order that was already cancelled/expired: its stock went back on sale, so it is not
        // fulfilled automatically. Record the payment, leave the order cancelled, tell the team to refund or re-open by hand.
        await tx.payment.update({ where: { id: payment.id }, data: { status: "paid", gatewayPaymentId: info.gatewayPaymentId ?? payment.gatewayPaymentId, method: info.method, raw: { ...seen, review: "paid_after_cancel", gateway: (info.raw ?? null) as Prisma.InputJsonValue } as Prisma.InputJsonObject } });
        await enqueue("email.payment_review", { orderId, reason: "paid_after_cancel" }, tx);
        return decision;
      }
      if (decision !== "mark_paid") return decision;

      await tx.payment.update({ where: { id: payment.id }, data: { status: "paid", gatewayPaymentId: info.gatewayPaymentId ?? payment.gatewayPaymentId, method: info.method, raw: (info.raw as object) ?? undefined } });
      // reserved → sold
      for (const l of order.lines) {
        if (!l.variantId) continue;
        await tx.inventory.updateMany({ where: { variantId: l.variantId }, data: { onHand: { decrement: l.qty }, reserved: { decrement: l.qty } } });
      }
      if (order.couponCode) await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "paid", status: "paid", paidAt: new Date() } });
      await enqueue("email.order_confirmation", { orderId }, tx);
      await enqueue("email.admin_new_order", { orderId }, tx);
      await enqueue("shipping.create", { orderId }, tx);
      return decision;
    });
    if (outcome === "mark_paid") {
      invalidateCatalog();
      logger.info({ orderId }, "order paid");
    } else if (outcome !== "already_paid" && outcome !== "already_flagged") {
      logger.warn({ orderId, outcome, via: info.via }, "payment confirmation not applied");
    }
    return { outcome };
  },

  /**
   * Cancels an unpaid order and releases its stock. `via` (webhooks) restricts it to orders of that gateway.
   * If the order has a Stripe PaymentIntent, a job is queued to cancel it so it cannot be paid afterwards.
   */
  async markFailed(orderId: string, reason: string, via?: Gateway): Promise<{ outcome: "failed" | "ignored" | "gateway_mismatch" | "not_found" }> {
    const outcome = await prisma.$transaction(async (tx) => {
      const order = await lockOrder(tx, orderId);
      if (!order) return "not_found" as const;
      const payment = order.payments[0];
      if (via && payment?.gateway !== via) return "gateway_mismatch" as const;
      if (order.paymentStatus !== "initiated" && order.paymentStatus !== "pending") return "ignored" as const;
      for (const l of order.lines) if (l.variantId) await tx.inventory.updateMany({ where: { variantId: l.variantId }, data: { reserved: { decrement: l.qty } } });
      await tx.payment.updateMany({ where: { orderId }, data: { status: "failed", raw: { reason } } });
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "failed", status: "cancelled", cancelledAt: new Date() } });
      await enqueue("email.payment_failed", { orderId }, tx);
      if (payment?.gateway === "stripe" && payment.gatewayOrderId) await enqueue("payment.cancel", { orderId, gateway: "stripe", gatewayOrderId: payment.gatewayOrderId }, tx);
      return "failed" as const;
    });
    if (outcome === "failed") invalidateCatalog();
    return { outcome };
  },

  /** Worker job: best-effort cancel at the gateway (Stripe PaymentIntent) for a cancelled/expired order. */
  async cancelAtGateway(gateway: Gateway, gatewayOrderId: string) {
    const gw = gatewayFor(gateway);
    if (!gw.cancelPayment) return "unsupported" as const;
    return gw.cancelPayment(gatewayOrderId);
  },

  /** Release reservations of orders that never got paid (worker sweep, every minute). */
  async expireUnpaid(minutes = 20) {
    const stale = await prisma.order.findMany({ where: { paymentStatus: "initiated", placedAt: { lt: new Date(Date.now() - minutes * 60_000) } }, select: { id: true } });
    for (const o of stale) await this.markFailed(o.id, "payment_timeout");
    return stale.length;
  },
};
