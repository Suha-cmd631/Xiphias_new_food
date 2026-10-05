import { Router, raw, urlencoded } from "express";
import { env } from "../../config/env.js";
import { prisma } from "../../shared/prisma.js";
import { logger } from "../../shared/logger.js";
import { stripeClient } from "../payments/gateways/stripe.js";
import { verifyJioPaySignature } from "../payments/gateways/jiopay.js";
import { paymentsService } from "../payments/payments.service.js";

/** Webhooks: verify signature → persist event (idempotent) → 2xx → process. Raw body parsers are mounted here, before JSON. */
export const webhooksRouter = Router();

webhooksRouter.post("/stripe", raw({ type: "application/json" }), async (req, res) => {
  if (!stripeClient || !env.STRIPE_WEBHOOK_SECRET) { res.status(503).json({ error: { code: "STRIPE_NOT_CONFIGURED" } }); return; }
  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body as Buffer, req.headers["stripe-signature"] as string, env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    logger.warn({ e }, "stripe signature failed");
    res.status(400).send("bad signature");
    return;
  }
  const stored = await prisma.webhookEvent.upsert({ where: { gateway_eventId: { gateway: "stripe", eventId: event.id } }, update: {}, create: { gateway: "stripe", eventId: event.id, type: event.type, payload: event as object } });
  res.json({ received: true });
  if (stored.processedAt) return;
  try {
    if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        if (event.type === "payment_intent.succeeded") await paymentsService.markPaid(orderId, { gatewayPaymentId: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.id, method: pi.payment_method_types[0], raw: pi });
        else await paymentsService.markFailed(orderId, pi.last_payment_error?.message ?? "payment_failed");
      }
    }
    await prisma.webhookEvent.update({ where: { id: stored.id }, data: { processedAt: new Date() } });
  } catch (e) {
    await prisma.webhookEvent.update({ where: { id: stored.id }, data: { error: String(e) } });
  }
});

webhooksRouter.post("/jiopay", urlencoded({ extended: false }), raw({ type: "application/json" }), async (req, res) => {
  const body = (Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString() || "{}") : req.body) as Record<string, string>;
  if (!verifyJioPaySignature(body, body.hash)) { res.status(400).send("bad signature"); return; }
  const eventId = body.transactionId ?? body.merchantOrderId ?? String(Date.now());
  const stored = await prisma.webhookEvent.upsert({ where: { gateway_eventId: { gateway: "jiopay", eventId } }, update: {}, create: { gateway: "jiopay", eventId, type: body.status ?? "unknown", payload: body } });
  res.json({ received: true });
  if (stored.processedAt) return;
  const order = await prisma.order.findUnique({ where: { number: body.merchantOrderId ?? "" } });
  if (order) {
    const ok = /^(success|captured|paid)$/i.test(body.status ?? "");
    if (ok) await paymentsService.markPaid(order.id, { gatewayPaymentId: body.transactionId, method: body.paymentMode, raw: body });
    else await paymentsService.markFailed(order.id, body.status ?? "failed");
  }
  await prisma.webhookEvent.update({ where: { id: stored.id }, data: { processedAt: new Date() } });
});

webhooksRouter.post("/shiprocket", raw({ type: "*/*" }), async (req, res) => {
  // Tracking updates: stored for the worker; full mapping lands with the Shiprocket credentials.
  const payload = JSON.parse((req.body as Buffer).toString() || "{}") as Record<string, string>;
  await prisma.webhookEvent.create({ data: { gateway: "shiprocket", eventId: String(payload.awb ?? payload.order_id ?? Date.now()) + ":" + String(payload.current_status ?? ""), type: String(payload.current_status ?? "update"), payload } });
  res.json({ received: true });
});
