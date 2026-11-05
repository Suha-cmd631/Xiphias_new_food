/**
 * US / Canada market rules shared by the /us and /ca landing pages and the Google Shopping feed.
 *
 * LEGAL SWITCH — selling food as "organic" in the United States needs USDA NOP certification (Canada has the
 * equivalent COR rule). Until that is confirmed in writing, every US/CA page and the US feed must avoid the word,
 * including inside product names. Flip it on later by setting NEXT_PUBLIC_US_ORGANIC_OK=true in the web env
 * (no code change); product names then appear exactly as stored.
 */
export const US_ORGANIC_CLAIM_OK = process.env.NEXT_PUBLIC_US_ORGANIC_OK === "true";

export type MarketCode = "us" | "ca";

export const MARKETS = {
  us: { code: "us", region: "US", country: "United States", short: "US", hreflang: "en-US", currency: "USD", currencyName: "US dollars", selling: true },
  ca: { code: "ca", region: "CA", country: "Canada", short: "Canada", hreflang: "en-CA", currency: "CAD", currencyName: "Canadian dollars", selling: false },
} as const satisfies Record<MarketCode, { code: MarketCode; region: "US" | "CA"; country: string; short: string; hreflang: string; currency: string; currencyName: string; selling: boolean }>;

/** The two sentences we are allowed to say about delivery. Nothing here promises a price, a time or duties. */
export const US_SHIPPING_NOTE = "Orders to the United States ship from Bengaluru, India by tracked courier. The delivery cost is shown at checkout. US import duties and taxes are not included in our prices; where they apply, the courier collects them before delivery.";
export const CA_NOTICE = "We do not take orders for delivery to Canada yet.";

/** Product name as it may be shown to US / Canadian shoppers: drops a leading "Organic " / "Premium Organic " (and any stray use of the word). */
export function marketName(name: string): string {
  if (US_ORGANIC_CLAIM_OK) return name;
  const cleaned = name
    .replace(/^\s*(premium\s+)?organic\s+/i, "")
    .replace(/\b(certified\s+)?organic\b[\s-]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : name;
}

// Words that turn a food description into an organic claim, a health/disease claim or a nutrient-content claim.
const ORGANIC = /\borganic/i;
const CLAIMS = /\b(antioxidant|immun|heart|skin|metaboli|digest|wellness|vitality|detox|cure|prevent|weight|diabet|blood|cholesterol|health|nutri|energy|relax|alert|protein|rich in|support|boost|benefit|superfood)/i;

/** True when stored text is safe to repeat on a US / CA surface (no organic wording unless allowed, no health claims). */
export function isMarketSafe(text: string | null | undefined): text is string {
  if (!text) return false;
  if (!US_ORGANIC_CLAIM_OK && ORGANIC.test(text)) return false;
  return !CLAIMS.test(text);
}

/** A plain sentence built only from catalogue fields, used whenever the stored description is not market-safe. */
export function neutralDescription(p: { name: string; category: { name: string }; origin: string | null }, pack?: string): string {
  const bits = [`${marketName(p.name)} from the Xiphias ${p.category.name.toLowerCase()} range`];
  if (p.origin) bits.push(`origin: ${p.origin}`);
  if (pack) bits.push(`${pack} pack`);
  return bits.join(", ") + ". Shipped from Bengaluru, India.";
}

/** Stored description when it passes the guard-rails, otherwise the neutral sentence. */
export const marketDescription = (p: { name: string; description?: string | null; category: { name: string }; origin: string | null }, pack?: string) =>
  isMarketSafe(p.description) ? p.description : neutralDescription(p, pack);

/** "50 g" → "1.76 oz", "1 kg" → "2.2 lb", "500 ml" → "16.9 fl oz". Null when the pack title has no metric size. */
export function usPack(title: string): string | null {
  const m = title.match(/([\d.]+)\s*(kg|g|ml|l)\b/i);
  if (!m) return null;
  const n = parseFloat(m[1]!);
  const u = m[2]!.toLowerCase();
  if (!Number.isFinite(n) || n <= 0) return null;
  const trim = (x: number, d: number) => String(parseFloat(x.toFixed(d)));
  if (u === "ml" || u === "l") return `${trim(((u === "l" ? n * 1000 : n) / 29.5735), 1)} fl oz`;
  const grams = u === "kg" ? n * 1000 : n;
  return grams >= 453 ? `${trim(grams / 453.592, 1)} lb` : `${trim(grams / 28.3495, 2)} oz`;
}

/** Product link that remembers the shopper came from a market page, so the product page can offer the matching region. */
export const marketProductHref = (slug: string, market: MarketCode, sku?: string) => `/products/${slug}?region=${MARKETS[market].region}${sku ? `&variant=${encodeURIComponent(sku)}` : ""}`;
