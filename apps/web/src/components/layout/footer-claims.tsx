"use client";
import { usePathname } from "next/navigation";

/** The US and Canada sections must not carry the "organic" claim until the matching certificate is confirmed (see lib/market.ts). */
function isMarketPath(path: string | null) {
  return !!path && /^\/(us|ca)(\/|$)/.test(path);
}

export function FooterBlurb() {
  const market = isMarketPath(usePathname());
  return (
    <p className="mt-3 text-[14px] text-muted">
      {market
        ? "Teas, grains and spices from farm to doorstep, shipped from Bengaluru, India. A XIPHIAS Projects Pvt. Ltd. company."
        : "Pure organic superfoods from farm to doorstep — global delivery for a healthier, better life. A XIPHIAS Projects Pvt. Ltd. company."}
    </p>
  );
}

export function FooterBadges() {
  const market = isMarketPath(usePathname());
  return <span>{market ? "Secure checkout with Stripe" : "FSSAI · ISO · Certified organic · Secure checkout with JioPay & Stripe"}</span>;
}
