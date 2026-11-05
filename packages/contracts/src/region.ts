import { z } from "zod";

export const RegionCode = z.enum(["IN", "EU", "UK", "US", "CA", "ME", "ROW"]);
export type RegionCode = z.infer<typeof RegionCode>;

export const Gateway = z.enum(["jiopay", "stripe", "mock"]);
export type Gateway = z.infer<typeof Gateway>;

export const Region = z.object({
  code: RegionCode,
  name: z.string(),
  currency: z.string().length(3),
  gateway: Gateway,
  taxMode: z.enum(["inclusive", "exclusive", "dap"]),
  freeShippingAbove: z.number().nullable(),
  countries: z.array(z.string().length(2)),
  defaultCountry: z.string().length(2),
  /** false while we cannot take orders for this region (e.g. Canada until import clearance). Prices still display. */
  checkoutEnabled: z.boolean().optional().default(true),
  /** Countries inside this region that are closed for checkout (subset of `countries`). */
  closedCountries: z.array(z.string().length(2)).optional().default([]),
});
export type Region = z.infer<typeof Region>;

export const RegionsResponse = z.object({
  regions: z.array(Region),
  current: RegionCode,
  detectedCountry: z.string().length(2).nullable(),
});
export type RegionsResponse = z.infer<typeof RegionsResponse>;

export const SetRegionBody = z.object({ region: RegionCode });
