import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOPICS } from "@/lib/market-topics";
import { GUIDES } from "@/lib/learn";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const stat = ["", "/shop", "/about", "/b2b", "/contact", "/blog", "/faq", "/store", "/track", "/learn", ...GUIDES.map((g) => `/learn/${g.slug}`), "/policies/shipping", "/policies/returns", "/policies/terms", "/policies/privacy", "/policies/cookies", ...SITE.categories.map((c) => `/shop/${c.slug}`)];
  const out: MetadataRoute.Sitemap = stat.map((p) => ({ url: base + p, changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
  // US / Canada search landing pages (lib/market-topics.ts): a hub per market plus one page per topic.
  for (const market of ["us", "ca"] as const) {
    out.push({ url: `${base}/${market}`, changeFrequency: "weekly", priority: 0.8 });
    out.push(...TOPICS.map((t) => ({ url: `${base}/${market}/${t.slug}`, changeFrequency: "weekly" as const, priority: market === "us" ? 0.8 : 0.5 })));
  }
  try {
    const [prods, posts] = await Promise.all([
      fetch(`${API}/api/v1/catalog/products?perPage=48`, { cache: "no-store" }).then((r) => r.json()) as Promise<{ items: { slug: string }[] }>,
      fetch(`${API}/api/v1/content/posts?perPage=48&page=1`, { cache: "no-store" }).then((r) => r.json()) as Promise<{ items: { slug: string; publishedAt: string }[]; pagination: { pages: number } }>,
    ]);
    out.push(...prods.items.map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })));
    out.push(...posts.items.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.publishedAt, changeFrequency: "monthly" as const, priority: 0.6 })));
    for (let page = 2; page <= posts.pagination.pages; page++) {
      const more = (await fetch(`${API}/api/v1/content/posts?perPage=48&page=${page}`, { cache: "no-store" }).then((r) => r.json())) as { items: { slug: string; publishedAt: string }[] };
      out.push(...more.items.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.publishedAt, changeFrequency: "monthly" as const, priority: 0.6 })));
    }
  } catch { /* API down: static part still serves */ }
  return out;
}
