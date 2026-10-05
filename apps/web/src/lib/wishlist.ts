"use client";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Per-browser wishlist (localStorage). Drop 2 syncs it to the account via /me/wishlist. */
export const useWishlist = create<{ slugs: string[]; has: (s: string) => boolean; toggle: (s: string) => void }>()(
  persist(
    (set, get) => ({
      slugs: [],
      has: (s) => get().slugs.includes(s),
      toggle: (s) => set((st) => ({ slugs: st.slugs.includes(s) ? st.slugs.filter((x) => x !== s) : [...st.slugs, s] })),
    }),
    { name: "xsf_wishlist" },
  ),
);

const noop = () => () => {};
/**
 * Is this product saved? The list lives in the browser, so the server can't know it — this answers "no"
 * during the first paint (matching the server's HTML) and switches to the real answer right after.
 */
export function useWished(slug: string) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const saved = useWishlist((s) => s.slugs.includes(slug));
  return hydrated && saved;
}
