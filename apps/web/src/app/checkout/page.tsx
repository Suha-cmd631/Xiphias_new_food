"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { useCart, useCreateCheckout, useRegions } from "@/lib/api/queries";
import { AddressForm } from "@/components/checkout/address-form";
import { ShippingOptions } from "@/components/checkout/shipping-options";
import { StripePayment } from "@/components/checkout/stripe-payment";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

type Step = "address" | "shipping" | "payment";

export default function CheckoutPage() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const regions = useRegions();
  const create = useCreateCheckout();
  const [step, setStep] = useState<Step | null>(null);
  const [notes, setNotes] = useState("");
  const [optIn, setOptIn] = useState(false);

  if (isLoading || regions.isLoading) return <div className="wrap py-10"><Skeleton className="h-96" /></div>;
  if (isError || !cart || !regions.data) return <div className="wrap py-10"><ErrorState message="Couldn't load checkout." onRetry={() => refetch()} /></div>;
  if (cart.lines.length === 0 && !create.data) return <div className="wrap py-24 text-center"><h1 className="text-[32px]">Your cart is empty</h1><ButtonLink href="/shop" variant="dark" className="mt-5">Back to the shop</ButtonLink></div>;

  const region = regions.data.regions.find((r) => r.code === regions.data!.current)!;
  const current: Step = step ?? (!cart.shippingAddress ? "address" : !cart.shippingOption ? "shipping" : "payment");
  const steps: Step[] = ["address", "shipping", "payment"];
  const idx = steps.indexOf(current);

  const placeOrder = () => create.mutate({ notes: notes || undefined, marketingOptIn: optIn }, {
    onSuccess: (r) => { if (r.redirectUrl) window.location.href = r.redirectUrl; },
  });

  return (
    <div className="wrap pb-20 pt-8">
      <h1 className="text-[clamp(30px,4vw,44px)]">Checkout</h1>
      <ol className="mt-4 flex gap-2 text-[13.5px]">
        {steps.map((s, i) => (
          <li key={s} className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", i === idx ? "bg-ink text-white" : i < idx ? "bg-leaf-soft text-leaf-dark" : "bg-soft text-muted")}>
            {i < idx ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
            <button disabled={i > idx} onClick={() => setStep(s)} className="capitalize disabled:cursor-default">{s}</button>
          </li>
        ))}
      </ol>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="rounded-card border border-line p-6 sm:p-8">
          {current === "address" && <><h2 className="mb-5 text-[24px]">Shipping address</h2><AddressForm cart={cart} regions={regions.data} onDone={() => setStep("shipping")} /></>}
          {current === "shipping" && (
            <>
              <h2 className="mb-1 text-[24px]">Shipping method</h2>
              <p className="mb-5 text-[14px] text-muted">To {cart.shippingAddress?.line1}, {cart.shippingAddress?.city}, {cart.shippingAddress?.countryCode} · <button onClick={() => setStep("address")} className="underline">change</button></p>
              <ShippingOptions cart={cart} />
              {region.taxMode === "dap" && <Notice tone="warn" className="mt-4">Import duties / VAT, where applicable, are collected by the carrier before delivery.</Notice>}
              <Button variant="dark" size="lg" className="mt-6" disabled={!cart.shippingOption} onClick={() => setStep("payment")}>Continue to payment</Button>
            </>
          )}
          {current === "payment" && (
            <>
              <h2 className="mb-1 text-[24px]">Payment</h2>
              <p className="mb-5 flex items-center gap-2 text-[14px] text-muted"><Lock className="h-4 w-4" /> {region.gateway === "jiopay" ? "UPI, cards, net-banking and wallets via JioPay" : region.gateway === "stripe" ? "Cards, Apple Pay, Google Pay and local methods via Stripe" : "Test mode — the built-in mock gateway (no real keys configured)"}</p>
              {create.data?.clientSecret ? (
                <StripePayment clientSecret={create.data.clientSecret} returnUrl={`${window.location.origin}/checkout/thank-you/${create.data.orderId}`} />
              ) : (
                <div className="grid gap-4">
                  <label className="grid gap-1.5 text-[13.5px] font-semibold">Order notes (optional)<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl border-[1.5px] border-line px-4 py-3 font-normal outline-none focus:border-ink" placeholder="Delivery instructions, gift note…" /></label>
                  <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="h-4 w-4 accent-ink" /> Email me recipes and offers (unsubscribe any time)</label>
                  <p className="text-[12.5px] text-muted">By placing the order you accept our <Link href="/policies/terms" className="underline">terms</Link>, <Link href="/policies/returns" className="underline">returns policy</Link> and <Link href="/policies/privacy" className="underline">privacy policy</Link>.</p>
                  {create.isError && <p className="text-[13.5px] text-danger">{(create.error as Error).message}</p>}
                  <Button variant="dark" size="lg" onClick={placeOrder} disabled={create.isPending || !cart.shippingOption}>{create.isPending ? "Preparing payment…" : `Pay ${cart.totals.grandTotal.formatted}`}</Button>
                </div>
              )}
            </>
          )}
        </div>
        <aside className="h-fit rounded-card bg-soft p-6 lg:sticky lg:top-40">
          <h2 className="text-[20px]">Order summary</h2>
          <ul className="mt-4 grid gap-3">
            {cart.lines.map((l) => (
              <li key={l.id} className="flex items-center gap-3 text-[14px]"><Image src={l.image} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" /><span className="flex-1">{l.productName} <small className="text-muted">· {l.variantTitle} × {l.qty}</small></span><b>{l.lineTotal.formatted}</b></li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-1.5 border-t border-line pt-4 text-[14.5px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{cart.totals.subtotal.formatted}</dd></div>
            {cart.totals.discount.amount > 0 && <div className="flex justify-between text-leaf-dark"><dt>Discount ({cart.couponCode})</dt><dd>−{cart.totals.discount.formatted}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{cart.shippingOption ? (cart.totals.shipping.amount === 0 ? "Free" : cart.totals.shipping.formatted) : "—"}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-[18px] font-semibold"><dt>Total</dt><dd>{cart.totals.grandTotal.formatted}</dd></div>
          </dl>
          <p className="mt-3 text-[12px] text-muted">{region.taxMode === "inclusive" ? "Prices include GST." : region.taxMode === "exclusive" ? "No sales tax collected." : "Duties/VAT may be charged on delivery."}</p>
        </aside>
      </div>
    </div>
  );
}
