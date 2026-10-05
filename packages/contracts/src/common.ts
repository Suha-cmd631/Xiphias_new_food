import { z } from "zod";

export const ApiError = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;

export const Money = z.object({
  amount: z.number(),
  currency: z.string().length(3),
  formatted: z.string(),
});
export type Money = z.infer<typeof Money>;

export const Pagination = z.object({
  page: z.number().int().min(1),
  perPage: z.number().int().min(1),
  total: z.number().int().min(0),
  pages: z.number().int().min(0),
});
export type Pagination = z.infer<typeof Pagination>;

export const CountryCode = z.string().length(2).toUpperCase();
