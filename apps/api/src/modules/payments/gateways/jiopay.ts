import { createHmac } from "node:crypto";
import { env } from "../../../config/env.js";
import type { PaymentGateway } from "./types.js";

/**
 * JioPay hosted checkout (India / INR).
 * The exact field names and hash recipe come from the JioPay Business integration document that
 * arrives with the merchant credentials — adjust `buildParams` / `sign` to that spec. The flow
 * (server-signed redirect → hosted page → return URL + signed webhook) does not change.
 */
function sign(params: Record<string, string>): string {
  const payload = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("|");
  return createHmac("sha256", env.JIOPAY_SECRET).update(payload).digest("hex");
}

export function buildJioPayForm(input: { orderNumber: string; amount: number; email: string; phone?: string | null; name: string; returnUrl: string }) {
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
  return { action: `${env.JIOPAY_BASE_URL}/checkout`, fields: { ...params, hash: sign(params) } };
}

export function verifyJioPaySignature(body: Record<string, string>, signature: string | undefined): boolean {
  if (!signature) return false;
  const { hash: _h, ...rest } = body;
  return sign(rest) === signature;
}

export const jiopayGateway: PaymentGateway = {
  name: "jiopay",
  async createPayment(input) {
    const form = buildJioPayForm(input);
    // The web app renders an auto-submitting form from this URL's query string.
    const qs = new URLSearchParams({ action: form.action, ...form.fields }).toString();
    return { gatewayOrderId: input.orderNumber, redirectUrl: `${env.WEB_ORIGIN}/checkout/redirect?${qs}`, clientSecret: null };
  },
  async fetchStatus() {
    // TODO: call JioPay Status Check API once credentials/doc are in hand.
    return { status: "pending" };
  },
};
