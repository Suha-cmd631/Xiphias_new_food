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
});
export type Region = z.infer<typeof Region>;

export const RegionsResponse = z.object({
  regions: z.array(Region),
  current: RegionCode,
  detectedCountry: z.string().length(2).nullable(),
});
export type RegionsResponse = z.infer<typeof RegionsResponse>;

export const SetRegionBody = z.object({ region: RegionCode });
