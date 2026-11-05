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

/**
 * Pack shots on a white studio background, keyed by the bowl photo's file name (/img/<name>.webp).
 * The API gives `image` = bowl close-up and, for some products, `hoverImage` = pack. The card leads with the pack
 * (it is what arrives at the door) and keeps the bowl for hover. Until every product has `hoverImage` in the
 * catalogue, the file convention below fills the gap; `pack_*` are the same photos with the background evened to white.
 */
const PACKS: Record<string, string> = {
  rice: "/img/pack_rice.webp", ghee: "/img/pack_ghee.webp", white: "/img/alt_white.webp", masala: "/img/alt_masala.webp", bluepea: "/img/alt_bluepea.webp",
  green: "/img/alt_green.webp", stevia: "/img/alt_stevia.webp", joha: "/img/alt_joha.webp", buckwheat: "/img/alt_buckwheat.webp", korai: "/img/alt_korai.webp",
  pepper: "/img/alt_pepper.webp", ginger: "/img/alt_ginger.webp", gingerpowder: "/img/alt_gingerpowder.webp", almonds: "/img/alt_almonds.webp", honey: "/img/alt_honey.webp",
  makhana: "/img/alt_makhana.webp",
};
/** Photos that are not on a white background: shown as-is, without the multiply blend. */
const NO_BLEND = new Set(["/img/alt_makhana.webp"]);

export function cardImages(p: Pick<Card, "image" | "hoverImage">): { main: string; hover: string | null; blend: boolean } {
  const name = /^\/img\/([a-z0-9]+)\.webp$/.exec(p.image)?.[1];
  const pack = (name && PACKS[name]) || p.hoverImage;
  if (!pack || pack === p.image) return { main: p.image, hover: null, blend: false };
  return { main: pack, hover: p.image, blend: !NO_BLEND.has(pack) };
}

/** Editorial card: pack shot on a soft tile (bowl close-up on hover), quiet round actions, serif name, navy price. */
export function ProductCard({ p, index = 0, variantId }: { p: Card; index?: number; variantId?: string }) {
  const add = useAddLine();
  const openCart = useCartDrawer((s) => s.open);
  const toggle = useWishlist((s) => s.toggle);
  const quick = useQuickView((s) => s.open);
  const wished = useWished(p.slug);
  const img = cardImages(p);
  const action = "grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft ring-1 ring-ink/5 transition-colors hover:bg-ink hover:text-white";
  return (
    <Reveal as="article" delay={(index % 4) * 60} className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-card bg-soft">
        <Link href={`/products/${p.slug}`} aria-label={p.name} className="absolute inset-0">
          {/* blend sits on the <img> itself so the white studio background takes the tile colour */}
          <Image src={img.main} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px" className={cn("object-cover transition-all duration-700", img.blend && "mix-blend-multiply", img.hover ? "group-hover:opacity-0" : "group-hover:scale-[1.03]")} />
          {img.hover && <Image src={img.hover} alt="" fill sizes="300px" className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />}
        </Link>
        {p.badge && p.inStock && <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]", p.badge.startsWith("-") ? "bg-sale text-white" : "bg-white/90 text-ink ring-1 ring-gold/70")}>{p.badge}</span>}
        {!p.inStock && <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] text-white">Sold out</span>}
        <div className="absolute inset-x-0 bottom-3 flex translate-y-3 justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:justify-end [@media(hover:none)]:px-3 [@media(hover:none)]:opacity-100">
          <button onClick={() => quick(p.slug)} aria-label={`Quick view ${p.name}`} className={cn(action, "[@media(hover:none)]:hidden")}><Eye className="h-4.5 w-4.5" /></button>
          <button
            disabled={add.isPending || !p.inStock || !p.availableInRegion}
            onClick={() => (variantId ? add.mutate({ variantId, qty: 1 }, { onSuccess: openCart }) : quick(p.slug))}
            aria-label={`Add ${p.name} to cart`}
            className={cn(action, "disabled:opacity-50")}
          >
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
          <button onClick={() => toggle(p.slug)} aria-pressed={wished} aria-label="Wishlist" className={cn(action, wished && "text-sale")}><Heart className={cn("h-4.5 w-4.5", wished && "fill-current")} /></button>
        </div>
      </div>
      <div className="mt-4 grid gap-1">
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-gold" aria-label={`${p.rating} out of 5`}>
            {[0, 1, 2, 3, 4].map((i) => <Star key={i} className={cn("h-3.5 w-3.5", i < Math.round(p.rating) ? "fill-current" : "")} />)}
            <span className="ml-1 text-[12px] text-muted">({p.reviewCount})</span>
          </div>
        )}
        <h3 className="text-[18.5px] leading-snug sm:text-[20px]"><Link href={`/products/${p.slug}`} className="transition-colors hover:text-royal">{p.name}</Link></h3>
        <span className="text-[13px] text-muted">{p.subtitle}</span>
        <div className="mt-0.5 flex items-baseline gap-2">
          <b className="text-[16.5px] font-semibold tabular-nums text-ink">{p.fromPrice.formatted}</b>
          {p.compareAt && <s className="text-[13.5px] text-muted">{p.compareAt.formatted}</s>}
        </div>
        {!p.availableInRegion && <small className="text-[12px] text-danger">Not shipped to your region</small>}
      </div>
    </Reveal>
  );
}
