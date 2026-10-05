import type { PostCard, PostDetail, PostListResponse } from "@xsf/contracts";
import { notFound } from "../../shared/errors.js";
import { contentRepo } from "./content.repo.js";

type Row = Awaited<ReturnType<typeof contentRepo.recent>>[number];
const card = (p: Row): PostCard => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  coverImage: p.coverImage,
  category: p.category,
  publishedAt: p.publishedAt.toISOString(),
  readMinutes: Math.max(2, Math.round(p.wordCount / 220)),
});

export const contentService = {
  async posts(q: { category?: string; q?: string; page: number; perPage: number }): Promise<PostListResponse> {
    const category = q.category && q.category !== "All" ? q.category : undefined;
    const [[items, total], recent, cats] = await Promise.all([
      contentRepo.posts({ category, q: q.q }, (q.page - 1) * q.perPage, q.perPage),
      contentRepo.recent(4),
      contentRepo.categoryCounts(),
    ]);
    return {
      items: items.map(card),
      pagination: { page: q.page, perPage: q.perPage, total, pages: Math.max(1, Math.ceil(total / q.perPage)) },
      categories: cats.map((c) => ({ name: c.category, count: c._count._all })),
      recent: recent.map(card),
    };
  },
  async post(slug: string): Promise<PostDetail> {
    const p = await contentRepo.postBySlug(slug);
    if (!p) throw notFound("Article");
    const related = await contentRepo.related(p.category, p.slug);
    return { ...card(p), bodyHtml: p.bodyHtml, authorName: p.authorName, tags: p.tags, seoTitle: p.seoTitle, seoDescription: p.seoDescription, related: related.map(card) };
  },
  async page(slug: string) {
    const p = await contentRepo.page(slug);
    if (!p) throw notFound("Page");
    return { slug: p.slug, title: p.title, bodyHtml: p.bodyHtml, updatedAt: p.updatedAt.toISOString(), seoTitle: p.seoTitle, seoDescription: p.seoDescription };
  },
  async banners(placement: string) {
    return (await contentRepo.banners(placement)).map((b) => ({ id: b.id, placement: b.placement, title: b.title, subtitle: b.subtitle, image: b.image, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }));
  },
  async settings(keys: string[]) {
    const rows = await contentRepo.settings(keys);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
};
