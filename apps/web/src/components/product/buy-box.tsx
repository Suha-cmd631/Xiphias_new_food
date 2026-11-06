"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, Leaf } from "lucide-react";
import type { ProductDetail } from "@xsf/contracts";
import { useAddLine } from "@/lib/api/queries";
import { useCartDrawer } from "@/components/layout/cart-drawer";
import { useWished, useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";
import { unitPrice } from "@/lib/unit-price";
import { useConsent } from "@/lib/use-consent";
import { track } from "@/components/analytics/ga";

/** `initialSku` preselects a pack (used by ?variant= links from the Google feed). The phone sticky bar shares this component's state. */
export function BuyBox({ product, compact, onAdded, initialSku }: { product: ProductDetail; compact?: boolean; onAdded?: () => void; initialSku?: string }) {
  const [vi, setVi] = useState(() => Math.max(0, product.variants.findIndex((x) => x.sku === initialSku)));
  const [qty, setQty] = useState(1);
  // Phone sticky bar: shown while the main button row is off screen. Kept off while the cookie banner is open (no choice yet) so the two never overlap.
  const rowRef = useRef<HTMLDivElement>(null);
  const [offScreen, setOffScreen] = useState(false);
  const consent = useConsent();
  useEffect(() => {
    const el = rowRef.current;
    if (compact || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => setOffScreen(!entries[entries.length - 1]!.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [compact]);
  const add = useAddLine();
  const openCart = useCartDrawer((s) => s.open);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWished(product.slug);
  const v = product.variants[vi] ?? product.variants[0];
  if (!v) return <p className="mt-4 text-danger">Not available in your region.</p>;
  const pct = v.compareAt ? Math.round((1 - v.price.amount / v.compareAt.amount) * 100) : 0;
  const per = unitPrice(v);
  const canBuy = v.inStock && product.availableInRegion;
  const addToCart = () =>
    add.mutate(
      { variantId: v.id, qty },
      {
        onSuccess: () => {
          track("add_to_cart", { currency: v.price.currency, value: Math.round(v.price.amount * qty * 100) / 100, items: [{ item_id: v.sku, item_name: product.name, item_variant: v.title, item_category: product.category.name, price: v.price.amount, quantity: qty }] });
          onAdded?.();
          openCart();
        },
      },
    );
  return (
    <div className={cn("mt-5", compact && "mt-4")}>
      <div className="flex items-baseline gap-3">
        <b className="font-head text-[30px] font-medium text-leaf-dark">{v.price.formatted}</b>
        {v.compareAt && <><s className="text-[16px] text-muted">{v.compareAt.formatted}</s><span className="rounded-full bg-[#e8584a] px-2 py-0.5 text-[12px] font-bold text-white">-{pct}%</span></>}
      </div>
      {per && <p className="mt-0.5 text-[13px] text-muted">{per}</p>}
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
      <div ref={rowRef} className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex h-12 items-center rounded-full border-[1.5px] border-line">
          <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3.5"><Minus className="h-4 w-4" /></button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button aria-label="Increase" onClick={() => setQty((q) => Math.min(v.available || 99, q + 1))} className="px-3.5"><Plus className="h-4 w-4" /></button>
        </div>
        <Button variant="dark" size="lg" disabled={!canBuy || add.isPending} onClick={addToCart} className="order-last basis-full whitespace-nowrap sm:order-none sm:min-w-[180px] sm:flex-1 sm:basis-0">
          <ShoppingCart className="h-4.5 w-4.5" /> {add.isPending ? "Adding…" : v.inStock ? `Add to cart · ${formatMoney(Math.round(v.price.amount * qty * 100) / 100, v.price.currency)}` : "Sold out"}
        </Button>
        <button onClick={() => toggle(product.slug)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wished} className={cn("grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-line hover:border-ink", wished && "text-[#e8584a]")}><Heart className={cn("h-5 w-5", wished && "fill-current")} /></button>
      </div>
      {add.isError && <p className="mt-2 text-[13px] text-danger">{(add.error as Error).message}</p>}
      {v.inStock && v.available <= 5 && <p className="mt-2 text-[13px] font-semibold text-[#c0392b]">Only {v.available} left</p>}
      {!compact && (
        <ul className="mt-6 grid gap-2.5 text-[14px] text-foreground/85">
          <li className="flex items-center gap-2.5"><Truck className="h-4.5 w-4.5 text-leaf-dark" /> Ships in 1–2 days from Bengaluru · free delivery in India over ₹750</li>
          <li className="flex items-center gap-2.5"><ShieldCheck className="h-4.5 w-4.5 text-gold-deep" /> Lab-tested per lot · FSSAI licensed · 30-day returns on unopened packs</li>
          <li className="flex items-center gap-2.5"><Leaf className="h-4.5 w-4.5 text-leaf-dark" /> {product.origin ? `Sourced from ${product.origin}` : "Farm-direct sourcing"} · {product.shelfLifeDays ? `${Math.round(product.shelfLifeDays / 30)}-month shelf life` : ""}</li>
        </ul>
      )}
      {!compact && offScreen && consent !== null && typeof document !== "undefined" &&
        createPortal(
          <div role="region" aria-label="Add to cart" className="anim-fadein fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold leading-tight text-ink">{product.name}</p>
                <p className="truncate text-[13px] text-muted">{v.title} · <b className="font-semibold text-leaf-dark">{v.price.formatted}</b>{qty > 1 ? ` × ${qty}` : ""}</p>
              </div>
              <Button variant="dark" size="md" disabled={!canBuy || add.isPending} onClick={addToCart} className="shrink-0 whitespace-nowrap px-5">
                <ShoppingCart className="h-4 w-4" /> {add.isPending ? "Adding…" : v.inStock ? "Add to cart" : "Sold out"}
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
