"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, Leaf } from "lucide-react";
import type { ProductDetail } from "@xsf/contracts";
import { useAddLine } from "@/lib/api/queries";
import { useCartDrawer } from "@/components/layout/cart-drawer";
import { useWished, useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";

export function BuyBox({ product, compact, onAdded }: { product: ProductDetail; compact?: boolean; onAdded?: () => void }) {
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const add = useAddLine();
  const openCart = useCartDrawer((s) => s.open);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWished(product.slug);
  const v = product.variants[vi] ?? product.variants[0];
  if (!v) return <p className="mt-4 text-danger">Not available in your region.</p>;
  const pct = v.compareAt ? Math.round((1 - v.price.amount / v.compareAt.amount) * 100) : 0;
  return (
    <div className={cn("mt-5", compact && "mt-4")}>
      <div className="flex items-baseline gap-3">
        <b className="font-head text-[30px] font-medium text-leaf-dark">{v.price.formatted}</b>
        {v.compareAt && <><s className="text-[16px] text-muted">{v.compareAt.formatted}</s><span className="rounded-full bg-[#e8584a] px-2 py-0.5 text-[12px] font-bold text-white">-{pct}%</span></>}
      </div>
      <p className="mt-1 text-[12.5px] text-muted">Inclusive of all taxes in India · duties may apply abroad · {v.sku}</p>
      {product.variants.length > 1 && (
        <div className="mt-4">
          <span className="text-[13px] font-semibold">Pack size</span>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
            {product.variants.map((x, i) => (
              <button key={x.id} role="radio" aria-checked={i === vi} onClick={() => { setVi(i); setQty(1); }} className={cn("h-10 rounded-full border-[1.5px] px-4 text-[14px] font-medium transition-colors", i === vi ? "border-ink bg-ink text-white" : "border-line hover:border-ink", !x.inStock && "line-through opacity-50")}>
                {x.title}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center rounded-full border-[1.5px] border-line">
          <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3.5"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button aria-label="Increase" onClick={() => setQty((q) => Math.min(v.available || 99, q + 1))} className="px-3.5"><Plus className="h-4 w-4" /></button>
        </div>
        <Button variant="dark" size="lg" disabled={!v.inStock || !product.availableInRegion || add.isPending} onClick={() => add.mutate({ variantId: v.id, qty }, { onSuccess: () => { onAdded?.(); openCart(); } })} className="order-last basis-full whitespace-nowrap sm:order-none sm:min-w-[180px] sm:flex-1 sm:basis-0">
          <ShoppingCart className="h-4.5 w-4.5" /> {add.isPending ? "Adding…" : v.inStock ? `Add to cart · ${formatMoney(Math.round(v.price.amount * qty * 100) / 100, v.price.currency)}` : "Sold out"}
        </Button>
        <button onClick={() => toggle(product.slug)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wished} className={cn("grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-line hover:border-ink", wished && "text-[#e8584a]")}><Heart className={cn("h-5 w-5", wished && "fill-current")} /></button>
      </div>
      {add.isError && <p className="mt-2 text-[13px] text-danger">{(add.error as Error).message}</p>}
      {v.inStock && v.available <= 5 && <p className="mt-2 text-[13px] font-semibold text-[#c0392b]">Only {v.available} left</p>}
      {!compact && (
        <ul className="mt-6 grid gap-2.5 text-[14px] text-[#444]">
          <li className="flex items-center gap-2.5"><Truck className="h-4.5 w-4.5 text-leaf-dark" /> Ships in 1–2 days from Bengaluru · free delivery in India over ₹750</li>
          <li className="flex items-center gap-2.5"><ShieldCheck className="h-4.5 w-4.5 text-leaf-dark" /> Certified organic · lab-tested per lot · 30-day returns on unopened packs</li>
          <li className="flex items-center gap-2.5"><Leaf className="h-4.5 w-4.5 text-leaf-dark" /> {product.origin ? `Sourced from ${product.origin}` : "Farm-direct sourcing"} · {product.shelfLifeDays ? `${Math.round(product.shelfLifeDays / 30)}-month shelf life` : ""}</li>
        </ul>
      )}
    </div>
  );
}
