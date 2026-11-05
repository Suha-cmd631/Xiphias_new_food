import { Router, raw, urlencoded } from "express";
import { env, gatewaysConfigured } from "../../config/env.js";
import { prisma } from "../../shared/prisma.js";
import { logger } from "../../shared/logger.js";
import { fromMinor } from "../../shared/money.js";
import { safeEqual } from "../../shared/secure.js";
import { stripeClient } from "../payments/gateways/stripe.js";
import { jiopayPaidAmount, jiopayWebhookKey, verifyJioPaySignature } from "../payments/gateways/jiopay.js";
import { paymentsService } from "../payments/payments.service.js";

/** Webhooks: verify signature → persist event (idempotent) → 2xx → process. Raw body parsers are mounted here, before JSON. */
export const webhooksRouter = Router();

const err = (code: string, message: string) => ({ error: { code, message } });

/** Close the stored event: processedAt always (so a duplicate delivery is not re-run), plus why nothing was done, if so. */
async function finish(eventId: string, error?: string) {
  await prisma.webhookEvent.update({ where: { id: eventId }, data: { processedAt: new Date(), error: error ?? null } }).catch((e) => logger.error({ e, eventId }, "webhook event update failed"));
  if (error) logger.warn({ eventId, error }, "webhook not applied");
}

/** Outcomes of markPaid/markFailed that mean "the event was valid but we deliberately did not act on it". */
const refusal = (outcome: string): string | undefined =>
  ["gateway_mismatch", "amount_mismatch", "needs_review", "not_found"].includes(outcome) ? outcome : undefined;

webhooksRouter.post("/stripe", raw({ type: "application/json" }), async (req, res) => {
  if (!stripeClient || !env.STRIPE_WEBHOOK_SECRET) { res.status(503).json(err("STRIPE_NOT_CONFIGURED", "Stripe webhooks are not configured")); return; }
  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body as Buffer, req.headers["stripe-signature"] as string, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    logger.warn({ e }, "stripe signature failed");
    res.status(400).json(err("BAD_SIGNATURE", "Signature verification failed"));
    return;
  }
  const stored = await prisma.webhookEvent.upsert({ where: { gateway_eventId: { gateway: "stripe", eventId: event.id } }, update: {}, create: { gateway: "stripe", eventId: event.id, type: event.type, payload: event as object } });
  res.json({ received: true });
  if (stored.processedAt) return;
  try {
    let problem: string | undefined;
    if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        // Only the PaymentIntent we created for this order may settle it.
        const payment = await prisma.payment.findFirst({ where: { orderId, gateway: "stripe", gatewayOrderId: pi.id } });
        if (!payment) problem = "gateway_mismatch";
        else if (event.type === "payment_intent.succeeded") {
          const currency = pi.currency.toUpperCase();
          const r = await paymentsService.markPaid(orderId, { via: "stripe", gatewayPaymentId: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.id, method: pi.payment_method_types[0], raw: pi, paid: { amount: fromMinor(pi.amount_received, currency), currency } });
          problem = refusal(r.outcome);
        } else {
          const r = await paymentsService.markFailed(orderId, pi.last_payment_error?.message ?? "payment_failed", "stripe");
          problem = refusal(r.outcome);
        }
      }
    }
    await finish(stored.id, problem);
  } catch (e) {
    // Left unprocessed on purpose so Stripe's retry runs it again.
    await prisma.webhookEvent.update({ where: { id: stored.id }, data: { error: String(e).slice(0, 500) } }).catch(() => undefined);
    logger.error({ e, eventId: stored.id }, "stripe webhook processing failed");
  }
});

webhooksRouter.post("/jiopay", urlencoded({ extended: false }), raw({ type: "application/json" }), async (req, res) => {
  // Unconfigured integration → 503, never "verify with an empty key" (anyone can compute an HMAC keyed with "").
  if (!gatewaysConfigured.jiopay || !jiopayWebhookKey()) { res.status(503).json(err("JIOPAY_NOT_CONFIGURED", "JioPay is not configured")); return; }
  let body: Record<string, string>;
  try {
    const parsed: unknown = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString() || "{}") : (req.body ?? {});
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, v == null ? "" : String(v)]));
  } catch {
    res.status(400).json(err("BAD_PAYLOAD", "Unreadable payload"));
    return;
  }
  if (!verifyJioPaySignature(body, body.hash)) { res.status(400).json(err("BAD_SIGNATURE", "Signature verification failed")); return; }
  // Field names below (merchantOrderId, transactionId, status, amount, currency, paymentMode) mirror the checkout form —
  // match them to the JioPay integration document that comes with the credentials.
  const status = body.status ?? "unknown";
  const eventId = `${body.transactionId || body.merchantOrderId || Date.now()}:${status}`;
  const stored = await prisma.webhookEvent.upsert({ where: { gateway_eventId: { gateway: "jiopay", eventId } }, update: {}, create: { gateway: "jiopay", eventId, type: status, payload: body } });
  res.json({ received: true });
  if (stored.processedAt) return;
  try {
    const order = body.merchantOrderId ? await prisma.order.findUnique({ where: { number: body.merchantOrderId }, include: { payments: { orderBy: { createdAt: "asc" } } } }) : null;
    if (!order) { await finish(stored.id, "not_found"); return; }
    // Only orders that were actually sent to JioPay can be settled by a JioPay webhook.
    if (order.payments[0]?.gateway !== "jiopay") { await finish(stored.id, "gateway_mismatch"); return; }
    if (/^(success|captured|paid)$/i.test(status)) {
      // markPaid re-checks the amount/currency against the order under a row lock; a missing amount counts as a mismatch.
      const r = await paymentsService.markPaid(order.id, { via: "jiopay", gatewayPaymentId: body.transactionId || undefined, method: body.paymentMode, raw: body, paid: jiopayPaidAmount(body) });
      await finish(stored.id, refusal(r.outcome));
    } else {
      const r = await paymentsService.markFailed(order.id, status, "jiopay");
      await finish(stored.id, refusal(r.outcome));
    }
  } catch (e) {
    await prisma.webhookEvent.update({ where: { id: stored.id }, data: { error: String(e).slice(0, 500) } }).catch(() => undefined);
    logger.error({ e, eventId: stored.id }, "jiopay webhook processing failed");
  }
});

webhooksRouter.post("/shiprocket", raw({ type: "*/*" }), async (req, res) => {
  // Shiprocket lets you set one custom header on its webhook; we use `x-api-key` with a shared secret.
  if (!env.SHIPROCKET_WEBHOOK_TOKEN) { res.status(503).json(err("SHIPROCKET_WEBHOOK_NOT_CONFIGURED", "Shiprocket webhook token is not configured")); return; }
  const given = req.headers["x-api-key"];
  if (!safeEqual(Array.isArray(given) ? given[0] : given, env.SHIPROCKET_WEBHOOK_TOKEN)) { res.status(401).json(err("UNAUTHORIZED", "Invalid webhook token")); return; }
  // Tracking updates: stored for the worker; full mapping lands with the Shiprocket credentials.
  let payload: Record<string, string>;
  try {
    const parsed: unknown = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString() || "{}" : "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    payload = parsed as Record<string, string>;
  } catch {
    res.status(400).json(err("BAD_PAYLOAD", "Unreadable payload"));
    return;
  }
  const eventId = String(payload.awb ?? payload.order_id ?? Date.now()) + ":" + String(payload.current_status ?? "");
  await prisma.webhookEvent.upsert({ where: { gateway_eventId: { gateway: "shiprocket", eventId } }, update: {}, create: { gateway: "shiprocket", eventId, type: String(payload.current_status ?? "update"), payload } });
  res.json({ received: true });
});
