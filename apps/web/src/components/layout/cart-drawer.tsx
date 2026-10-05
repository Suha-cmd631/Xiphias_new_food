"use client";
import { create } from "zustand";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart, useRemoveLine, useUpdateLine } from "@/lib/api/queries";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { useOverlay } from "@/lib/use-overlay";

export const useCartDrawer = create<{ isOpen: boolean; open: () => void; close: () => void }>((set) => ({ isOpen: false, open: () => set({ isOpen: true }), close: () => set({ isOpen: false }) }));

export function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const update = useUpdateLine();
  const remove = useRemoveLine();
  useOverlay(isOpen, close);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40" onClick={close} role="dialog" aria-modal="true" aria-label="Your cart">
      <aside className="anim-slidein ml-auto flex h-full w-full max-w-md flex-col bg-white" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-[22px]">Your cart {cart ? `(${cart.itemCount})` : ""}</h2>
          <button onClick={close} aria-label="Close cart" className="p-1"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && <div className="grid gap-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
          {isError && <ErrorState message="Couldn't load your cart." onRetry={() => refetch()} />}
          {cart && cart.lines.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-[17px] font-medium">Your cart is empty.</p>
              <p className="mt-1 text-muted">Add a few honest foods from the shelves.</p>
              <ButtonLink href="/shop" variant="dark" className="mt-5" onClick={close}>Start shopping</ButtonLink>
            </div>
          )}
          {cart?.messages.map((m, i) => <p key={i} className="mb-3 rounded-lg bg-sand px-3 py-2 text-[13px]">{m.text}</p>)}
          <ul className="grid gap-4">
            {cart?.lines.map((l) => (
              <li key={l.id} className="flex gap-3">
                <Image src={l.image} alt="" width={72} height={72} className="h-18 w-18 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${l.productSlug}`} onClick={close} className="line-clamp-1 font-medium text-ink">{l.productName}</Link>
                  <small className="text-muted">{l.variantTitle}</small>
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button aria-label="Decrease" disabled={update.isPending} onClick={() => update.mutate({ id: l.id, qty: l.qty - 1 })} className="p-1.5"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-[14px]">{l.qty}</span>
                      <button aria-label="Increase" disabled={update.isPending || l.qty >= l.available} onClick={() => update.mutate({ id: l.id, qty: l.qty + 1 })} className="p-1.5"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <b className="text-[15px]">{l.lineTotal.formatted}</b>
                  </div>
                </div>
                <button aria-label="Remove" onClick={() => remove.mutate(l.id)} className="self-start p-1 text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </div>
        {cart && cart.lines.length > 0 && (
          <footer className="border-t border-line px-6 py-4">
            {cart.totals.freeShippingRemaining && <p className="mb-2 text-[13px] text-leaf-dark">Add {cart.totals.freeShippingRemaining.formatted} more for free shipping.</p>}
            <div className="flex justify-between text-[15px]"><span>Subtotal</span><b>{cart.totals.subtotal.formatted}</b></div>
            {cart.totals.discount.amount > 0 && <div className="flex justify-between text-[14px] text-leaf-dark"><span>Discount ({cart.couponCode})</span><span>−{cart.totals.discount.formatted}</span></div>}
            <p className="mt-1 text-[12.5px] text-muted">Shipping and any duties are calculated at checkout.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ButtonLink href="/cart" onClick={close}>View cart</ButtonLink>
              <ButtonLink href="/checkout" variant="dark" onClick={close}>Checkout</ButtonLink>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
