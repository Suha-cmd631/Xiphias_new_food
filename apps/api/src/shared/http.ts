import type { Request, RequestHandler } from "express";
import type { ZodTypeAny, z } from "zod";

/** Wrap async handlers so rejections reach the error middleware (Express 5 does this natively, kept for clarity + typing). */
export const h =
  (fn: (req: Request, res: Parameters<RequestHandler>[1]) => Promise<unknown> | unknown): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (e) {
      next(e);
    }
  };

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

export function ipOf(req: Request): string | undefined {
  const xf = req.headers["x-forwarded-for"];
  const first = Array.isArray(xf) ? xf[0] : xf?.split(",")[0];
  return (first ?? req.socket.remoteAddress ?? undefined)?.trim();
}
