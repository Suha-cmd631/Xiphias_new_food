import { z } from "zod";
import { Money, Pagination } from "./common.js";

export const CategorySlug = z.enum(["teas", "grains-rice", "spices", "nuts-snacks", "honey-ghee"]);
export type CategorySlug = z.infer<typeof CategorySlug>;

export const Category = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  productCount: z.number().int(),
});
export type Category = z.infer<typeof Category>;

export const VariantPrice = z.object({
  id: z.string(),
  sku: z.string(),
  title: z.string(),
  weightGrams: z.number().int(),
  price: Money,
  compareAt: Money.nullable(),
  inStock: z.boolean(),
  available: z.number().int(),
});
export type VariantPrice = z.infer<typeof VariantPrice>;

export const ProductCard = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  subtitle: z.string().nullable(),
  category: z.object({ slug: z.string(), name: z.string() }),
  image: z.string(),
  hoverImage: z.string().nullable(),
  badge: z.string().nullable(),
  tags: z.array(z.string()),
  diet: z.array(z.string()),
  origin: z.string().nullable(),
  rating: z.number(),
  reviewCount: z.number().int(),
  fromPrice: Money,
  compareAt: Money.nullable(),
  inStock: z.boolean(),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  availableInRegion: z.boolean(),
});
export type ProductCard = z.infer<typeof ProductCard>;

export const ProductDetail = ProductCard.extend({
  description: z.string(),
  bodySections: z.array(z.object({ heading: z.string(), html: z.string() })),
  images: z.array(z.object({ url: z.string(), alt: z.string() })),
  variants: z.array(VariantPrice),
  shelfLifeDays: z.number().int().nullable(),
  hsCode: z.string().nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  related: z.array(ProductCard),
});
export type ProductDetail = z.infer<typeof ProductDetail>;

export const ProductSort = z.enum(["featured", "price-asc", "price-desc", "name-asc", "name-desc", "newest"]);
export type ProductSort = z.infer<typeof ProductSort>;

export const ProductListQuery = z.object({
  category: z.string().optional(),
  diet: z.union([z.string(), z.array(z.string())]).optional(),
  pack: z.union([z.string(), z.array(z.string())]).optional(),
  origin: z.union([z.string(), z.array(z.string())]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  q: z.string().optional(),
  sort: ProductSort.default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(16),
});
export type ProductListQuery = z.infer<typeof ProductListQuery>;

export const Facet = z.object({ value: z.string(), label: z.string(), count: z.number().int() });

export const ProductListResponse = z.object({
  items: z.array(ProductCard),
  pagination: Pagination,
  facets: z.object({
    categories: z.array(Facet),
    diet: z.array(Facet),
    pack: z.array(Facet),
    origin: z.array(Facet),
    price: z.object({ min: z.number(), max: z.number() }),
  }),
});
export type ProductListResponse = z.infer<typeof ProductListResponse>;

export const SearchSuggestResponse = z.object({
  products: z.array(ProductCard.pick({ slug: true, name: true, image: true, fromPrice: true, category: true })),
  categories: z.array(Category.pick({ slug: true, name: true })),
  posts: z.array(z.object({ slug: z.string(), title: z.string() })),
});
export type SearchSuggestResponse = z.infer<typeof SearchSuggestResponse>;
