"use client";
import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import type { ProductCard as Card } from "@xsf/contracts";
import { useAddLine } from "@/lib/api/queries";
import { useCartDrawer } from "@/components/layout/cart-drawer";
import { Reveal } from "@/components/motion/reveal";
import { useWished, useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";
import { useQuickView } from "@/components/shop/quick-view";

/** Broccoli-style card: image swaps on hover, round quick-view / cart / wishlist buttons slide in, stars, green price. */
export function ProductCard({ p, index = 0, variantId }: { p: Card; index?: number; variantId?: string }) {
  const add = useAddLine();
  const openCart = useCartDrawer((s) => s.open);
  const toggle = useWishlist((s) => s.toggle);
  const quick = useQuickView((s) => s.open);
  const wished = useWished(p.slug);
  return (
    <Reveal as="article" delay={(index % 4) * 60} className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-card bg-soft">
        <Link href={`/products/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px" className={cn("object-cover transition-all duration-700", p.hoverImage && "group-hover:opacity-0")} />
          {p.hoverImage && <Image src={p.hoverImage} alt="" fill sizes="300px" className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />}
        </Link>
        {p.badge && p.inStock && <span className={cn("absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11.5px] font-bold", p.badge.startsWith("-") ? "bg-[#e8584a] text-white" : "bg-white/95 text-ink")}>{p.badge}</span>}
        {!p.inStock && <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-semibold text-white">Sold out</span>}
        <div className="absolute inset-x-0 bottom-3 flex translate-y-3 justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:justify-end [@media(hover:none)]:px-3 [@media(hover:none)]:opacity-100">
          <button onClick={() => quick(p.slug)} aria-label={`Quick view ${p.name}`} className="[@media(hover:none)]:hidden grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-card transition-colors hover:bg-leaf"><Eye className="h-4.5 w-4.5" /></button>
          <button
            disabled={add.isPending || !p.inStock || !p.availableInRegion}
            onClick={() => (variantId ? add.mutate({ variantId, qty: 1 }, { onSuccess: openCart }) : quick(p.slug))}
            aria-label={`Add ${p.name} to cart`}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-card transition-colors hover:bg-leaf disabled:opacity-50"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
          <button onClick={() => toggle(p.slug)} aria-pressed={wished} aria-label="Wishlist" className={cn("grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-card transition-colors hover:bg-leaf", wished && "text-[#e8584a]")}><Heart className={cn("h-4.5 w-4.5", wished && "fill-current")} /></button>
        </div>
      </div>
      <div className="mt-3.5 grid gap-1">
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-gold" aria-label={`${p.rating} out of 5`}>
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(p.rating) ? "fill-current" : "")} />)}
            <span className="ml-1 text-[12px] text-muted">({p.reviewCount})</span>
          </div>
        )}
        <h3 className="text-[18px] leading-snug"><Link href={`/products/${p.slug}`} className="hover:text-leaf-dark">{p.name}</Link></h3>
        <span className="text-[13px] text-muted">{p.subtitle}</span>
        <div className="flex items-baseline gap-2">
          <b className="text-[17px] font-semibold text-leaf-dark">{p.fromPrice.formatted}</b>
          {p.compareAt && <s className="text-[13.5px] text-muted">{p.compareAt.formatted}</s>}
        </div>
        {!p.availableInRegion && <small className="text-[12px] text-danger">Not shipped to your region</small>}
      </div>
    </Reveal>
  );
}
