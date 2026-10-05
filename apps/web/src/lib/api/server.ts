import "server-only";
import { cookies, headers } from "next/headers";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

/** Server-side fetch to the Express API. Forwards the visitor's cookies (region, cart, session) and geo headers. */
export async function apiGet<T>(path: string, init?: { revalidate?: number; query?: Record<string, string | number | undefined> }): Promise<T> {
  const c = await cookies();
  const h = await headers();
  const qs = init?.query ? "?" + new URLSearchParams(Object.entries(init.query).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString() : "";
  const res = await fetch(`${API}/api/v1${path}${qs}`, {
    headers: {
      cookie: c.toString(),
      ...(h.get("cloudfront-viewer-country") ? { "cloudfront-viewer-country": h.get("cloudfront-viewer-country")! } : {}),
      ...(h.get("x-vercel-ip-country") ? { "x-vercel-ip-country": h.get("x-vercel-ip-country")! } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string; details?: unknown } };
    throw new ApiError(res.status, body.error?.code ?? "HTTP_" + res.status, body.error?.message ?? res.statusText, body.error?.details);
  }
  return (await res.json()) as T;
}
