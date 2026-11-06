import type { Metadata } from "next";
import type { Category, ProductCard, ProductDetail } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { HomeHero } from "@/components/home/home-hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { StoryBand } from "@/components/home/story-band";
import { LearnTeaser } from "@/components/home/learn-teaser";
import { ShelfLinks } from "@/components/home/shelf-links";
import { Reviews } from "@/components/home/reviews";
import { B2BStrip } from "@/components/home/b2b-strip";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { Section, SectionHead } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: { absolute: "Xiphias Superfoods: Single-Origin Indian Teas & Superfoods" }, alternates: { canonical: "/" } };

// Testimonials are unverified, so they stay off until the owner confirms them and sets this flag.
const SHOW_TESTIMONIALS = process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true";

/** Live price for the hero's featured product (Silver Needle); the hero still renders without it. */
async function heroFeature() {
  const slug = "silver-needle-white-tea";
  const p = await apiGet<ProductDetail>(`/catalog/products/${slug}`).catch(() => null);
  const v = p?.variants.find((x) => x.price.amount === p.fromPrice.amount);
  return { name: p?.name ?? "Silver Needle White Tea", href: `/products/${slug}`, price: p ? (v?.price ?? p.fromPrice).formatted : null, pack: v?.title ?? null };
}

/**
 * Home: hero → trust strip → bestsellers → story band → guides → reviews (flagged) → wholesale → newsletter.
 */
export default async function HomePage() {
  const [cats, best, settings, feature] = await Promise.all([
    apiGet<{ items: Category[] }>("/catalog/categories"),
    apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 8 } }),
    SHOW_TESTIMONIALS ? apiGet<{ reviews?: { name: string; meta: string; text: string }[] }>("/content/settings", { query: { keys: "reviews" } }).catch(() => ({ reviews: [] })) : Promise.resolve({ reviews: [] }),
    heroFeature(),
  ]);
  const total = cats.items.reduce((n, c) => n + c.productCount, 0);
  const viewAll = total > 0 ? `View all ${total}` : "View all";
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, potentialAction: { "@type": "SearchAction", target: `${SITE.url}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, description: SITE.description, logo: `${SITE.url}/img/logo_big.webp`, email: SITE.email, telephone: SITE.phone, address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Bengaluru", postalCode: "560034", addressCountry: "IN" } }} />
      <HomeHero feature={feature} />
      <TrustStrip />
      <Section id="collection">
        <SectionHead kick="Bestsellers" title="What our customers reorder" text="Each one traceable to the region it was grown in, with brewing or cooking notes on every page." more={{ href: "/shop", label: viewAll }} from="top" />
        <ShelfLinks categories={cats.items} />
        <ProductGrid items={best.items.slice(0, 8)} />
        <div className="mt-10 flex justify-center sm:hidden">
          <ButtonLink href="/shop">{viewAll} products</ButtonLink>
        </div>
      </Section>
      <StoryBand />
      <LearnTeaser />
      {SHOW_TESTIMONIALS && <Reviews items={settings.reviews ?? []} />}
      <B2BStrip />
      <NewsletterBox source="home" />
      <QuickView />
    </>
  );
}
