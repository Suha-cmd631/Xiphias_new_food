/**
 * Outbox worker: delivers emails / courier bookings written by request handlers, with retries,
 * and releases inventory for checkouts that were never paid. Runs as its own process (`pnpm dev:worker`).
 * Drop 2 moves this onto BullMQ/Redis for horizontal scale; the Outbox table and handlers stay the same.
 */
import { prisma } from "./shared/prisma.js";
import { logger } from "./shared/logger.js";
import { mailer } from "./integrations/mailer/mailer.js";
import { templates } from "./integrations/mailer/templates.js";
import { shiprocket } from "./integrations/shiprocket/shiprocket.adapter.js";
import { paymentsService } from "./modules/payments/payments.service.js";
import { env } from "./config/env.js";

type Handler = (payload: Record<string, string>) => Promise<void>;

const orderWithLines = (id: string) => prisma.order.findUniqueOrThrow({ where: { id }, include: { lines: true } });

const handlers: Record<string, Handler> = {
  "email.order_confirmation": async ({ orderId }) => { const o = await orderWithLines(orderId!); await mailer.send({ to: o.email, ...templates.orderConfirmation(o) }); },
  "email.admin_new_order": async ({ orderId }) => { const o = await orderWithLines(orderId!); await mailer.send({ to: env.ADMIN_NOTIFY_EMAIL, ...templates.adminNewOrder(o) }); },
  "email.payment_failed": async ({ orderId }) => { const o = await prisma.order.findUniqueOrThrow({ where: { id: orderId! } }); await mailer.send({ to: o.email, ...templates.paymentFailed(o) }); },
  "email.lead_notify": async ({ leadId }) => { const l = await prisma.lead.findUniqueOrThrow({ where: { id: leadId! } }); await mailer.send({ to: env.ADMIN_NOTIFY_EMAIL, ...templates.leadNotify(l) }); },
  "email.lead_ack": async ({ leadId }) => { const l = await prisma.lead.findUniqueOrThrow({ where: { id: leadId! } }); await mailer.send({ to: l.email, ...templates.leadAck(l) }); },
  "email.newsletter_confirm": async ({ subscriberId }) => { const s = await prisma.newsletterSubscriber.findUniqueOrThrow({ where: { id: subscriberId! } }); await mailer.send({ to: s.email, ...templates.newsletterConfirm(s) }); },
  "shipping.create": async ({ orderId }) => {
    const o = await orderWithLines(orderId!);
    const method = o.shippingMethod as { carrier?: string } | null;
    if (method?.carrier === "Pickup") { await prisma.shipment.upsert({ where: { orderId: o.id }, update: {}, create: { orderId: o.id, carrier: "Pickup", status: "ready_for_pickup" } }); return; }
    if (!shiprocket.configured) {
      // Keep a placeholder shipment so the order desk sees it; the job stays retryable once credentials arrive.
      await prisma.shipment.upsert({ where: { orderId: o.id }, update: {}, create: { orderId: o.id, carrier: method?.carrier ?? "Shiprocket", status: "awaiting_booking" } });
      return;
    }
    const a = o.shippingAddress as Record<string, string>;
    const r = await shiprocket.createOrder({
      order_id: o.number, order_date: o.placedAt.toISOString().slice(0, 10), pickup_location: env.SHIPROCKET_PICKUP_LOCATION,
      billing_customer_name: a.firstName, billing_last_name: a.lastName, billing_address: a.line1, billing_address_2: a.line2, billing_city: a.city, billing_pincode: a.postalCode, billing_state: a.state, billing_country: a.countryCode, billing_email: o.email, billing_phone: a.phone, shipping_is_billing: true,
      order_items: o.lines.map((l) => ({ name: `${l.productName} ${l.variantTitle}`, sku: l.sku, units: l.qty, selling_price: Number(l.unitPrice), hsn: l.hsCode })),
      payment_method: "Prepaid", sub_total: Number(o.grandTotal), length: 20, breadth: 15, height: 10, weight: Math.max(0.5, o.lines.reduce((s, l) => s + l.weightGrams * l.qty, 0) / 1000),
    });
    await prisma.shipment.upsert({ where: { orderId: o.id }, update: { awb: r.awb_code ?? null, status: "booked" }, create: { orderId: o.id, carrier: "Shiprocket", awb: r.awb_code ?? null, status: "booked" } });
  },
};

async function processBatch() {
  const jobs = await prisma.outbox.findMany({ where: { status: { in: ["pending", "failed"] }, nextAttemptAt: { lte: new Date() }, attempts: { lt: 8 } }, orderBy: { createdAt: "asc" }, take: 20 });
  for (const job of jobs) {
    const claimed = await prisma.outbox.updateMany({ where: { id: job.id, status: job.status }, data: { status: "processing" } });
    if (claimed.count === 0) continue;
    const handler = handlers[job.type];
    try {
      if (!handler) throw new Error(`no handler for ${job.type}`);
      await handler(job.payload as Record<string, string>);
      await prisma.outbox.update({ where: { id: job.id }, data: { status: "done", processedAt: new Date(), attempts: { increment: 1 } } });
      logger.info({ id: job.id, type: job.type }, "outbox delivered");
    } catch (e) {
      const attempts = job.attempts + 1;
      const backoff = Math.min(60 * 60, 2 ** attempts * 15); // 30s, 60s, 2m … max 1h
      await prisma.outbox.update({ where: { id: job.id }, data: { status: "failed", attempts, lastError: String(e).slice(0, 500), nextAttemptAt: new Date(Date.now() + backoff * 1000) } });
      logger.warn({ id: job.id, type: job.type, attempts, err: String(e) }, "outbox retry scheduled");
    }
  }
  return jobs.length;
}

async function loop() {
  logger.info({ mail: mailer.configured ? "smtp" : "NOT CONFIGURED", shiprocket: shiprocket.configured ? "live" : "placeholder shipments" }, "worker started");
  let tick = 0;
  for (;;) {
    try {
      await processBatch();
      if (tick++ % 20 === 0) {
        const n = await paymentsService.expireUnpaid(20);
        if (n) logger.info({ n }, "released reservations of unpaid orders");
      }
    } catch (e) {
      logger.error({ e }, "worker loop error");
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}
loop();
