import { prisma } from "../../shared/prisma.js";

export const productInclude = (priceListId: string) =>
  ({
    category: true,
    images: { orderBy: { sortOrder: "asc" as const } },
    variants: {
      orderBy: { position: "asc" as const },
      include: { prices: { where: { priceListId } }, inventory: true },
    },
  }) as const;

export const catalogRepo = {
  activeProducts(priceListId: string) {
    return prisma.product.findMany({ where: { status: "active" }, include: productInclude(priceListId), orderBy: { sortOrder: "asc" } });
  },
  productBySlug(slug: string, priceListId: string) {
    return prisma.product.findFirst({ where: { slug, status: "active" }, include: productInclude(priceListId) });
  },
  categories() {
    return prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: { where: { status: "active" } } } } } });
  },
};
export type ProductRow = Awaited<ReturnType<typeof catalogRepo.activeProducts>>[number];
