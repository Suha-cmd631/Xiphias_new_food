import { z } from "zod";
import { Pagination } from "./common.js";

export const PostCard = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  coverImage: z.string(),
  category: z.string(),
  publishedAt: z.string(),
  readMinutes: z.number().int(),
});
export type PostCard = z.infer<typeof PostCard>;

export const PostDetail = PostCard.extend({
  bodyHtml: z.string(),
  authorName: z.string(),
  tags: z.array(z.string()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  related: z.array(PostCard),
});
export type PostDetail = z.infer<typeof PostDetail>;

export const PostListQuery = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(48).default(12),
});

export const PostListResponse = z.object({
  items: z.array(PostCard),
  pagination: Pagination,
  categories: z.array(z.object({ name: z.string(), count: z.number().int() })),
  recent: z.array(PostCard),
});
export type PostListResponse = z.infer<typeof PostListResponse>;

export const Page = z.object({
  slug: z.string(),
  title: z.string(),
  bodyHtml: z.string(),
  updatedAt: z.string(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
});
export type Page = z.infer<typeof Page>;

export const Banner = z.object({
  id: z.string(),
  placement: z.enum(["hero", "promo", "hot_deal", "b2b"]),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  image: z.string(),
  ctaLabel: z.string().nullable(),
  ctaHref: z.string().nullable(),
});
export type Banner = z.infer<typeof Banner>;

export const NewsletterSubscribeBody = z.object({
  email: z.string().email(),
  source: z.string().max(40).default("footer"),
});
