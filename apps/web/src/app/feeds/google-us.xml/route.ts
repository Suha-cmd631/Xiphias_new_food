/*
 * GOOGLE MERCHANT CENTER PRODUCT FEED — UNITED STATES
 * ---------------------------------------------------
 * What this is: a live list of everything we sell to the US, in the format Google Shopping reads (RSS 2.0 with
 * Google's "g:" fields). One entry per pack size, priced in US dollars straight from the US price list.
 * Address once the site is live:  https://<your-domain>/feeds/google-us.xml
 *
 * How to register it (one-off, about ten minutes):
 *   1. Open https://merchants.google.com and sign in. Verify and claim the website address under
 *      "Business info → Website" if that has not been done yet.
 *   2. Go to "Products → Feeds" (in the newer layout: "Settings → Data sources") and choose "Add product source".
 *   3. Country of sale: United States. Language: English. Currency: USD.
 *   4. Choose "Scheduled fetch" (also called "Add products from a file → Enter a link to your file") and paste the
 *      address above. Fetch frequency: daily. No username or password is needed.
 *   5. Press "Fetch now" once, then open the "Needs attention" tab and work through anything Google flags.
 *   6. This file contains no delivery prices. Set US shipping rates and the returns policy inside Merchant Center
 *      ("Shipping and returns") so they match what checkout really charges, otherwise products are disapproved.
 *
 * Good to know:
 *   - Google re-checks each product page and compares the price with this file. Every link here ends in
 *     ?region=US so the product page can offer US dollars; Google's crawler must actually be served USD on that
 *     page (it is, when the site's CDN passes a US country header) or Google will report a price mismatch.
 *   - Wording follows lib/market.ts: no "organic" in names or descriptions until NEXT_PUBLIC_US_ORGANIC_OK=true,
 *     and stored descriptions that make health claims are replaced by a neutral sentence.
 *   - The response is cached for one hour, so a price change can take up to an hour to show here.
 */
import type { ProductCard, ProductDetail, RegionsResponse } from "@xsf/contracts";
import { apiGetForRegion } from "@/lib/api/region";
import { marketDescription, marketName, marketProductHref } from "@/lib/market";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const xml = (s: string | number) =>
  String(s)
    // characters XML 1.0 does not allow at all
    .replace(/[^\u0009\u000A\u000D -퟿-�]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const abs = (path: string) => (/^https?:\/\//.test(path) ? path : SITE.url + path);
const tag = (name: string, value: string | number | null | undefined) => (value === null || value === undefined || value === "" ? "" : `      <${name}>${xml(value)}</${name}>\n`);

// Google's own category names (text form of the taxonomy), by our category slug.
const GOOGLE_CATEGORY: Record<string, string> = {
  teas: "Food, Beverages & Tobacco > Beverages > Tea & Infusions",
  "grains-rice": "Food, Beverages & Tobacco > Food Items > Grains, Rice & Cereal",
  spices: "Food, Beverages & Tobacco > Food Items > Seasonings & Spices",
  "nuts-snacks": "Food, Beverages & Tobacco > Food Items > Nuts & Seeds",
};
const GOOGLE_CATEGORY_DEFAULT = "Food, Beverages & Tobacco > Food Items";

/** "50 g" → "50 g", "1 kg" → "1 kg", "500 ml" → "500 ml", "1 L" → "1 l" (units Google accepts). Null if the title has no size. */
function measure(title: string): string | null {
  const m = title.match(/([\d.]+)\s*(kg|g|ml|l)\b/i);
  return m ? `${parseFloat(m[1]!)} ${m[2]!.toLowerCase()}` : null;
}

export async function GET() {
  let items = "";
  try {
    const regions = await apiGetForRegion<RegionsResponse>("US", "/regions");
    const us = regions.regions.find((r) => r.code === "US") as (RegionsResponse["regions"][number] & { checkoutEnabled?: boolean }) | undefined;
    // No US region, or US checkout switched off → an empty (still valid) feed, so nothing unbuyable is advertised.
    const selling = !!us && us.currency === "USD" && us.checkoutEnabled !== false;
    if (selling) {
      const list = await apiGetForRegion<{ items: ProductCard[] }>("US", "/catalog/products", { perPage: 48 });
      const details = await Promise.all(list.items.filter((c) => c.availableInRegion).map((c) => apiGetForRegion<ProductDetail>("US", `/catalog/products/${c.slug}`)));
      for (const p of details) {
        if (!p.availableInRegion) continue;
        const name = marketName(p.name);
        const pack = p.hoverImage ?? p.images[1]?.url ?? null; // second image = pack photo, first = bowl shot
        const main = pack ?? p.image;
        const extra = p.images.map((i) => i.url).filter((u) => u !== main);
        for (const v of p.variants) {
          if (v.price.currency !== "USD" || !(v.price.amount > 0)) continue;
          const size = measure(v.title);
          const onSale = v.compareAt && v.compareAt.amount > v.price.amount;
          items +=
            "    <item>\n" +
            tag("g:id", v.sku) +
            tag("title", `${name}, ${v.title}`) +
            tag("description", marketDescription(p, v.title)) +
            tag("link", abs(marketProductHref(p.slug, "us", v.sku))) +
            tag("g:image_link", abs(main)) +
            extra.slice(0, 10).map((u) => tag("g:additional_image_link", abs(u))).join("") +
            tag("g:price", `${(onSale ? v.compareAt!.amount : v.price.amount).toFixed(2)} USD`) +
            (onSale ? tag("g:sale_price", `${v.price.amount.toFixed(2)} USD`) : "") +
            tag("g:availability", v.inStock ? "in_stock" : "out_of_stock") +
            tag("g:condition", "new") +
            tag("g:brand", "Xiphias") +
            tag("g:mpn", v.sku) +
            tag("g:item_group_id", p.id) + // groups the pack sizes of one product (the id, not the slug: some slugs contain restricted words)
            tag("g:google_product_category", GOOGLE_CATEGORY[p.category.slug] ?? GOOGLE_CATEGORY_DEFAULT) +
            tag("g:product_type", p.category.name) +
            (v.weightGrams > 0 ? tag("g:shipping_weight", `${v.weightGrams} g`) : "") +
            (size ? tag("g:unit_pricing_measure", size) : "") +
            "    </item>\n";
        }
      }
    }
  } catch {
    // Catalogue unreachable: fail loudly (503) so Google keeps yesterday's data instead of reading an empty feed as "everything removed".
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "600", "Cache-Control": "no-store" } });
  }

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>${xml(SITE.name)} — United States</title>\n` +
    `    <link>${xml(SITE.url + "/us")}</link>\n` +
    `    <description>Products available for delivery to the United States, priced in US dollars.</description>\n` +
    items +
    `  </channel>\n` +
    `</rss>\n`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
