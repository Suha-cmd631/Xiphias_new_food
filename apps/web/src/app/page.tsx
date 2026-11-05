import type { Metadata } from "next";
import type { Category, ProductCard, ProductDetail } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { Hero } from "@/components/home/hero";
import { HERO_SLIDES, type HeroSlide } from "@/components/home/hero-slides";
import { ShelfLinks } from "@/components/home/shelf-links";
import { Proofs } from "@/components/home/proofs";
import { FarmVideo } from "@/components/home/farm-video";
import { Reviews } from "@/components/home/reviews";
import { B2BStrip } from "@/components/home/b2b-strip";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { Section, SectionHead } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Testimonials are unverified, so they stay off until the owner confirms them and sets this flag.
const SHOW_TESTIMONIALS = process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS === "true";

/** Live price + pack size for a hero slide; a slide still renders (without a price) if its product can't be loaded. */
async function heroSlide(copy: (typeof HERO_SLIDES)[number]): Promise<HeroSlide> {
  const p = await apiGet<ProductDetail>(`/catalog/products/${copy.slug}`).catch(() => null);
  if (!p) return { ...copy, product: null };
  const v = p.variants.find((x) => x.inStock && x.price.amount === p.fromPrice.amount) ?? p.variants.find((x) => x.price.amount === p.fromPrice.amount);
  return { ...copy, product: { name: p.name, price: (v?.price ?? p.fromPrice).formatted, compareAt: (v ? v.compareAt : p.compareAt)?.formatted ?? null, pack: v?.title ?? null } };
}

/**
 * Home = seven sections: hero → bestsellers → three proofs → farm story → reviews (flagged) → B2B → newsletter.
 */
export default async function HomePage() {
  const [cats, best, settings, slides] = await Promise.all([
    apiGet<{ items: Category[] }>("/catalog/categories"),
    apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 8 } }),
    SHOW_TESTIMONIALS ? apiGet<{ reviews?: { name: string; meta: string; text: string }[] }>("/content/settings", { query: { keys: "reviews" } }).catch(() => ({ reviews: [] })) : Promise.resolve({ reviews: [] }),
    Promise.all(HERO_SLIDES.map(heroSlide)),
  ]);
  const total = cats.items.reduce((n, c) => n + c.productCount, 0);
  const viewAll = total > 0 ? `View all ${total}` : "View all";
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/img/logo_big.webp`, email: SITE.email, telephone: SITE.phone, address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Bengaluru", postalCode: "560034", addressCountry: "IN" } }} />
      <Hero slides={slides} />
      <Section id="collection">
        <SectionHead kick="Shop the shelves" title="Our bestsellers" more={{ href: "/shop", label: viewAll }} from="top" />
        <ShelfLinks categories={cats.items} />
        <ProductGrid items={best.items.slice(0, 8)} />
        <div className="mt-10 flex justify-center sm:hidden">
          <ButtonLink href="/shop">{viewAll} products</ButtonLink>
        </div>
      </Section>
      <Proofs />
      <FarmVideo />
      {SHOW_TESTIMONIALS && <Reviews items={settings.reviews ?? []} />}
      <B2BStrip />
      <NewsletterBox source="home" />
      <QuickView />
    </>
  );
}
