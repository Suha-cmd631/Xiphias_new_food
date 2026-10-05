import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ProductDetail } from "@xsf/contracts";
import { apiGet, ApiError } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { ProductSections } from "@/components/product/sections";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";
import { Star } from "lucide-react";
import { brandTitle } from "@/lib/seo";

async function load(slug: string) {
  try { return await apiGet<ProductDetail>(`/catalog/products/${slug}`); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  return { title: brandTitle(p.seoTitle ?? p.name), description: p.seoDescription ?? p.description, openGraph: { images: [p.image] }, alternates: { canonical: `/products/${p.slug}` } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await load((await params).slug);
  if (!p) notFound();
  const v0 = p.variants[0];
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.images.map((i) => SITE.url + i.url), description: p.description, sku: v0?.sku, brand: { "@type": "Brand", name: "Xiphias Superfoods" }, offers: p.variants.map((v) => ({ "@type": "Offer", price: v.price.amount, priceCurrency: v.price.currency, availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${SITE.url}/products/${p.slug}`, sku: v.sku })) }} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: `/shop/${p.category.slug}`, label: p.category.name }, { label: p.name }]} />
      <Section tight>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Gallery images={p.images} name={p.name} />
          <div className="hero-t">
            <span className="kick">{p.category.name}{p.origin ? ` · ${p.origin}` : ""}</span>
            <h1 className="text-[clamp(32px,4vw,48px)] leading-[1.08]">{p.name}</h1>
            {p.reviewCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-gold" aria-label={`Rated ${p.rating} out of 5`}>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className={i < Math.round(p.rating) ? "h-4 w-4 fill-current" : "h-4 w-4"} />)}
                <span className="text-[13px] text-muted">{p.rating} · {p.reviewCount} reviews</span>
              </div>
            )}
            <p className="mt-4 text-[16px] text-[#444]">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">{p.diet.map((d) => <span key={d} className="rounded-full bg-leaf-soft px-3 py-1 text-[12.5px] font-semibold capitalize text-leaf-dark">{d}</span>)}</div>
            <BuyBox product={p} />
          </div>
        </div>
      </Section>
      <Section tight>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ProductSections sections={p.bodySections} />
          <aside className="grid content-start gap-4 rounded-card bg-soft p-6 text-[14.5px]">
            <h3 className="text-[20px]">Good to know</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-muted">Origin</dt><dd>{p.origin ?? "India"}</dd>
              <dt className="text-muted">Shelf life</dt><dd>{p.shelfLifeDays ? `${Math.round(p.shelfLifeDays / 30)} months` : "—"}</dd>
              <dt className="text-muted">HS code</dt><dd>{p.hsCode ?? "—"}</dd>
              <dt className="text-muted">Pack sizes</dt><dd>{p.variants.map((v) => v.title).join(", ")}</dd>
            </dl>
            <p className="text-[13px] text-muted">Certificates (organic, FSSAI, lab report per lot) travel with the export documents and are available on request.</p>
          </aside>
        </div>
      </Section>
      <Section className="pt-0">
        <SectionHead kick="Related" title="You may also like" more={{ href: "/shop", label: "All products" }} />
        <ProductGrid items={p.related} />
      </Section>
      <QuickView />
    </>
  );
}
