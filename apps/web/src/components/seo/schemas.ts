import type { ProductDetail } from "@xsf/contracts";
import { SITE } from "@/lib/site";

/** schema.org builders. Every value comes from the catalogue or the page itself — nothing is invented here. */
const abs = (path: string) => (path.startsWith("http") ? path : SITE.url + path);

export const breadcrumbLd = (crumbs: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
});

export const faqLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const itemListLd = (name: string, items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(it.path) })),
});

export type ReturnFacts = { days: number; countries: string[] };

/**
 * Product + one Offer per pack, priced in whatever currency the product was loaded in.
 * No aggregateRating: the store has no verified review data, and ratings without reviews must never be emitted.
 */
export function productLd(p: ProductDetail, opts: { name?: string; description?: string; url?: string; returns?: ReturnFacts | null } = {}) {
  const url = opts.url ?? `${SITE.url}/products/${p.slug}`;
  const returnPolicy = opts.returns
    ? {
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: opts.returns.countries,
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: opts.returns.days,
          merchantReturnLink: `${SITE.url}/policies/returns`,
        },
      }
    : {};
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name ?? p.name,
    image: p.images.map((i) => abs(i.url)),
    description: opts.description ?? p.description,
    sku: p.variants[0]?.sku,
    category: p.category.name,
    brand: { "@type": "Brand", name: SITE.name },
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      name: v.title,
      sku: v.sku,
      price: v.price.amount,
      priceCurrency: v.price.currency,
      availability: v.inStock && p.availableInRegion ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url,
      ...returnPolicy,
    })),
  };
}

/**
 * Reads the return window out of the returns-policy page text ("within 30 days of delivery"). Returns null — and the
 * product page then emits no return policy at all — if the policy stops stating a clear number of days.
 */
export function returnDaysFromPolicy(bodyHtml: string | null | undefined): number | null {
  const m = bodyHtml?.replace(/<[^>]+>/g, " ").match(/within\s+(\d{1,3})\s+days\s+of\s+delivery/i);
  const days = m ? Number(m[1]) : NaN;
  return Number.isInteger(days) && days > 0 ? days : null;
}
