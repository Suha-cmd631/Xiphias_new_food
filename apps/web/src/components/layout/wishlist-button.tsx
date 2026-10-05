"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

/** Heart in the header. Fills in once something is saved (checked after mount — the list lives in this browser). */
export function WishlistButton() {
  const count = useWishlist((s) => s.slugs.length);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const filled = ready && count > 0;
  return (
    <Link href="/wishlist" aria-label={filled ? `Wishlist, ${count} saved` : "Wishlist"} className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-line text-ink transition-colors hover:border-ink">
      <Heart className={cn("h-5 w-5 transition-colors", filled && "fill-danger text-danger")} />
    </Link>
  );
}
