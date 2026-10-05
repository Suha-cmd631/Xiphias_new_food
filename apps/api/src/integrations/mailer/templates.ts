import type { Order, OrderLine, Lead, NewsletterSubscriber } from "@prisma/client";
import { env } from "../../config/env.js";
import { format, n } from "../../shared/money.js";

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1d1d1d">
<div style="max-width:600px;margin:0 auto;padding:32px 20px">
  <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#4a6b1f;font-weight:700">Xiphias Superfoods</div>
  <h1 style="font-size:26px;margin:12px 0 20px">${title}</h1>
  <div style="background:#fff;border-radius:16px;padding:24px;font-size:15px;line-height:1.6">${body}</div>
  <p style="font-size:12px;color:#777;margin-top:24px">XIPHIAS SuperFoods · 1st Floor, JK Nirmala Arcade, Plot 780, 80 Feet Rd, Koramangala, Bengaluru 560034 · info@xiphias.in</p>
</div></body></html>`;

const lines = (o: Order & { lines: OrderLine[] }) =>
  `<table style="width:100%;border-collapse:collapse">${o.lines
    .map((l) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${l.productName} <span style="color:#777">· ${l.variantTitle} × ${l.qty}</span></td><td style="text-align:right;border-bottom:1px solid #eee">${format(n(l.lineTotal), o.currency)}</td></tr>`)
    .join("")}
  <tr><td style="padding:8px 0">Subtotal</td><td style="text-align:right">${format(n(o.subtotal), o.currency)}</td></tr>
  ${n(o.discountTotal) ? `<tr><td>Discount${o.couponCode ? ` (${o.couponCode})` : ""}</td><td style="text-align:right">−${format(n(o.discountTotal), o.currency)}</td></tr>` : ""}
  <tr><td>Shipping</td><td style="text-align:right">${format(n(o.shippingTotal), o.currency)}</td></tr>
  <tr><td style="padding-top:8px;font-weight:700">Total</td><td style="text-align:right;font-weight:700">${format(n(o.grandTotal), o.currency)}</td></tr></table>`;

export const templates = {
  orderConfirmation: (o: Order & { lines: OrderLine[] }) => ({
    subject: `Order ${o.number} confirmed — thank you!`,
    html: shell(`Thanks for your order, ${(o.shippingAddress as { firstName?: string }).firstName ?? ""}`, `<p>We've received your payment for order <b>${o.number}</b>. We'll email you again with tracking as soon as it ships.</p>${lines(o)}<p style="margin-top:20px"><a href="${env.WEB_ORIGIN}/track" style="background:#1d1d1d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Track your order</a></p>`),
  }),
  adminNewOrder: (o: Order & { lines: OrderLine[] }) => ({
    subject: `New order ${o.number} · ${format(n(o.grandTotal), o.currency)} · ${o.regionCode}`,
    html: shell(`New order ${o.number}`, `<p>${o.email} · ${o.regionCode} · ${(o.shippingMethod as { name?: string } | null)?.name ?? ""}</p>${lines(o)}`),
  }),
  paymentFailed: (o: Order) => ({
    subject: `Payment for ${o.number} didn't go through`,
    html: shell("Payment unsuccessful", `<p>Your payment for order <b>${o.number}</b> was not completed, so nothing was charged and the order was cancelled. You can place the order again any time.</p><p><a href="${env.WEB_ORIGIN}/shop">Back to the shop</a></p>`),
  }),
  leadNotify: (l: Lead) => ({
    subject: `[${l.source === "b2b_quote" ? "B2B quote" : "Contact"}] ${l.reference} — ${l.company ?? l.name}`,
    html: shell(`${l.reference}: ${l.name}`, `<p><b>${l.company ?? ""}</b><br>${l.email} · ${l.phone ?? ""} · ${l.country ?? ""}</p><p>Interest: ${l.interest ?? "-"}<br>Products: ${l.products.join(", ") || "-"}<br>Volume: ${l.volume ?? "-"}</p><p>${(l.message ?? "").replace(/\n/g, "<br>")}</p>`),
  }),
  leadAck: (l: Lead) => ({
    subject: `We received your message (${l.reference})`,
    html: shell(`Thanks, ${l.name.split(" ")[0]}`, `<p>Your ${l.source === "b2b_quote" ? "quote request" : "message"} has reached our team in Bengaluru. Reference <b>${l.reference}</b>. We reply within one business day.</p>`),
  }),
  newsletterConfirm: (s: NewsletterSubscriber) => ({
    subject: "Confirm your subscription",
    html: shell("One more step", `<p>Please confirm you'd like wellness tips, recipes and subscriber-only offers from Xiphias Superfoods.</p><p><a href="${env.PUBLIC_API_URL}/api/v1/newsletter/confirm/${s.token}" style="background:#1d1d1d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Confirm subscription</a></p><p style="color:#777;font-size:13px">If you didn't request this, ignore this email.</p>`),
  }),
};
