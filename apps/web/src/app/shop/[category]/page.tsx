import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Category, ProductListResponse, RegionsResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { shopParams, type SP } from "@/lib/shop-params";
import { PageHeader } from "@/components/ui/section";
import { ShopView } from "@/components/shop/shop-view";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = SITE.categories.find((x) => x.slug === category);
  return { title: c ? `Organic ${c.name}: ${c.desc}` : "Shop", description: c ? `Buy certified organic ${c.name.toLowerCase()} online — ${c.desc.toLowerCase()}. Sourced directly from farmers, delivered across India and worldwide.` : undefined, alternates: { canonical: `/shop/${category}` } };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<SP> }) {
  const { category } = await params;
  const cats = await apiGet<{ items: Category[] }>("/catalog/categories");
  const cat = cats.items.find((c) => c.slug === category);
  if (!cat) notFound();
  const q = { ...shopParams(await searchParams), category };
  const [data, regions] = await Promise.all([apiGet<ProductListResponse>("/catalog/products", { query: q }), apiGet<RegionsResponse>("/regions")]);
  const currency = regions.regions.find((r) => r.code === regions.current)?.currency ?? "INR";
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: cat.name, url: `${SITE.url}/shop/${cat.slug}` }} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: "/shop", label: "Shop" }, { label: cat.name }]} title={cat.name} text={cat.description ?? undefined} />
      <ShopView data={data} basePath={`/shop/${category}`} params={q} currency={currency} />
    </>
  );
}
