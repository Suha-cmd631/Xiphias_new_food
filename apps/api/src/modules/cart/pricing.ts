import type { Coupon } from "@prisma/client";
import { n, round2 } from "../../shared/money.js";

export type PricedLine = { variantId: string; qty: number; unitPrice: number; weightGrams: number };

/** Pure pricing rules — unit-tested, shared by cart display and checkout. The backend is authoritative. */
export function couponDiscount(coupon: Coupon | null, lines: PricedLine[], regionCode: string): { amount: number; reason?: string } {
  if (!coupon) return { amount: 0 };
  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) return { amount: 0, reason: "Coupon not active yet" };
  if (coupon.endsAt && coupon.endsAt.getTime() < now) return { amount: 0, reason: "Coupon expired" };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return { amount: 0, reason: "Coupon fully redeemed" };
  if (coupon.regions.length && !coupon.regions.includes(regionCode)) return { amount: 0, reason: "Coupon not valid in your region" };
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const qty = lines.reduce((s, l) => s + l.qty, 0);
  if (coupon.minSubtotal != null && subtotal < n(coupon.minSubtotal)) return { amount: 0, reason: `Spend ${n(coupon.minSubtotal)} or more to use this coupon` };
  if (coupon.minQty != null && qty < coupon.minQty) return { amount: 0, reason: `Add ${coupon.minQty - qty} more pack(s) to unlock ${coupon.code}` };
  if (coupon.type === "percent") return { amount: round2((subtotal * n(coupon.value)) / 100) };
  if (coupon.type === "fixed") return { amount: Math.min(subtotal, n(coupon.value)) };
  return { amount: 0 }; // free_shipping handled at shipping stage
}

export function totals(lines: PricedLine[], discount: number, shipping: number, taxMode: "inclusive" | "exclusive" | "dap") {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.qty, 0));
  // Prices are fixed per region: India inclusive of GST, US has no sales-tax nexus yet, others DAP (duties collected by carrier).
  const tax = taxMode === "exclusive" ? 0 : 0;
  const grandTotal = round2(Math.max(0, subtotal - discount) + shipping + tax);
  return { subtotal, discount: round2(discount), shipping: round2(shipping), tax, grandTotal };
}

/**
 * Per-customer coupon rules (pure). The Coupon table has no per-customer columns yet, so the two flags live here:
 * - first-order coupons (WELCOME10) are refused once that email has a paid order;
 * - every coupon is single-use per email unless it is explicitly multi-use (BULKSAVE, a standing volume discount).
 * Override without a deploy via the SiteSetting row `coupon_rules` = { "firstOrderOnly": [...], "multiUse": [...] }.
 * Drop 2 (admin) should turn these into Coupon columns.
 */
export type CouponRules = { firstOrderOnly: string[]; multiUse: string[] };
export const DEFAULT_COUPON_RULES: CouponRules = { firstOrderOnly: ["WELCOME10"], multiUse: ["BULKSAVE"] };

export function parseCouponRules(value: unknown): CouponRules {
  const v = (value ?? {}) as { firstOrderOnly?: unknown; multiUse?: unknown };
  const codes = (x: unknown, fallback: string[]) => (Array.isArray(x) ? x.filter((c): c is string => typeof c === "string").map((c) => c.toUpperCase()) : fallback);
  return { firstOrderOnly: codes(v.firstOrderOnly, DEFAULT_COUPON_RULES.firstOrderOnly), multiUse: codes(v.multiUse, DEFAULT_COUPON_RULES.multiUse) };
}

/** What this email has done before: paid orders overall, and orders (paid, or still awaiting payment) that used this coupon. */
export type CouponHistory = { paidOrders: number; usesOfThisCoupon: number };

export function couponEligibility(code: string, history: CouponHistory, rules: CouponRules = DEFAULT_COUPON_RULES): { ok: boolean; reason?: string } {
  const c = code.toUpperCase();
  if (rules.firstOrderOnly.includes(c) && history.paidOrders > 0) return { ok: false, reason: `${c} is for first orders only, and this email has already ordered with us` };
  if (!rules.multiUse.includes(c) && history.usesOfThisCoupon > 0) return { ok: false, reason: `${c} has already been used with this email` };
  return { ok: true };
}
