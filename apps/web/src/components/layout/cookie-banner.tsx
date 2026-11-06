"use client";
import Link from "next/link";
import { writeConsent, type Consent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";
import { useEffect, useState } from "react";

/**
 * Small, non-blocking cookie notice. Remembers the choice per browser for a year (cookie `xsf_cookie_consent`) and
 * announces it through lib/consent, so analytics and the phone add-to-cart bar react at once, without a reload.
 */
export function CookieBanner() {
  const consent = useConsent();
  // Rendered only after mount: the server cannot know the choice, and this avoids a flash for returning visitors.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const choose = (v: Consent) => writeConsent(v);
  if (!mounted || consent) return null;
  return (
    <div role="dialog" aria-label="Cookie preferences" className="anim-cardin fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-2xl border border-line bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,.14)] sm:flex sm:items-center sm:gap-5">
      <p className="text-[14px] text-foreground/85">
        We use cookies to keep your cart, remember your region and understand what people enjoy. Read our{" "}
        <Link href="/policies/cookies" className="font-semibold text-leaf-dark underline">cookie policy</Link>.
      </p>
      <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => choose("essential")} className="rounded-full border border-ink px-4 py-2 text-[13.5px] font-semibold text-ink hover:bg-soft">Essential only</button>
        <button type="button" onClick={() => choose("all")} className="rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-leaf-dark">Accept all</button>
      </div>
    </div>
  );
}
