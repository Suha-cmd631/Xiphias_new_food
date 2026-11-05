import type { Order, OrderLine, Lead, NewsletterSubscriber } from "@prisma/client";
import { env } from "../../config/env.js";
import { format, n } from "../../shared/money.js";
import { esc, escMultiline, subjectText } from "./escape.js";

/**
 * Every value that originates from a visitor (names, addresses, messages, coupon codes, notes…) is passed
 * through esc() before it reaches HTML, and through subjectText() before it reaches a subject line.
 * `title` and `body` given to shell() must already be safe HTML.
 */
const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1d1d1d">
<div style="max-width:600px;margin:0 auto;padding:32px 20px">
  <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#4a6b1f;font-weight:700">Xiphias Superfoods</div>
  <h1 style="font-size:26px;margin:12px 0 20px">${title}</h1>
  <div style="background:#fff;border-radius:16px;padding:24px;font-size:15px;line-height:1.6">${body}</div>
  <p style="font-size:12px;color:#777;margin-top:24px">XIPHIAS SuperFoods · 1st Floor, JK Nirmala Arcade, Plot 780, 80 Feet Rd, Koramangala, Bengaluru 560034 · info@xiphias.in</p>
</div></body></html>`;

const lines = (o: Order & { lines: OrderLine[] }) =>
  `<table style="width:100%;border-collapse:collapse">${o.lines
    .map((l) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(l.productName)} <span style="color:#777">· ${esc(l.variantTitle)} × ${esc(l.qty)}</span></td><td style="text-align:right;border-bottom:1px solid #eee">${esc(format(n(l.lineTotal), o.currency))}</td></tr>`)
    .join("")}
  <tr><td style="padding:8px 0">Subtotal</td><td style="text-align:right">${esc(format(n(o.subtotal), o.currency))}</td></tr>
  ${n(o.discountTotal) ? `<tr><td>Discount${o.couponCode ? ` (${esc(o.couponCode)})` : ""}</td><td style="text-align:right">−${esc(format(n(o.discountTotal), o.currency))}</td></tr>` : ""}
  <tr><td>Shipping</td><td style="text-align:right">${esc(format(n(o.shippingTotal), o.currency))}</td></tr>
  <tr><td style="padding-top:8px;font-weight:700">Total</td><td style="text-align:right;font-weight:700">${esc(format(n(o.grandTotal), o.currency))}</td></tr></table>`;

const REVIEW_REASONS: Record<string, string> = {
  paid_after_cancel: "A payment arrived for this order AFTER it had been cancelled / had expired. The order was NOT re-opened and its stock is back on sale. Please refund the customer at the payment gateway, or re-create the order by hand if the items are still available.",
  amount_mismatch: "The payment gateway reported an amount or currency that does not match this order. The order was NOT marked as paid. Please check the transaction at the gateway and either refund it or settle the order by hand.",
};

export const templates = {
  orderConfirmation: (o: Order & { lines: OrderLine[] }) => ({
    subject: subjectText(`Order ${o.number} confirmed — thank you!`),
    html: shell(`Thanks for your order, ${esc((o.shippingAddress as { firstName?: string }).firstName ?? "")}`, `<p>We've received your payment for order <b>${esc(o.number)}</b>. We'll email you again with tracking as soon as it ships.</p>${lines(o)}<p style="margin-top:20px"><a href="${esc(env.WEB_ORIGIN)}/track" style="background:#1d1d1d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Track your order</a></p>`),
  }),
  adminNewOrder: (o: Order & { lines: OrderLine[] }) => ({
    subject: subjectText(`New order ${o.number} · ${format(n(o.grandTotal), o.currency)} · ${o.regionCode}`),
    html: shell(`New order ${esc(o.number)}`, `<p>${esc(o.email)} · ${esc(o.regionCode)} · ${esc((o.shippingMethod as { name?: string } | null)?.name ?? "")}</p>${lines(o)}${o.notes ? `<p><b>Customer note:</b><br>${escMultiline(o.notes)}</p>` : ""}`),
  }),
  paymentFailed: (o: Order) => ({
    subject: subjectText(`Payment for ${o.number} didn't go through`),
    html: shell("Payment unsuccessful", `<p>Your payment for order <b>${esc(o.number)}</b> was not completed, so the order was cancelled. You can place the order again any time.</p><p>If money did leave your account, reply to this email and we will sort it out.</p><p><a href="${esc(env.WEB_ORIGIN)}/shop">Back to the shop</a></p>`),
  }),
  /** To the team: money and order state disagree — a human must refund or settle. */
  paymentReview: (o: Order, reason: string) => ({
    subject: subjectText(`[ACTION NEEDED] Payment review for order ${o.number} — refund or manual check`),
    html: shell(`Payment needs review: ${esc(o.number)}`, `<p>${esc(REVIEW_REASONS[reason] ?? `Reason: ${reason}`)}</p><p>Order <b>${esc(o.number)}</b> · ${esc(o.email)} · ${esc(format(n(o.grandTotal), o.currency))} · order status <b>${esc(o.status)}</b> / payment status <b>${esc(o.paymentStatus)}</b></p><p style="color:#777;font-size:13px">Reason code: ${esc(reason)}. Details are stored on the order's Payment record.</p>`),
  }),
  leadNotify: (l: Lead) => ({
    subject: subjectText(`[${l.source === "b2b_quote" ? "B2B quote" : "Contact"}] ${l.reference} — ${l.company ?? l.name}`),
    html: shell(`${esc(l.reference)}: ${esc(l.name)}`, `<p><b>${esc(l.company ?? "")}</b><br>${esc(l.email)} · ${esc(l.phone ?? "")} · ${esc(l.country ?? "")}</p><p>Interest: ${esc(l.interest ?? "-")}<br>Products: ${esc(l.products.join(", ") || "-")}<br>Volume: ${esc(l.volume ?? "-")}</p><p>${escMultiline(l.message ?? "")}</p>`),
  }),
  /**
   * Acknowledgement to the address typed into the form. Deliberately generic: it contains NOTHING the visitor
   * typed (no name, subject or message), only our own reference — otherwise the form could be used to send
   * arbitrary text to arbitrary people from our domain.
   */
  leadAck: (l: Lead) => ({
    subject: subjectText(`We received your message (${l.reference})`),
    html: shell("Thanks for getting in touch", `<p>Your ${l.source === "b2b_quote" ? "quote request" : "message"} has reached our team in Bengaluru. Reference <b>${esc(l.reference)}</b>. We reply within one business day.</p><p style="color:#777;font-size:13px">If you didn't contact Xiphias Superfoods, you can ignore this email.</p>`),
  }),
  newsletterConfirm: (s: NewsletterSubscriber) => ({
    subject: "Confirm your subscription",
    html: shell("One more step", `<p>Please confirm you'd like wellness tips, recipes and subscriber-only offers from Xiphias Superfoods.</p><p><a href="${esc(env.PUBLIC_API_URL)}/api/v1/newsletter/confirm/${encodeURIComponent(s.token)}" style="background:#1d1d1d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">Confirm subscription</a></p><p style="color:#777;font-size:13px">If you didn't request this, ignore this email.</p>`),
  }),
};
