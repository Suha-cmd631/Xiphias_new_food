"use client";
import { ShoppingCart } from "lucide-react";
import { useCartDrawer } from "./cart-drawer";

export function CartButton() {
  const open = useCartDrawer((s) => s.open);
  return (
    <button onClick={open} className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-leaf-dark" aria-label="Open cart">
      <ShoppingCart className="h-5 w-5" />
    </button>
  );
}
