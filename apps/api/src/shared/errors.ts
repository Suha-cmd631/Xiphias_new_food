import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "./logger.js";

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}
export const notFound = (what = "Resource") => new AppError(404, "NOT_FOUND", `${what} not found`);
export const badRequest = (code: string, message: string, details?: unknown) => new AppError(400, code, message, details);
export const conflict = (code: string, message: string, details?: unknown) => new AppError(409, code, message, details);
export const unauthorized = (message = "Sign in required") => new AppError(401, "UNAUTHORIZED", message);
export const unavailable = (code: string, message: string) => new AppError(503, code, message);

export const notFoundHandler: RequestHandler = (_req, _res, next) => next(notFound("Route"));

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: "VALIDATION", message: "Invalid input", details: err.flatten() } });
    return;
  }
  if (err instanceof AppError) {
    if (err.status >= 500) logger.error({ err, path: req.path }, err.message);
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  logger.error({ err, path: req.path }, "Unhandled error");
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
};
