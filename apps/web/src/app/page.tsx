import type { Metadata } from "next";
import type { Category, ProductCard } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { Hero } from "@/components/home/hero";
import { Shelves } from "@/components/home/shelves";
import { Lifestyle } from "@/components/home/lifestyle";
import { Trio } from "@/components/home/trio";
import { Deals } from "@/components/home/deals";
import { FarmVideo } from "@/components/home/farm-video";
import { Reviews } from "@/components/home/reviews";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { Marquee } from "@/components/home/marquee";
import { Spotlight } from "@/components/home/spotlight";
import { Picks } from "@/components/home/picks";
import { LatestArticles } from "@/components/home/latest-articles";
import { Certifications } from "@/components/home/certifications";
import { Section, SectionHead } from "@/components/ui/section";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [cats, best, settings] = await Promise.all([
    apiGet<{ items: Category[] }>("/catalog/categories"),
    apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 16 } }),
    apiGet<{ reviews?: { name: string; meta: string; text: string }[] }>("/content/settings", { query: { keys: "reviews" } }),
  ]);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/img/logo_big.webp`, email: SITE.email, telephone: SITE.phone, address: { "@type": "PostalAddress", streetAddress: SITE.address, addressLocality: "Bengaluru", postalCode: "560034", addressCountry: "IN" } }} />
      <Hero />
      <Shelves categories={cats.items} />
      <Lifestyle />
      <Trio />
      <Section id="collection">
        <SectionHead kick="Now trending" title="The Collection" text="Sixteen organic staples, each sourced directly from the farmers who grow it." more={{ href: "/shop", label: "View all" }} from="top" />
        <ProductGrid items={best.items} />
      </Section>
      <Marquee />
      <Spotlight slug="silver-needle-white-tea" kick="Featured · Teas" blurb="Rich in antioxidants, low in caffeine, kind to skin and heart. Best brewed at 70–85 °C to keep its delicate flavour — and good for three steeps." />
      <Deals />
      <FarmVideo />
      <Picks />
      <Reviews items={settings.reviews ?? []} />
      <LatestArticles />
      <Certifications />
      <NewsletterBox source="home" />
      <QuickView />
    </>
  );
}
