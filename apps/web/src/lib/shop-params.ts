export type SP = Record<string, string | string[] | undefined>;
const KEYS = ["category", "diet", "pack", "origin", "minPrice", "maxPrice", "inStock", "onSale", "q", "sort", "page"] as const;

/** Flatten Next's searchParams into the API's query shape (multi-values are comma-joined). */
export function shopParams(sp: SP): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const k of KEYS) {
    const v = sp[k];
    if (v == null) continue;
    out[k] = Array.isArray(v) ? v.join(",") : v;
  }
  return out;
}
