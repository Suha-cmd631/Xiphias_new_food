import { Suspense } from "react";
import Link from "next/link";
import { JioPayRedirect } from "./form";
import { allowedPaymentOrigins, safePaymentAction } from "./allowed";

export const metadata = { robots: { index: false } };
export const dynamic = "force-dynamic"; // reads PAYMENT_REDIRECT_ORIGINS at request time

type Params = Record<string, string | string[] | undefined>;

/**
 * Hands the shopper to the hosted payment page. The target is validated HERE, on the server, against
 * PAYMENT_REDIRECT_ORIGINS — the browser only ever receives a form whose action already passed the check.
 */
export default async function RedirectPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const action = safePaymentAction(first(sp.action), allowedPaymentOrigins());
  if (!action) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-[28px]">We couldn&apos;t start the payment</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">This payment link isn&apos;t valid, so we didn&apos;t send you anywhere. Nothing was charged. Please go back to checkout and try again.</p>
        <Link href="/checkout" className="mt-6 inline-block font-semibold underline">Back to checkout</Link>
      </div>
    );
  }
  const fields = Object.entries(sp).flatMap(([k, v]) => (k === "action" || first(v) == null ? [] : [[k, first(v)!] as [string, string]]));
  return <Suspense><JioPayRedirect action={action} fields={fields} /></Suspense>;
}
