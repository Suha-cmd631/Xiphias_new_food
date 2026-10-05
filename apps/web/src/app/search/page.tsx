import type { Metadata } from "next";
import type { ProductListResponse, RegionsResponse, PostListResponse } from "@xsf/contracts";
import Link from "next/link";
import { apiGet } from "@/lib/api/server";
import { shopParams, type SP } from "@/lib/shop-params";
import { PageHeader } from "@/components/ui/section";
import { ShopView } from "@/components/shop/shop-view";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const params = shopParams(await searchParams);
  const q = params.q ?? "";
  const [data, regions, posts] = await Promise.all([
    apiGet<ProductListResponse>("/catalog/products", { query: params }),
    apiGet<RegionsResponse>("/regions"),
    q ? apiGet<PostListResponse>("/content/posts", { query: { q, perPage: 4 } }) : Promise.resolve(null),
  ]);
  const currency = regions.regions.find((r) => r.code === regions.current)?.currency ?? "INR";
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Search" }]} title={q ? `Results for “${q}”` : "Search"} text={`${data.pagination.total} products${posts ? ` · ${posts.pagination.total} articles` : ""}`} />
      {posts && posts.items.length > 0 && (
        <div className="wrap mt-4 flex flex-wrap gap-2">
          {posts.items.map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className="rounded-full border border-line px-3.5 py-1.5 text-[13.5px] hover:border-ink">📝 {p.title}</Link>)}
        </div>
      )}
      <ShopView data={data} basePath="/search" params={params} currency={currency} />
    </>
  );
}
