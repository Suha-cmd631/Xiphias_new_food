import type { Request } from "express";
import type { Region as RegionDto, RegionCode } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { AppError } from "../../shared/errors.js";
import { checkoutClosed, gatewaysConfigured, mockPaymentsAllowed } from "../../config/env.js";
import { resolveGateway } from "./gateway-policy.js";
import { closedCountriesOf, isCountryClosed, isRegionClosed, notOpenMessage } from "./closed.js";

export type RegionCtx = {
  code: RegionCode;
  name: string;
  currency: string;
  gateway: "jiopay" | "stripe" | "mock";
  /** false = the region's real gateway has no keys and the mock gateway is not allowed here (production). Checkout answers 503. */
  paymentsConfigured: boolean;
  /** false = checkout switched off for the whole region (CHECKOUT_CLOSED_*). */
  checkoutEnabled: boolean;
  closedCountries: string[];
  taxMode: "inclusive" | "exclusive" | "dap";
  freeShippingAbove: number | null;
  defaultCountry: string;
  priceListId: string;
  countries: string[];
};

let cache: { at: number; regions: RegionCtx[]; byCountry: Map<string, RegionCode>; countryNames: Map<string, string> } | null = null;
const TTL = 5 * 60_000;

export async function loadRegions(force = false) {
  if (!force && cache && Date.now() - cache.at < TTL) return cache;
  const rows = await prisma.region.findMany({ include: { countries: true }, orderBy: { sortOrder: "asc" } });
  const regions: RegionCtx[] = rows.map((r) => {
    const countries = r.countries.map((c) => c.countryCode);
    return {
      code: r.code as RegionCode,
      name: r.name,
      currency: r.currency,
      ...resolveGateway(r.gateway, gatewaysConfigured, mockPaymentsAllowed),
      checkoutEnabled: !isRegionClosed({ code: r.code, countries }, checkoutClosed),
      closedCountries: closedCountriesOf({ code: r.code, countries }, checkoutClosed),
      taxMode: r.taxMode,
      freeShippingAbove: r.freeShippingAbove ? Number(r.freeShippingAbove) : null,
      defaultCountry: r.defaultCountry,
      priceListId: r.priceListId,
      countries,
    };
  });
  const byCountry = new Map<string, RegionCode>();
  const countryNames = new Map<string, string>();
  for (const r of rows) for (const c of r.countries) { byCountry.set(c.countryCode, r.code as RegionCode); countryNames.set(c.countryCode, c.name); }
  cache = { at: Date.now(), regions, byCountry, countryNames };
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

export const regionNotOpen = (placeName: string, details: { region: string; country?: string }) =>
  new AppError(409, "REGION_NOT_OPEN", notOpenMessage(placeName), { ...details, infoPath: `/${(details.country ?? details.region).toLowerCase()}` });

/** Throws REGION_NOT_OPEN when the cart's region, or the destination country, is closed for checkout. */
export async function assertCheckoutOpen(region: RegionCtx, countryCode?: string | null) {
  if (!region.checkoutEnabled) throw regionNotOpen(region.name, { region: region.code, ...(region.countries.length === 1 ? { country: region.countries[0] } : {}) });
  if (!countryCode) return;
  const cc = countryCode.toUpperCase();
  const { byCountry, countryNames } = await loadRegions();
  if (isCountryClosed(cc, byCountry.get(cc) ?? region.code, checkoutClosed)) throw regionNotOpen(countryNames.get(cc) ?? cc, { region: region.code, country: cc });
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
  checkoutEnabled: r.checkoutEnabled,
  closedCountries: r.closedCountries,
});
