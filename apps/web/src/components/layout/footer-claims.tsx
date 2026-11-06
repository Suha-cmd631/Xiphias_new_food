"use client";
import { usePathname } from "next/navigation";

/** No "organic" claim anywhere in the footer until the USDA certificate is confirmed (US-first site; see lib/market.ts). The /us and /ca sections also drop JioPay. */
function isMarketPath(path: string | null) {
  return !!path && /^\/(us|ca)(\/|$)/.test(path);
}

export function FooterBlurb() {
  const market = isMarketPath(usePathname());
  return (
    <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed">
      {market
        ? "Single-origin teas, grains and spices, shipped from Bengaluru by DHL Express."
        : "Single-origin superfoods and teas: heirloom rice, makhana, ghee, honey, spices and white tea. Lab-tested and shipped worldwide from Bengaluru."}
    </p>
  );
}

export function FooterBadges() {
  const market = isMarketPath(usePathname());
  return <span>{market ? "Secure checkout with Stripe" : "FSSAI · ISO · Lab-tested every lot · Secure checkout with JioPay & Stripe"}</span>;
}
