import { createHmac } from "node:crypto";
import { env } from "../../../config/env.js";
import { safeEqual } from "../../../shared/secure.js";
import type { PaidAmount, PaymentGateway } from "./types.js";

/**
 * JioPay hosted checkout (India / INR).
 * The exact field names and hash recipe come from the JioPay Business integration document that
 * arrives with the merchant credentials — adjust `buildParams` / `sign` to that spec. The flow
 * (server-signed redirect → hosted page → return URL + signed webhook) does not change.
 */
function sign(params: Record<string, string>, key: string): string {
  const payload = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("|");
  return createHmac("sha256", key).update(payload).digest("hex");
}

/** Key for verifying webhooks: the dedicated webhook secret when JioPay issues one, else the merchant secret. Empty = not configured. */
export const jiopayWebhookKey = () => env.JIOPAY_WEBHOOK_SECRET || env.JIOPAY_SECRET;

export function buildJioPayForm(input: { orderNumber: string; amount: number; email: string; phone?: string | null; name: string; returnUrl: string }) {
  if (!env.JIOPAY_SECRET) throw new Error("JioPay not configured");
  const params: Record<string, string> = {
    merchantId: env.JIOPAY_MERCHANT_ID,
    merchantOrderId: input.orderNumber,
    amount: input.amount.toFixed(2),
    currency: "INR",
    customerEmail: input.email,
    customerPhone: input.phone ?? "",
    customerName: input.name,
    returnUrl: input.returnUrl,
    webhookUrl: `${env.PUBLIC_API_URL}/api/v1/webhooks/jiopay`,
  };
  return { action: `${env.JIOPAY_BASE_URL}/checkout`, fields: { ...params, hash: sign(params, env.JIOPAY_SECRET) } };
}

/**
 * Verifies the webhook hash. An empty key NEVER verifies (an HMAC keyed with "" can be computed by anyone),
 * and the comparison is constant-time.
 */
export function verifyJioPaySignature(body: Record<string, string>, signature: string | undefined, key: string = jiopayWebhookKey()): boolean {
  if (!key || !signature) return false;
  const { hash: _h, ...rest } = body;
  return safeEqual(signature.toLowerCase(), sign(rest, key));
}

/**
 * Amount + currency reported by the webhook (same `amount` / `currency` fields we send in the checkout form —
 * match to the integration doc). Returns null when either is missing or not a number, which the caller
 * treats as a mismatch: an order is never marked paid without a verified amount.
 */
export function jiopayPaidAmount(body: Record<string, string>): PaidAmount | null {
  const amount = Number(body.amount);
  const currency = (body.currency ?? "").toUpperCase();
  if (body.amount == null || body.amount === "" || !Number.isFinite(amount) || !currency) return null;
  return { amount, currency };
}

export const jiopayGateway: PaymentGateway = {
  name: "jiopay",
  async createPayment(input) {
    const form = buildJioPayForm(input);
    // The web app renders an auto-submitting form from this URL's query string
    // (it only posts to origins listed in its PAYMENT_REDIRECT_ORIGINS — keep that equal to JIOPAY_BASE_URL's origin).
    const qs = new URLSearchParams({ action: form.action, ...form.fields }).toString();
    return { gatewayOrderId: input.orderNumber, redirectUrl: `${env.WEB_ORIGIN}/checkout/redirect?${qs}`, clientSecret: null };
  },
  async fetchStatus() {
    // TODO: call JioPay Status Check API once credentials/doc are in hand.
    return { status: "pending" };
  },
};
