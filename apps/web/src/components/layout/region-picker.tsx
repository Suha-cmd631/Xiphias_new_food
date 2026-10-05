"use client";
import { useState } from "react";
import { Globe } from "lucide-react";
import { useRegions, useSelectRegion } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

const FLAG: Record<string, string> = { IN: "🇮🇳", EU: "🇪🇺", UK: "🇬🇧", US: "🇺🇸", CA: "🇨🇦", ME: "🇦🇪", ROW: "🌍" };

/** Region = currency + payment gateway + shipping zone. Detected from IP on first visit, changeable here. */
export function RegionPicker() {
  const { data } = useRegions();
  const select = useSelectRegion();
  const [open, setOpen] = useState(false);
  const current = data?.regions.find((r) => r.code === data.current);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className="inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-line px-3 text-[14px] font-medium text-ink hover:border-ink sm:px-4">
        <Globe className="h-4.5 w-4.5" />
        <span>{current ? `${FLAG[current.code]} ${current.currency}` : "…"}</span>
      </button>
      {open && data && (
        <ul role="listbox" className="anim-fadein absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-card">
          {data.regions.map((r) => (
            <li key={r.code}>
              <button
                role="option"
                aria-selected={r.code === data.current}
                disabled={select.isPending}
                onClick={() => { setOpen(false); if (r.code !== data.current) select.mutate(r.code); }}
                className={cn("flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left text-[14px] hover:bg-soft", r.code === data.current && "bg-leaf-soft font-semibold text-leaf-dark")}
              >
                <span>{FLAG[r.code]} {r.name}</span>
                <span className="text-muted">{r.currency}</span>
              </button>
            </li>
          ))}
          <li className="px-3 pb-1 pt-2 text-[11.5px] text-muted">Prices are fixed per region. India pays via JioPay, everyone else via Stripe.</li>
        </ul>
      )}
    </div>
  );
}
