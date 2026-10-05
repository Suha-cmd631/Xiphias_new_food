import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const LOCALE: Record<string, string> = { INR: "en-IN", EUR: "de-DE", GBP: "en-GB", USD: "en-US", CAD: "en-CA", AED: "en-AE" };
/** Same rules as the API's money formatter, for totals worked out in the browser (qty × price). */
export function formatMoney(amount: number, currency: string) {
  const whole = currency === "INR" && Number.isInteger(amount);
  return new Intl.NumberFormat(LOCALE[currency] ?? "en", { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
}
