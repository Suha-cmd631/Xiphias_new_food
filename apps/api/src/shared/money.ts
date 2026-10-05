import { Prisma } from "@prisma/client";
import type { Money } from "@xsf/contracts";

const LOCALE: Record<string, string> = { INR: "en-IN", EUR: "de-DE", GBP: "en-GB", USD: "en-US", CAD: "en-CA", AED: "en-AE" };
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP", "ISK", "HUF"]);

export const n = (d: Prisma.Decimal | number | string | null | undefined): number =>
  d == null ? 0 : typeof d === "number" ? d : Number(d.toString());

export const round2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function format(amount: number, currency: string): string {
  // Rupee prices are whole numbers in practice — "₹600" reads cleaner than "₹600.00". Paise still show when present.
  const whole = currency === "INR" && Number.isInteger(amount);
  return new Intl.NumberFormat(LOCALE[currency] ?? "en", { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}

export const money = (amount: number | Prisma.Decimal, currency: string): Money => {
  const a = round2(n(amount));
  return { amount: a, currency, formatted: format(a, currency) };
};

/** Minor units for gateways (Stripe wants integer cents; INR paise). */
export const toMinor = (amount: number, currency: string) => (ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100));
export const dec = (x: number) => new Prisma.Decimal(round2(x).toFixed(2));
