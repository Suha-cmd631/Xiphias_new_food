import type { Request, Response } from "express";
import { parse, serialize } from "cookie";
import { env, isProd } from "../config/env.js";

export const COOKIES = { region: "xsf_region", cart: "xsf_cart", session: "xsf_session" } as const;

export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  return parse(raw)[name];
}

export function setCookie(res: Response, name: string, value: string, maxAgeSeconds: number) {
  res.append(
    "Set-Cookie",
    serialize(name, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: maxAgeSeconds,
      ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
    }),
  );
}

export function clearCookie(res: Response, name: string) {
  setCookie(res, name, "", 0);
}
