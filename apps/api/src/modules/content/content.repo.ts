import { prisma } from "../../shared/prisma.js";

export const contentRepo = {
  posts(where: { category?: string; q?: string }, skip: number, take: number) {
    const filter = {
      status: "published",
      ...(where.category ? { category: where.category } : {}),
      ...(where.q ? { OR: [{ title: { contains: where.q, mode: "insensitive" as const } }, { excerpt: { contains: where.q, mode: "insensitive" as const } }, { category: { contains: where.q, mode: "insensitive" as const } }] } : {}),
    };
    return Promise.all([
      prisma.blogPost.findMany({ where: filter, orderBy: { publishedAt: "desc" }, skip, take }),
      prisma.blogPost.count({ where: filter }),
    ]);
  },
  recent(take = 4) {
    return prisma.blogPost.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take });
  },
  categoryCounts() {
    return prisma.blogPost.groupBy({ by: ["category"], where: { status: "published" }, _count: { _all: true }, orderBy: { category: "asc" } });
  },
  postBySlug(slug: string) {
    return prisma.blogPost.findFirst({ where: { slug, status: "published" } });
  },
  related(category: string, excludeSlug: string, take = 3) {
    return prisma.blogPost.findMany({ where: { status: "published", category, slug: { not: excludeSlug } }, orderBy: { publishedAt: "desc" }, take });
  },
  searchPosts(q: string, take: number) {
    return prisma.blogPost.findMany({ where: { status: "published", title: { contains: q, mode: "insensitive" } }, select: { slug: true, title: true }, take });
  },
  page(slug: string) {
    return prisma.page.findFirst({ where: { slug, status: "published" } });
  },
  banners(placement: string) {
    const now = new Date();
    return prisma.banner.findMany({
      where: { placement, active: true, OR: [{ startsAt: null }, { startsAt: { lte: now } }], AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
      orderBy: { sortOrder: "asc" },
    });
  },
  settings(keys: string[]) {
    return prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  },
  redirects() {
    return prisma.redirect.findMany();
  },
};
