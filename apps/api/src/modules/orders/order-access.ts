import { createHmac } from "node:crypto";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { COOKIES, readCookie, setCookie } from "../../shared/cookies.js";
import { safeEqual } from "../../shared/secure.js";

/**
 * Guest proof that "this browser placed that order": a signed, httpOnly cookie set when checkout creates the
 * order. It lets the thank-you / mock-pay pages load the order without an account, and nobody else who merely
 * learns the order id. Format per grant: `<orderId>.<expiresEpochSeconds>.<hmac>`; a few grants joined by "~".
 */
export const ORDER_ACCESS_TTL_SECONDS = 2 * 60 * 60;
const MAX_GRANTS = 5;

const mac = (orderId: string, exp: number, secret: string) => createHmac("sha256", secret).update(`order-access:${orderId}:${exp}`).digest("base64url");

export function signOrderGrant(orderId: string, secret: string, nowMs = Date.now(), ttlSeconds = ORDER_ACCESS_TTL_SECONDS): string {
  const exp = Math.floor(nowMs / 1000) + ttlSeconds;
  return `${orderId}.${exp}.${mac(orderId, exp, secret)}`;
}

/** Returns the order id a grant authorises, or null when it is malformed, forged or expired. */
export function verifyOrderGrant(grant: string, secret: string, nowMs = Date.now()): string | null {
  const [orderId, expRaw, sig, ...rest] = grant.split(".");
  if (!orderId || !expRaw || !sig || rest.length) return null;
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp * 1000 < nowMs) return null;
  return safeEqual(sig, mac(orderId, exp, secret)) ? orderId : null;
}

export function grantedOrderIds(cookieValue: string | undefined, secret: string, nowMs = Date.now()): string[] {
  if (!cookieValue) return [];
  return cookieValue.split("~").slice(0, MAX_GRANTS).map((g) => verifyOrderGrant(g, secret, nowMs)).filter((x): x is string => x != null);
}

export function hasOrderGrant(req: Request, orderId: string): boolean {
  return grantedOrderIds(readCookie(req, COOKIES.orderAccess), env.SESSION_SECRET).includes(orderId);
}

/** Adds a grant for `orderId` to the browser's cookie (keeps the most recent few still-valid ones). */
export function grantOrderAccess(req: Request, res: Response, orderId: string) {
  const existing = (readCookie(req, COOKIES.orderAccess) ?? "").split("~").filter((g) => { const id = verifyOrderGrant(g, env.SESSION_SECRET); return id != null && id !== orderId; });
  const value = [signOrderGrant(orderId, env.SESSION_SECRET), ...existing].slice(0, MAX_GRANTS).join("~");
  setCookie(res, COOKIES.orderAccess, value, ORDER_ACCESS_TTL_SECONDS);
}
