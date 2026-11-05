import "server-only";
import type { RegionCode } from "@xsf/contracts";
import { ApiError } from "./server";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

/**
 * Server-side fetch for a FIXED region, independent of the visitor (used by /us, /ca and the Google feed).
 *
 * The API resolves the region as: `xsf_region` cookie → `X-Region` header → geo header → IN. `apiGet` forwards the
 * visitor's cookies, so their own region would win. Here we send no visitor cookies at all — only a region cookie and
 * the header for the region we want — so a shopper browsing in INR still sees real USD prices on a US page.
 * Because nothing visitor-specific is sent, never use this for cart, account or checkout calls.
 */
export async function apiGetForRegion<T>(region: RegionCode, path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const qs = query ? "?" + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString() : "";
  const res = await fetch(`${API}/api/v1${path}${qs}`, { headers: { cookie: `xsf_region=${region}`, "x-region": region }, cache: "no-store" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string; details?: unknown } };
    throw new ApiError(res.status, body.error?.code ?? "HTTP_" + res.status, body.error?.message ?? res.statusText, body.error?.details);
  }
  return (await res.json()) as T;
}
