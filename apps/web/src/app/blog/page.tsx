import type { Metadata } from "next";
import type { PostListResponse } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogSidebar } from "@/components/blog/sidebar";
import { BlogSearch } from "@/components/blog/blog-search";
import { LayoutSwitcher } from "@/components/blog/layout-switcher";
import { PostCard } from "@/components/blog/post-card";
import { Pagination } from "@/components/shop/pagination";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SP } from "@/lib/shop-params";

export const metadata: Metadata = { title: "Superfood Guides, Recipes & Sourcing Stories", description: "79 articles on black rice, white tea, makhana, ghee, honey and more from Xiphias Superfoods.", alternates: { canonical: "/blog" } };

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function BlogPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const layout = ["left", "right", "full"].includes(str(sp.layout)) ? str(sp.layout) : "left";
  const category = str(sp.category) || "All";
  const q = str(sp.q);
  const page = Number(str(sp.page) || 1);
  const data = await apiGet<PostListResponse>("/content/posts", { query: { category: category === "All" ? undefined : category, q: q || undefined, page, perPage: 12 } });
  const total = data.categories.reduce((s, c) => s + c.count, 0);
  const params = { layout: layout !== "left" ? layout : undefined, category: category !== "All" ? category : undefined, q: q || undefined };
  const grid = (
    <div>
      <div className={cn("grid gap-x-6 gap-y-10 sm:grid-cols-2", layout === "full" ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {data.items.map((p, i) => <PostCard key={p.slug} p={p} index={i} />)}
      </div>
      {data.items.length === 0 && (
        <div className="rounded-card bg-soft px-6 py-16 text-center"><p className="text-[18px] font-medium">No articles match that search.</p><ButtonLink href="/blog" variant="dark" className="mt-4">All articles</ButtonLink></div>
      )}
      <Pagination p={data.pagination} basePath="/blog" params={params} />
    </div>
  );
  return (
    <div className="wrap pb-20">
      <BlogHero total={total} />
      <div className="my-8 flex flex-wrap items-center gap-3.5">
        <LayoutSwitcher current={layout} />
        <BlogSearch defaultValue={q} className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:min-w-[320px]" />
        <span className="text-[14px] text-muted">{data.pagination.total} article{data.pagination.total === 1 ? "" : "s"}{category !== "All" ? ` in ${category}` : ""}{q ? ` for “${q}”` : ""}</span>
      </div>
      {layout === "full" ? grid : (
        <div className={cn("grid gap-10 lg:grid-cols-[300px_1fr]", layout === "right" && "lg:grid-cols-[1fr_300px]")}>
          {layout === "left" && <BlogSidebar data={data} current={category} total={total} q={q} />}
          {grid}
          {layout === "right" && <BlogSidebar data={data} current={category} total={total} q={q} />}
        </div>
      )}
    </div>
  );
}
