import type { Request } from "express";
import type { Region as RegionDto, RegionCode } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { gatewaysConfigured } from "../../config/env.js";

export type RegionCtx = {
  code: RegionCode;
  name: string;
  currency: string;
  gateway: "jiopay" | "stripe" | "mock";
  taxMode: "inclusive" | "exclusive" | "dap";
  freeShippingAbove: number | null;
  defaultCountry: string;
  priceListId: string;
  countries: string[];
};

let cache: { at: number; regions: RegionCtx[]; byCountry: Map<string, RegionCode> } | null = null;
const TTL = 5 * 60_000;

export async function loadRegions(force = false) {
  if (!force && cache && Date.now() - cache.at < TTL) return cache;
  const rows = await prisma.region.findMany({ include: { countries: true }, orderBy: { sortOrder: "asc" } });
  const regions: RegionCtx[] = rows.map((r) => ({
    code: r.code as RegionCode,
    name: r.name,
    currency: r.currency,
    // Unconfigured gateways fall back to the mock gateway so local checkout still works.
    gateway: r.gateway === "stripe" && gatewaysConfigured.stripe ? "stripe" : r.gateway === "jiopay" && gatewaysConfigured.jiopay ? "jiopay" : "mock",
    taxMode: r.taxMode,
    freeShippingAbove: r.freeShippingAbove ? Number(r.freeShippingAbove) : null,
    defaultCountry: r.defaultCountry,
    priceListId: r.priceListId,
    countries: r.countries.map((c) => c.countryCode),
  }));
  const byCountry = new Map<string, RegionCode>();
  for (const r of rows) for (const c of r.countries) byCountry.set(c.countryCode, r.code as RegionCode);
  cache = { at: Date.now(), regions, byCountry };
  return cache;
}

export async function regionByCode(code: string): Promise<RegionCtx | undefined> {
  const { regions } = await loadRegions();
  return regions.find((r) => r.code === code);
}

export async function regionForCountry(cc: string): Promise<RegionCode> {
  const { byCountry } = await loadRegions();
  return byCountry.get(cc.toUpperCase()) ?? "ROW";
}

/** Country from edge headers (CloudFront / Cloudflare / Vercel), used only when no cookie is set. */
export function detectCountry(req: Request): string | null {
  const h = req.headers;
  const v = (h["cloudfront-viewer-country"] ?? h["cf-ipcountry"] ?? h["x-vercel-ip-country"] ?? h["x-country"]) as string | undefined;
  return v && /^[A-Za-z]{2}$/.test(v) ? v.toUpperCase() : null;
}

export const toDto = (r: RegionCtx): RegionDto => ({
  code: r.code,
  name: r.name,
  currency: r.currency,
  gateway: r.gateway,
  taxMode: r.taxMode,
  freeShippingAbove: r.freeShippingAbove,
  countries: r.countries,
  defaultCountry: r.defaultCountry,
});
