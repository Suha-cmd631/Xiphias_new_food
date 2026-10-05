import type { Gateway } from "@prisma/client";
import { prisma } from "../../shared/prisma.js";
import { enqueue } from "../../shared/outbox.js";
import { logger } from "../../shared/logger.js";
import { invalidateCatalog } from "../catalog/catalog.service.js";
import { mockGateway } from "./gateways/mock.js";
import { stripeGateway } from "./gateways/stripe.js";
import { jiopayGateway } from "./gateways/jiopay.js";
import type { PaymentGateway } from "./gateways/types.js";

export const gatewayFor = (g: Gateway): PaymentGateway => (g === "stripe" ? stripeGateway : g === "jiopay" ? jiopayGateway : mockGateway);

/**
 * Payment truth comes from here only (webhook, mock page, or reconciler) — never from the browser redirect.
 * Idempotent: a second "paid" for the same order is a no-op.
 */
export const paymentsService = {
  async markPaid(orderId: string, info: { gatewayPaymentId?: string; method?: string; raw?: unknown }) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { lines: true, payments: true } });
      if (!order) return null;
      if (order.paymentStatus === "paid") return order;
      const payment = order.payments[0];
      if (payment) await tx.payment.update({ where: { id: payment.id }, data: { status: "paid", gatewayPaymentId: info.gatewayPaymentId ?? payment.gatewayPaymentId, method: info.method, raw: (info.raw as object) ?? undefined } });
      // reserved → sold
      for (const l of order.lines) {
        if (!l.variantId) continue;
        await tx.inventory.updateMany({ where: { variantId: l.variantId }, data: { onHand: { decrement: l.qty }, reserved: { decrement: l.qty } } });
      }
      if (order.couponCode) await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
      const updated = await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "paid", status: "paid", paidAt: new Date() } });
      await enqueue("email.order_confirmation", { orderId }, tx);
      await enqueue("email.admin_new_order", { orderId }, tx);
      await enqueue("shipping.create", { orderId }, tx);
      return updated;
    });
    invalidateCatalog();
    logger.info({ orderId }, "order paid");
    return result;
  },

  async markFailed(orderId: string, reason: string) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { lines: true, payments: true } });
      if (!order || order.paymentStatus !== "initiated") return;
      for (const l of order.lines) if (l.variantId) await tx.inventory.updateMany({ where: { variantId: l.variantId }, data: { reserved: { decrement: l.qty } } });
      await tx.payment.updateMany({ where: { orderId }, data: { status: "failed", raw: { reason } } });
      await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "failed", status: "cancelled", cancelledAt: new Date() } });
      await enqueue("email.payment_failed", { orderId }, tx);
    });
    invalidateCatalog();
  },

  /** Release reservations of orders that never got paid (worker sweep, every minute). */
  async expireUnpaid(minutes = 20) {
    const stale = await prisma.order.findMany({ where: { paymentStatus: "initiated", placedAt: { lt: new Date(Date.now() - minutes * 60_000) } }, select: { id: true } });
    for (const o of stale) await this.markFailed(o.id, "payment_timeout");
    return stale.length;
  },
};
