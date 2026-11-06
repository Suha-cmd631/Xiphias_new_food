import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Category, ProductListResponse, RegionsResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { shopParams, type SP } from "@/lib/shop-params";
import { PageHeader } from "@/components/ui/section";
import { ShopView } from "@/components/shop/shop-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";
import { shelfBySlug } from "@/lib/shelf-content";
import { brandTitle } from "@/lib/seo";
import { Section, SectionHead } from "@/components/ui/section";
import { Faq } from "@/components/ui/faq";
import { breadcrumbLd, faqLd, itemListLd } from "@/components/seo/schemas";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const s = shelfBySlug(category);
  if (!s) return { title: "Shop", alternates: { canonical: `/shop/${category}` } };
  return { title: brandTitle(s.title), description: s.description, alternates: { canonical: `/shop/${category}` }, openGraph: { title: s.title, description: s.description } };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<SP> }) {
  const { category } = await params;
  const cats = await apiGet<{ items: Category[] }>("/catalog/categories");
  const cat = cats.items.find((c) => c.slug === category);
  if (!cat) notFound();
  const shelf = shelfBySlug(category);
  const q = { ...shopParams(await searchParams), category };
  const [data, regions] = await Promise.all([apiGet<ProductListResponse>("/catalog/products", { query: q }), apiGet<RegionsResponse>("/regions")]);
  const currency = regions.regions.find((r) => r.code === regions.current)?.currency ?? "INR";
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: shelf?.h1 ?? cat.name, description: shelf?.description, url: `${SITE.url}/shop/${cat.slug}` }} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: cat.name, path: `/shop/${cat.slug}` }])} />
      <JsonLd data={itemListLd(cat.name, data.items.map((p) => ({ name: p.name, path: `/products/${p.slug}` })))} />
      {shelf && <JsonLd data={faqLd(shelf.faqs)} />}
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: cat.name }]} title={shelf?.h1 ?? cat.name} text={shelf?.intro ?? cat.description ?? undefined}>
        {shelf && shelf.guides.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {shelf.guides.map((g) => (
              <Link key={g.href} href={g.href} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13.5px] font-medium text-royal-deep transition-colors hover:border-gold hover:text-royal">
                <BookOpen className="h-3.5 w-3.5 text-gold-deep" /> {g.label}
              </Link>
            ))}
          </div>
        )}
      </PageHeader>
      <ShopView data={data} basePath={`/shop/${category}`} params={q} currency={currency} />
      {shelf && (
        <Section tight ariaLabel="Questions">
          <SectionHead kick="Questions" title={`${cat.name}: common questions`} center />
          <Faq items={shelf.faqs} />
        </Section>
      )}
    </>
  );
}
