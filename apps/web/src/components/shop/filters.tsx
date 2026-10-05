"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { ProductListResponse } from "@xsf/contracts";
import { cn } from "@/lib/utils";
import { useOverlay } from "@/lib/use-overlay";

type Facets = ProductListResponse["facets"];
const DIET_LABEL: Record<string, string> = { "gluten-free": "Gluten-free", vegan: "Vegan", "caffeine-free": "Caffeine-free", "sugar-free": "Sugar-free" };

/** Left sidebar filters. State lives in the URL (shareable, SEO-safe); the server re-renders the grid. */
export function Filters({ facets, currency, total }: { facets: Facets; currency: string; total: number }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const closeSheet = useCallback(() => setOpen(false), []);
  useOverlay(open, closeSheet);
  const [pending, start] = useTransition();
  const [price, setPrice] = useState<[number, number]>([Number(sp.get("minPrice") ?? facets.price.min), Number(sp.get("maxPrice") ?? facets.price.max)]);
  useEffect(() => setPrice([Number(sp.get("minPrice") ?? facets.price.min), Number(sp.get("maxPrice") ?? facets.price.max)]), [sp, facets.price.min, facets.price.max]);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v == null || v === "") next.delete(k); else next.set(k, v); }
    next.delete("page");
    start(() => router.push(`${path}?${next.toString()}`, { scroll: false }));
  };
  const multi = (key: string) => (sp.get(key)?.split(",").filter(Boolean) ?? []);
  const toggleMulti = (key: string, v: string) => { const cur = multi(key); set({ [key]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(",") }); };
  const activeCount = ["diet", "pack", "origin", "minPrice", "maxPrice", "inStock", "onSale"].filter((k) => sp.get(k)).length + (path === "/shop" && sp.get("category") ? 1 : 0);
  const fmt = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <details open className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between font-head text-[17px] font-medium text-ink">{title}<span className="text-muted transition-transform group-open:rotate-45">+</span></summary>
      <div className="mt-3 grid gap-2">{children}</div>
    </details>
  );
  const Check = ({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) => (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14.5px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-ink" />
      <span className="flex-1">{label}</span>
      {count != null && <small className="text-muted">{count}</small>}
    </label>
  );

  const body = (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <div className="flex items-center justify-between pb-2">
        <b className="font-head text-[20px] font-medium">Filters</b>
        {activeCount > 0 && <button onClick={() => start(() => router.push(path, { scroll: false }))} className="text-[13px] font-semibold text-leaf-dark underline">Clear all ({activeCount})</button>}
      </div>
      <Group title="Sort by">
        <select aria-label="Sort products" value={sp.get("sort") ?? "featured"} onChange={(e) => set({ sort: e.target.value })} className="h-10 rounded-lg border border-line px-3 text-[14px]">
          <option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="newest">Newest</option>
        </select>
      </Group>
      <Group title="Availability">
        <Check checked={sp.get("inStock") === "true"} onChange={() => set({ inStock: sp.get("inStock") === "true" ? null : "true" })} label="In stock only" />
        <Check checked={sp.get("onSale") === "true"} onChange={() => set({ onSale: sp.get("onSale") === "true" ? null : "true" })} label="On sale" />
      </Group>
      <Group title="Price">
        <div className="flex justify-between text-[13px] text-muted"><span>{fmt(price[0])}</span><span>{fmt(price[1])}</span></div>
        <input type="range" className="price w-full" min={facets.price.min} max={facets.price.max} value={price[0]} onChange={(e) => setPrice([Math.min(Number(e.target.value), price[1]), price[1]])} onMouseUp={() => set({ minPrice: String(price[0]) })} onTouchEnd={() => set({ minPrice: String(price[0]) })} aria-label="Minimum price" />
        <input type="range" className="price w-full" min={facets.price.min} max={facets.price.max} value={price[1]} onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value), price[0])])} onMouseUp={() => set({ maxPrice: String(price[1]) })} onTouchEnd={() => set({ maxPrice: String(price[1]) })} aria-label="Maximum price" />
      </Group>
      {path === "/shop" && (
        <Group title="Shelf">
          {facets.categories.map((c) => <Check key={c.value} checked={sp.get("category") === c.value} onChange={() => set({ category: sp.get("category") === c.value ? null : c.value })} label={c.label} count={c.count} />)}
        </Group>
      )}
      <Group title="Dietary">{facets.diet.map((d) => <Check key={d.value} checked={multi("diet").includes(d.value)} onChange={() => toggleMulti("diet", d.value)} label={DIET_LABEL[d.value] ?? d.value} count={d.count} />)}</Group>
      <Group title="Pack size">{facets.pack.map((d) => <Check key={d.value} checked={multi("pack").includes(d.value)} onChange={() => toggleMulti("pack", d.value)} label={d.label} count={d.count} />)}</Group>
      <Group title="Origin">{facets.origin.map((d) => <Check key={d.value} checked={multi("origin").includes(d.value)} onChange={() => toggleMulti("origin", d.value)} label={d.label} count={d.count} />)}</Group>
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="mb-4 inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-ink px-5 text-[14.5px] font-semibold lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters {activeCount ? `(${activeCount})` : ""}</button>
      <aside className="hidden lg:block">{body}</aside>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="anim-slidein ml-auto h-full w-[86%] max-w-sm overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="Close filters" className="float-right p-1"><X className="h-5 w-5" /></button>
            {body}
            <button onClick={() => setOpen(false)} className="mt-6 h-12 w-full rounded-full bg-ink font-semibold text-white">Show {total} products</button>
          </div>
        </div>
      )}
    </>
  );
}
