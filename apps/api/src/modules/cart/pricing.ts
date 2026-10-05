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
