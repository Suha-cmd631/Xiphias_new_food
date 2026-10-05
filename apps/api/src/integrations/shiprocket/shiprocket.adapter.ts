import { env } from "../../config/env.js";
import { unavailable } from "../../shared/errors.js";

/**
 * Shiprocket (India) / Shiprocket X (international). Methods throw 503 SHIPROCKET_NOT_CONFIGURED
 * until credentials exist; the worker leaves `shipping.create` jobs pending and retries.
 * Endpoints per Shiprocket API v1: /auth/login, /courier/serviceability, /orders/create/adhoc, /courier/assign/awb.
 */
const BASE = "https://apiv2.shiprocket.in/v1/external";
let tokenCache: { token: string; at: number } | null = null;

async function token(): Promise<string> {
  if (tokenCache && Date.now() - tokenCache.at < 8 * 3600_000) return tokenCache.token;
  const r = await fetch(`${BASE}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: env.SHIPROCKET_EMAIL, password: env.SHIPROCKET_PASSWORD }) });
  if (!r.ok) throw new Error(`shiprocket auth ${r.status}`);
  const j = (await r.json()) as { token: string };
  tokenCache = { token: j.token, at: Date.now() };
  return j.token;
}

export const shiprocket = {
  get configured() {
    return Boolean(env.SHIPROCKET_EMAIL && env.SHIPROCKET_PASSWORD);
  },
  async serviceability(input: { deliveryPostcode: string; weightKg: number; codAmount: number }) {
    if (!this.configured) throw unavailable("SHIPROCKET_NOT_CONFIGURED", "Shiprocket credentials missing");
    const q = new URLSearchParams({ pickup_postcode: "560034", delivery_postcode: input.deliveryPostcode, weight: String(input.weightKg), cod: input.codAmount ? "1" : "0" });
    const r = await fetch(`${BASE}/courier/serviceability/?${q}`, { headers: { authorization: `Bearer ${await token()}` } });
    const j = (await r.json()) as { data?: { available_courier_companies?: { courier_company_id: number; courier_name: string; rate: number; estimated_delivery_days: string }[] } };
    return (j.data?.available_courier_companies ?? []).slice(0, 3).map((c) => ({ courierId: c.courier_company_id, courierName: c.courier_name, rate: c.rate, etdDays: Number(c.estimated_delivery_days) || 4 }));
  },
  async createOrder(payload: Record<string, unknown>) {
    if (!this.configured) throw unavailable("SHIPROCKET_NOT_CONFIGURED", "Shiprocket credentials missing");
    const r = await fetch(`${BASE}/orders/create/adhoc`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${await token()}` }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`shiprocket create ${r.status}: ${await r.text()}`);
    return (await r.json()) as { order_id: number; shipment_id: number; awb_code?: string };
  },
};
