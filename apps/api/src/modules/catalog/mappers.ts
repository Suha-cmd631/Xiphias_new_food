import type { ProductCard, ProductDetail, VariantPrice } from "@xsf/contracts";
import { money, n } from "../../shared/money.js";
import type { RegionCtx } from "../regions/regions.service.js";
import type { ProductRow } from "./catalog.repo.js";

export function variantDto(v: ProductRow["variants"][number], currency: string): VariantPrice | null {
  const price = v.prices[0];
  if (!price) return null;
  const available = v.inventory ? Math.max(0, v.inventory.onHand - v.inventory.reserved) : 999;
  return {
    id: v.id,
    sku: v.sku,
    title: v.title,
    weightGrams: v.weightGrams,
    price: money(price.amount, currency),
    compareAt: price.compareAt && n(price.compareAt) > n(price.amount) ? money(price.compareAt, currency) : null,
    inStock: !v.trackInventory || available > 0,
    available,
  };
}

export function cardDto(p: ProductRow, region: RegionCtx): ProductCard {
  const variants = p.variants.map((v) => variantDto(v, region.currency)).filter((v): v is VariantPrice => !!v);
  const cheapest = [...variants].sort((a, b) => a.price.amount - b.price.amount)[0];
  const first = variants[0];
  const discountPct = first?.compareAt ? Math.round((1 - first.price.amount / first.compareAt.amount) * 100) : 0;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    category: { slug: p.category.slug, name: p.category.name },
    image: p.images[0]?.url ?? "/img/placeholder.webp",
    hoverImage: p.images[1]?.url ?? null,
    badge: discountPct > 0 ? `-${discountPct}%` : p.badge,
    tags: p.tags,
    diet: p.diet,
    origin: p.originDistrict,
    rating: n(p.ratingAvg),
    reviewCount: p.reviewCount,
    fromPrice: cheapest?.price ?? money(0, region.currency),
    compareAt: first?.compareAt ?? null,
    inStock: variants.some((v) => v.inStock),
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    availableInRegion: p.availableIn.length === 0 || region.countries.some((c) => p.availableIn.includes(c)),
  };
}

export function detailDto(p: ProductRow, region: RegionCtx, related: ProductRow[]): ProductDetail {
  return {
    ...cardDto(p, region),
    description: p.description,
    bodySections: (p.bodySections as { heading: string; html: string }[]) ?? [],
    images: p.images.map((i) => ({ url: i.url, alt: i.alt || p.name })),
    variants: p.variants.map((v) => variantDto(v, region.currency)).filter((v): v is VariantPrice => !!v),
    shelfLifeDays: p.shelfLifeDays,
    hsCode: p.hsCode,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    related: related.map((r) => cardDto(r, region)),
  };
}
