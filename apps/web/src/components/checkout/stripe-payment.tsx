"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js/pure";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const pk = process.env.NEXT_PUBLIC_STRIPE_PK;
const stripePromise = pk ? loadStripe(pk) : null;

function Inner({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    const r = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    if (r.error) { setErr(r.error.message ?? "Payment failed"); setBusy(false); }
  };
  return (
    <div className="grid gap-4">
      <PaymentElement />
      {err && <p className="text-[13.5px] text-danger">{err}</p>}
      <Button variant="dark" size="lg" onClick={pay} disabled={!stripe || busy}>{busy ? "Processing…" : "Pay now"}</Button>
    </div>
  );
}

/** Stripe Payment Element (cards, Apple/Google Pay, SEPA, iDEAL…). Rendered only outside India when keys exist. */
export function StripePayment({ clientSecret, returnUrl }: { clientSecret: string; returnUrl: string }) {
  if (!stripePromise) return <p className="text-danger">NEXT_PUBLIC_STRIPE_PK is not set.</p>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#1d1d1d", borderRadius: "12px", fontFamily: "DM Sans, system-ui, sans-serif" } } }}>
      <Inner returnUrl={returnUrl} />
    </Elements>
  );
}
