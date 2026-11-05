import { formatMoney } from "@/lib/utils";

/**
 * "₹580 per 100 g" / "$5.98 per 100 ml" for a pack. Returns null (caller renders nothing) unless the pack title
 * states a metric size that agrees with the stored weight — the API falls back to a default weight for odd titles,
 * and a unit price built on a default would be wrong.
 */
export function unitPrice(v: { title: string; weightGrams: number; price: { amount: number; currency: string } }): string | null {
  const m = v.title.match(/([\d.]+)\s*(kg|g|ml|l)\b/i);
  if (!m || !(v.weightGrams > 0) || !(v.price.amount > 0)) return null;
  const n = parseFloat(m[1]!);
  const u = m[2]!.toLowerCase();
  const stated = Math.round(u === "kg" || u === "l" ? n * 1000 : n);
  if (stated !== v.weightGrams || stated === 100) return null; // a 100 g / 100 ml pack: the price already is the unit price
  const per100 = Math.round((v.price.amount / v.weightGrams) * 100 * 100) / 100;
  return `${formatMoney(per100, v.price.currency)} per 100 ${u === "ml" || u === "l" ? "ml" : "g"}`;
}
