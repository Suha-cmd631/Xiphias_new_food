import Link from "next/link";
import Image from "next/image";
import type { PostListResponse } from "@xsf/contracts";
import { formatDate } from "@/lib/time";
import { BlogSearch } from "./blog-search";
import { cn } from "@/lib/utils";

const TAGS = ["black rice", "white tea", "makhana", "masala chai", "ghee", "honey", "buckwheat", "blue pea", "ginger", "pepper", "weight loss", "diabetes"];

export function BlogSidebar({ data, current, total, q }: { data: PostListResponse; current: string; total: number; q: string }) {
  return (
    <aside className="grid content-start gap-8 rounded-card border border-line p-6 lg:sticky lg:top-40">
      <BlogSearch defaultValue={q} />
      <div>
        <h4 className="mb-3 border-b border-line pb-2 text-[18px]">Recent articles</h4>
        <div className="grid gap-3">
          {data.recent.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="flex gap-3">
              <Image src={p.coverImage} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <span><b className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{p.title}</b><small className="text-[12px] text-muted">{formatDate(p.publishedAt)} · <span className="text-leaf-dark">{p.category}</span></small></span>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 border-b border-line pb-2 text-[18px]">Categories</h4>
        <ul className="grid gap-1">
          <li><Link href="/blog" className={cn("flex justify-between rounded-lg px-3 py-2 text-[14.5px] hover:bg-soft", current === "All" && "bg-leaf-soft font-semibold text-leaf-dark")}>All articles <small>{total}</small></Link></li>
          {data.categories.map((c) => (
            <li key={c.name}><Link href={`/blog?category=${encodeURIComponent(c.name)}`} className={cn("flex justify-between rounded-lg px-3 py-2 text-[14.5px] hover:bg-soft", current === c.name && "bg-leaf-soft font-semibold text-leaf-dark")}>{c.name} <small>{c.count}</small></Link></li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="mb-3 border-b border-line pb-2 text-[18px]">Popular tags</h4>
        <div className="flex flex-wrap gap-2">{TAGS.map((t) => <Link key={t} href={`/blog?q=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3 py-1 text-[13px] hover:border-ink">{t}</Link>)}</div>
      </div>
      <Link href="/shop" className="grid gap-1 rounded-card bg-leaf-dark p-5 text-white">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-leaf">Shop</span>
        <b className="font-head text-[22px] font-medium">Sixteen honest foods, delivered worldwide →</b>
      </Link>
    </aside>
  );
}
