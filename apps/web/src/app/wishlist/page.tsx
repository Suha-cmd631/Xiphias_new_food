"use client";
import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import { useWishlistProducts } from "@/lib/api/queries";
import { useWishlist } from "@/lib/wishlist";
import { PageHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { ProductCard } from "@/components/shop/product-card";
import { QuickView } from "@/components/shop/quick-view";

export default function WishlistPage() {
  const slugs = useWishlist((s) => s.slugs);
  const toggle = useWishlist((s) => s.toggle);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const q = useWishlistProducts(ready && slugs.length > 0);
  const items = (q.data?.items ?? []).filter((p) => slugs.includes(p.slug));
  const count = !ready ? 0 : q.data ? items.length : slugs.length;

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Wishlist" }]}
        title="Your wishlist"
        text={count ? `${count} saved ${count === 1 ? "item" : "items"} saved on this device.` : "Products you save with the heart show up here."}
      />
      <div className="wrap pb-20 pt-8">
        {!ready || q.isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square" />)}
          </div>
        ) : q.isError ? (
          <ErrorState message="We couldn't load your wishlist." onRetry={() => void q.refetch()} />
        ) : items.length === 0 ? (
          <div className="grid justify-items-center gap-4 rounded-card bg-soft px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white"><Heart className="h-7 w-7 text-leaf-dark" /></span>
            <h2 className="text-[26px]">Nothing saved yet</h2>
            <p className="max-w-[44ch] text-[15px] text-muted">Hover any product and tap the heart to keep it here for later.</p>
            <ButtonLink href="/shop">Browse the shop</ButtonLink>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-7">
            {items.map((p, i) => (
              <div key={p.slug}>
                <ProductCard p={p} index={i} />
                <button type="button" onClick={() => toggle(p.slug)} className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-danger">
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <QuickView />
    </>
  );
}
