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

/** Client IP as Express resolves it through the configured number of trusted proxies (never the raw, spoofable X-Forwarded-For). */
export function ipOf(req: Request): string | undefined {
  return (req.ip ?? req.socket.remoteAddress ?? undefined)?.trim();
}
