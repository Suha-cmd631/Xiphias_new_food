"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "xsf_cookie_consent";

/** Small, non-blocking cookie notice. Remembers the choice per browser for a year. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )xsf_cookie_consent=(\w+)/);
    if (!m) setOpen(true);
  }, []);
  const choose = (v: "all" | "essential") => {
    document.cookie = `${KEY}=${v}; Max-Age=31536000; Path=/; SameSite=Lax`;
    setOpen(false);
  };
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Cookie preferences" className="anim-cardin fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[720px] rounded-2xl border border-line bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,.14)] sm:flex sm:items-center sm:gap-5">
      <p className="text-[14px] text-[#444]">
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
