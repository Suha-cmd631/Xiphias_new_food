/**
 * Where checkout is switched off (pure rules, unit-tested).
 * Config: CHECKOUT_CLOSED_COUNTRIES (ISO country codes, default "CA") and CHECKOUT_CLOSED_REGIONS (region codes).
 * - A country is closed when it is listed, or when its whole region is listed.
 * - A region is closed when it is listed, or when every country it serves is closed
 *   (Canada is its own single-country region, so closing country CA closes region CA too).
 * Prices stay visible everywhere; only placing an order is refused.
 */
export type ClosedConfig = { countries: string[]; regions: string[] };

const up = (s: string) => s.trim().toUpperCase();

export function isCountryClosed(countryCode: string, regionCode: string | undefined, cfg: ClosedConfig): boolean {
  return cfg.countries.includes(up(countryCode)) || (regionCode != null && cfg.regions.includes(up(regionCode)));
}

export function closedCountriesOf(region: { code: string; countries: string[] }, cfg: ClosedConfig): string[] {
  return region.countries.filter((c) => isCountryClosed(c, region.code, cfg));
}

export function isRegionClosed(region: { code: string; countries: string[] }, cfg: ClosedConfig): boolean {
  if (cfg.regions.includes(up(region.code))) return true;
  return region.countries.length > 0 && region.countries.every((c) => cfg.countries.includes(up(c)));
}

export function notOpenMessage(placeName: string): string {
  return `We don't deliver to ${placeName} yet. You can still browse products and prices, and we'll announce it as soon as orders open.`;
}
