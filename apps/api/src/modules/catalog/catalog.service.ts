import type { Category, ProductCard, ProductListQuery, ProductListResponse, SearchSuggestResponse } from "@xsf/contracts";
import { notFound } from "../../shared/errors.js";
import type { RegionCtx } from "../regions/regions.service.js";
import { catalogRepo, type ProductRow } from "./catalog.repo.js";
import { cardDto, detailDto } from "./mappers.js";
import { contentRepo } from "../content/content.repo.js";

// 16 products: load once per region, filter in memory. Swap for SQL/Typesense past ~200 SKUs.
const cache = new Map<string, { at: number; rows: ProductRow[] }>();
const TTL = 60_000;
async function rows(region: RegionCtx) {
  const hit = cache.get(region.priceListId);
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  const fresh = await catalogRepo.activeProducts(region.priceListId);
  cache.set(region.priceListId, { at: Date.now(), rows: fresh });
  return fresh;
}
export const invalidateCatalog = () => cache.clear();

const arr = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : v.split(",")).filter(Boolean);
const packBucket = (g: number) => (g <= 100 ? "Up to 100 g" : g <= 500 ? "250–500 g" : g <= 1000 ? "1 kg" : "2 kg +");
const PACK_ORDER = ["Up to 100 g", "250–500 g", "1 kg", "2 kg +"];

export const catalogService = {
  async categories(): Promise<Category[]> {
    const cats = await catalogRepo.categories();
    return cats.map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description, image: c.image, productCount: c._count.products }));
  },

  async list(q: ProductListQuery, region: RegionCtx): Promise<ProductListResponse> {
    const all = await rows(region);
    const cards = all.map((p) => ({ row: p, card: cardDto(p, region) }));
    const diet = arr(q.diet), pack = arr(q.pack), origin = arr(q.origin);
    const term = q.q?.trim().toLowerCase();

    const matches = cards.filter(({ row, card }) => {
      if (q.category && card.category.slug !== q.category && card.category.name !== q.category) return false;
      if (diet.length && !diet.every((d) => card.diet.includes(d))) return false;
      if (pack.length && !row.variants.some((v) => pack.includes(packBucket(v.weightGrams)))) return false;
      if (origin.length && !origin.includes(card.origin ?? "")) return false;
      if (q.minPrice != null && card.fromPrice.amount < q.minPrice) return false;
      if (q.maxPrice != null && card.fromPrice.amount > q.maxPrice) return false;
      if (q.inStock && !card.inStock) return false;
      if (q.onSale && !card.compareAt) return false;
      if (term) {
        const hay = `${card.name} ${card.subtitle ?? ""} ${card.category.name} ${card.tags.join(" ")} ${card.origin ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    const sorters: Record<string, (a: ProductCard, b: ProductCard) => number> = {
      featured: () => 0,
      "price-asc": (a, b) => a.fromPrice.amount - b.fromPrice.amount,
      "price-desc": (a, b) => b.fromPrice.amount - a.fromPrice.amount,
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      newest: (a, b) => Number(b.isNew) - Number(a.isNew),
    };
    const sorted = [...matches].sort((a, b) => sorters[q.sort]!(a.card, b.card));
    const total = sorted.length;
    const pages = Math.max(1, Math.ceil(total / q.perPage));
    const page = Math.min(q.page, pages);
    const items = sorted.slice((page - 1) * q.perPage, page * q.perPage).map((x) => x.card);

    // Facets are computed over the category-scoped set so counts stay meaningful.
    const scope = cards.filter(({ card }) => !q.category || card.category.slug === q.category);
    const count = (fn: (x: (typeof cards)[number]) => string[]) => {
      const m = new Map<string, number>();
      for (const x of scope) for (const v of new Set(fn(x))) m.set(v, (m.get(v) ?? 0) + 1);
      return [...m.entries()].map(([value, c]) => ({ value, label: value, count: c }));
    };
    const prices = cards.map((x) => x.card.fromPrice.amount);
    return {
      items,
      pagination: { page, perPage: q.perPage, total, pages },
      facets: {
        categories: count((x) => [x.card.category.slug]).map((f) => ({ ...f, label: cards.find((c) => c.card.category.slug === f.value)!.card.category.name })),
        diet: count((x) => x.card.diet),
        pack: count((x) => x.row.variants.map((v) => packBucket(v.weightGrams))).sort((a, b) => PACK_ORDER.indexOf(a.value) - PACK_ORDER.indexOf(b.value)),
        origin: count((x) => (x.card.origin ? [x.card.origin] : [])),
        price: { min: Math.min(...prices), max: Math.max(...prices) },
      },
    };
  },

  async detail(slug: string, region: RegionCtx) {
    const p = await catalogRepo.productBySlug(slug, region.priceListId);
    if (!p) throw notFound("Product");
    const all = await rows(region);
    const related = all.filter((r) => r.categoryId === p.categoryId && r.id !== p.id).slice(0, 4);
    const filled = related.length < 4 ? [...related, ...all.filter((r) => r.id !== p.id && !related.includes(r)).slice(0, 4 - related.length)] : related;
    return detailDto(p, region, filled);
  },

  async bestsellers(region: RegionCtx, limit = 8) {
    const all = await rows(region);
    return all.filter((p) => p.isBestseller).concat(all.filter((p) => !p.isBestseller)).slice(0, limit).map((p) => cardDto(p, region));
  },

  async suggest(term: string, region: RegionCtx): Promise<SearchSuggestResponse> {
    const t = term.trim().toLowerCase();
    if (t.length < 2) return { products: [], categories: [], posts: [] };
    const all = await rows(region);
    const products = all
      .map((p) => cardDto(p, region))
      .filter((c) => `${c.name} ${c.subtitle ?? ""} ${c.category.name} ${c.tags.join(" ")}`.toLowerCase().includes(t))
      .slice(0, 6)
      .map(({ slug, name, image, fromPrice, category }) => ({ slug, name, image, fromPrice, category }));
    const categories = (await this.categories()).filter((c) => c.name.toLowerCase().includes(t)).map(({ slug, name }) => ({ slug, name }));
    const posts = (await contentRepo.searchPosts(t, 4)).map((p) => ({ slug: p.slug, title: p.title }));
    return { products, categories, posts };
  },
};
