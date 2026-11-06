import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Page, ProductDetail, RegionCode, RegionsResponse } from "@xsf/contracts";
import { apiGet, ApiError } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { Gallery } from "@/components/product/gallery";
import { BuyBox } from "@/components/product/buy-box";
import { ProductSections } from "@/components/product/sections";
import { ProductGrid } from "@/components/shop/product-grid";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, faqLd, productLd, returnDaysFromPolicy, type ReturnFacts } from "@/components/seo/schemas";
import { Faq } from "@/components/ui/faq";
import { guidesForProduct } from "@/lib/learn";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { RegionNotice } from "@/components/market/region-notice";
import { ViewItem } from "@/components/analytics/view-item";
import { topicForProduct } from "@/lib/market-topics";
import { Star } from "lucide-react";
import { brandTitle } from "@/lib/seo";

async function load(slug: string) {
  try { return await apiGet<ProductDetail>(`/catalog/products/${slug}`); } catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  // Products that have a US / Canada landing page point to it for those audiences; this page stays the default for everyone else.
  const topic = topicForProduct(p.slug);
  const languages = topic ? { "en-US": `/us/${topic.slug}`, "en-CA": `/ca/${topic.slug}`, "x-default": `/products/${p.slug}` } : undefined;
  return { title: brandTitle(p.seoTitle ?? p.name), description: p.seoDescription ?? p.description, openGraph: { images: [p.image] }, alternates: { canonical: `/products/${p.slug}`, languages } };
}

const REGION_CODES: readonly RegionCode[] = ["IN", "EU", "UK", "US", "CA", "ME", "ROW"];

/** Return window for structured data: only when the returns policy states a clear number of days, for the countries of the shopper's region. */
async function returnFacts(): Promise<ReturnFacts | null> {
  try {
    const [policy, regions] = await Promise.all([apiGet<Page>("/content/pages/returns"), apiGet<RegionsResponse>("/regions")]);
    const days = returnDaysFromPolicy(policy.bodyHtml);
    const countries = regions.regions.find((r) => r.code === regions.current)?.countries ?? [];
    return days && countries.length > 0 ? { days, countries } : null;
  } catch {
    return null; // structured data is optional — never fail the product page over it
  }
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ region?: string | string[]; variant?: string | string[] }> }) {
  const [p, returns, sp] = await Promise.all([load((await params).slug), returnFacts(), searchParams]);
  if (!p) notFound();
  // ?region=US comes from the /us pages and the Google feed. It never changes the region by itself: it only lets us
  // show the "switch" notice when the shopper's own region differs. ?variant=<SKU> preselects that pack.
  const regionParam = typeof sp.region === "string" ? sp.region.toUpperCase() : "";
  const hinted = REGION_CODES.find((c) => c === regionParam);
  const initialSku = typeof sp.variant === "string" ? sp.variant : undefined;
  const shown = p.variants.find((v) => v.sku === initialSku) ?? p.variants[0];
  const guides = guidesForProduct(p.slug);
  return (
    <>
      {/* Offers are in the currency of the region this request was priced for. No aggregateRating: there is no verified review data. */}
      <JsonLd data={productLd(p, { returns })} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: p.category.name, path: `/shop/${p.category.slug}` }, { name: p.name, path: `/products/${p.slug}` }])} />
      {p.faqs.length > 0 && <JsonLd data={faqLd(p.faqs)} />}
      {shown && <ViewItem id={shown.sku} name={p.name} category={p.category.name} price={shown.price.amount} currency={shown.price.currency} />}
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { href: `/shop/${p.category.slug}`, label: p.category.name }, { label: p.name }]} />
      {hinted && <div className="wrap"><RegionNotice want={hinted} onlyWhenDifferent className="mt-5" /></div>}
      <Section tight>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Gallery images={p.images} name={p.name} />
          <div className="hero-t">
            <span className="kick kick-line">{p.category.name}{p.origin ? ` · ${p.origin}` : ""}</span>
            <h1 className="text-[clamp(34px,4.2vw,54px)] leading-[1.05]">{p.name}</h1>
            {p.subtitle && <p className="mt-2 text-[15px] font-medium text-gold-deep">{p.subtitle}</p>}
            {p.reviewCount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-gold" aria-label={`Rated ${p.rating} out of 5`}>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className={i < Math.round(p.rating) ? "h-4 w-4 fill-current" : "h-4 w-4"} />)}
                <span className="text-[13px] text-muted">{p.rating} · {p.reviewCount} reviews</span>
              </div>
            )}
            <p className="mt-4 max-w-[60ch] text-[16.5px] leading-relaxed text-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">{p.diet.map((d) => <span key={d} className="rounded-full border border-line bg-paper px-3 py-1 text-[12.5px] font-semibold capitalize text-royal-deep">{d}</span>)}</div>
            <BuyBox product={p} initialSku={initialSku} />
          </div>
        </div>
      </Section>
      <Section tight>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <ProductSections sections={p.bodySections} />
          <aside className="grid h-fit content-start gap-4 rounded-[22px] border border-line bg-paper p-6 text-[14.5px] lg:sticky lg:top-40">
            <h3 className="text-[20px]">Good to know</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-muted">Origin</dt><dd>{p.origin ?? "India"}</dd>
              <dt className="text-muted">Shelf life</dt><dd>{p.shelfLifeDays ? `${Math.round(p.shelfLifeDays / 30)} months` : "—"}</dd>
              <dt className="text-muted">HS code</dt><dd>{p.hsCode ?? "—"}</dd>
              <dt className="text-muted">Pack sizes</dt><dd>{p.variants.map((v) => v.title).join(", ")}</dd>
            </dl>
            <p className="text-[13px] text-muted">Certificates (FSSAI and the lab report for your lot) travel with the export documents and are available on request.</p>
            {guides.map((g) => (
              <Link key={g.slug} href={`/learn/${g.slug}`} className="group mt-1 flex items-center gap-3 rounded-2xl bg-cream p-4 transition-colors hover:bg-gold-soft">
                <BookOpen className="h-5 w-5 shrink-0 text-royal" />
                <span className="flex-1 text-[14px] leading-snug"><span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">Guide</span>{g.h1}</span>
                <ArrowRight className="h-4 w-4 text-royal transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </aside>
        </div>
      </Section>
      {p.faqs.length > 0 && (
        <Section tight ariaLabel="Questions">
          <SectionHead kick="Questions" title={`${p.name}: common questions`} center />
          <Faq items={p.faqs} />
        </Section>
      )}
      <Section className="pt-0">
        <SectionHead kick="Related" title="You may also like" more={{ href: "/shop", label: "All products" }} />
        <ProductGrid items={p.related} />
      </Section>
      <QuickView />
    </>
  );
}
