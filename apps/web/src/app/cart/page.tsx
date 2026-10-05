"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useApplyCoupon, useCart, useRemoveCoupon, useRemoveLine, useUpdateLine } from "@/lib/api/queries";
import { PageHeader } from "@/components/ui/section";
import { ButtonLink, Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";

export default function CartPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const update = useUpdateLine();
  const remove = useRemoveLine();
  const apply = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState("");
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Cart" }]} title="Your cart" />
      <div className="wrap pb-20 pt-6">
        {isLoading && <Skeleton className="h-64" />}
        {isError && <ErrorState message="Couldn't load your cart." onRetry={() => refetch()} />}
        {cart && cart.lines.length === 0 && (
          <div className="rounded-card bg-soft px-6 py-20 text-center"><p className="text-[20px] font-medium">Your cart is empty.</p><ButtonLink href="/shop" variant="dark" className="mt-5">Start shopping</ButtonLink></div>
        )}
        {cart && cart.lines.length > 0 && (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              {cart.messages.map((m, i) => <p key={i} className="mb-3 rounded-lg bg-sand px-4 py-2.5 text-[14px]">{m.text}</p>)}
              <ul className="divide-y divide-line">
                {cart.lines.map((l) => (
                  <li key={l.id} className="flex gap-4 py-5">
                    <Image src={l.image} alt="" width={96} height={96} className="h-24 w-24 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${l.productSlug}`} className="text-[17px] font-medium text-ink hover:text-leaf-dark">{l.productName}</Link>
                      <p className="text-[13.5px] text-muted">{l.variantTitle} · {l.unitPrice.formatted} each{l.compareAt ? <s className="ml-2">{l.compareAt.formatted}</s> : null}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="inline-flex h-10 items-center rounded-full border border-line">
                          <button aria-label="Decrease" onClick={() => update.mutate({ id: l.id, qty: l.qty - 1 })} className="px-3"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-6 text-center text-[14px]">{l.qty}</span>
                          <button aria-label="Increase" disabled={l.qty >= l.available} onClick={() => update.mutate({ id: l.id, qty: l.qty + 1 })} className="px-3 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => remove.mutate(l.id)} className="inline-flex items-center gap-1 text-[13px] text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                      </div>
                    </div>
                    <b className="text-[17px]">{l.lineTotal.formatted}</b>
                  </li>
                ))}
              </ul>
              <Link href="/shop" className="mt-4 inline-block text-[14px] font-semibold text-leaf-dark underline">← Continue shopping</Link>
            </div>
            <aside className="h-fit rounded-card bg-soft p-6 lg:sticky lg:top-40">
              <h2 className="text-[22px]">Summary</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) apply.mutate(code.trim(), { onSuccess: () => setCode("") }); }} className="mt-4 flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-4 text-[14px] uppercase outline-none focus:border-ink" />
                <Button type="submit" size="sm" className="h-11" disabled={apply.isPending}>Apply</Button>
              </form>
              {apply.isError && <p className="mt-2 text-[13px] text-danger">{(apply.error as Error).message}</p>}
              {cart.couponCode && <p className="mt-2 flex items-center justify-between text-[13.5px] text-leaf-dark"><span>Code <b>{cart.couponCode}</b> applied</span><button onClick={() => removeCoupon.mutate()} className="underline">Remove</button></p>}
              <dl className="mt-5 grid gap-2 text-[15px]">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{cart.totals.subtotal.formatted}</dd></div>
                {cart.totals.discount.amount > 0 && <div className="flex justify-between text-leaf-dark"><dt>Discount</dt><dd>−{cart.totals.discount.formatted}</dd></div>}
                <div className="flex justify-between text-muted"><dt>Shipping</dt><dd>calculated at checkout</dd></div>
                <div className="flex justify-between border-t border-line pt-3 text-[18px] font-semibold"><dt>Total</dt><dd>{cart.totals.grandTotal.formatted}</dd></div>
              </dl>
              {cart.totals.freeShippingRemaining && <p className="mt-3 text-[13px] text-leaf-dark">Add {cart.totals.freeShippingRemaining.formatted} more for free shipping.</p>}
              <ButtonLink href="/checkout" variant="dark" size="lg" className="mt-5 w-full">Proceed to checkout</ButtonLink>
              <p className="mt-3 text-center text-[12px] text-muted">Secure checkout · JioPay (India) · Stripe (worldwide)</p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
