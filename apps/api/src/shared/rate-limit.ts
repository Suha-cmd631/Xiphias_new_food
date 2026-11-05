import type { RequestHandler } from "express";
import { AppError } from "./errors.js";

/**
 * Small in-memory sliding-window rate limiter (no dependency).
 *
 * Keyed by route group + client IP (`req.ip`, which honours Express "trust proxy" — set TRUST_PROXY
 * to the number of proxies in front of the API, otherwise every visitor shares the proxy's address
 * or can spoof X-Forwarded-For).
 *
 * State lives in this process: with more than one API instance each instance counts separately, so
 * the effective limit is multiplied by the instance count. Move the store to Redis (REDIS_URL is
 * already in the env) before scaling horizontally.
 */
export class SlidingWindowLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    readonly limit: number,
    readonly windowMs: number,
    private now: () => number = Date.now,
    private maxKeys = 50_000,
  ) {}

  /** Records one hit. `allowed` is false once `limit` hits already happened inside the window. */
  hit(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const t = this.now();
    const from = t - this.windowMs;
    const list = (this.hits.get(key) ?? []).filter((x) => x > from);
    if (list.length >= this.limit) {
      this.hits.set(key, list);
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(1, list[0]! + this.windowMs - t) };
    }
    list.push(t);
    if (!this.hits.has(key) && this.hits.size >= this.maxKeys) this.prune();
    // Still full after pruning (flood of distinct keys): drop the oldest entry rather than grow without bound.
    if (!this.hits.has(key) && this.hits.size >= this.maxKeys) {
      const oldest = this.hits.keys().next().value;
      if (oldest !== undefined) this.hits.delete(oldest);
    }
    this.hits.set(key, list);
    return { allowed: true, remaining: this.limit - list.length, retryAfterMs: 0 };
  }

  /** Forget keys with no hit inside the window. */
  prune() {
    const from = this.now() - this.windowMs;
    for (const [k, list] of this.hits) {
      const live = list.filter((x) => x > from);
      if (live.length) this.hits.set(k, live);
      else this.hits.delete(k);
    }
  }

  get size() {
    return this.hits.size;
  }
}

const limiters: SlidingWindowLimiter[] = [];
const sweep = setInterval(() => limiters.forEach((l) => l.prune()), 60_000);
sweep.unref();

/** Express middleware: at most `limit` requests per `windowSeconds` for one IP within `group`. */
export function rateLimit(group: string, limit: number, windowSeconds: number): RequestHandler {
  const limiter = new SlidingWindowLimiter(limit, windowSeconds * 1000);
  limiters.push(limiter);
  return (req, res, next) => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const r = limiter.hit(`${group}:${ip}`);
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(r.remaining));
    if (r.allowed) return next();
    const retry = Math.ceil(r.retryAfterMs / 1000);
    res.setHeader("Retry-After", String(retry));
    next(new AppError(429, "RATE_LIMITED", `Too many attempts. Please try again in ${retry < 90 ? `${retry} seconds` : `${Math.ceil(retry / 60)} minutes`}.`, { retryAfterSeconds: retry }));
  };
}

/** Limits per IP. Generous enough for real shoppers (and shared office/mobile IPs), tight enough to stop scripted abuse. */
type LimitName = "login" | "register" | "contact" | "b2bQuote" | "newsletter" | "track" | "orderLookup" | "coupon" | "checkoutCreate";
export const limits: Record<LimitName, () => RequestHandler> = {
  login: () => rateLimit("login", 10, 15 * 60),
  register: () => rateLimit("register", 5, 60 * 60),
  contact: () => rateLimit("contact", 5, 10 * 60),
  b2bQuote: () => rateLimit("b2b", 5, 10 * 60),
  newsletter: () => rateLimit("newsletter", 5, 10 * 60),
  track: () => rateLimit("track", 15, 10 * 60),
  orderLookup: () => rateLimit("order", 60, 10 * 60),
  coupon: () => rateLimit("coupon", 10, 10 * 60),
  checkoutCreate: () => rateLimit("checkout", 10, 10 * 60),
};
