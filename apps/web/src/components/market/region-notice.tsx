"use client";
import { Globe } from "lucide-react";
import type { RegionCode } from "@xsf/contracts";
import { useRegions, useSelectRegion } from "@/lib/api/queries";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

/**
 * The honest region control for market pages. A /us page always lists US-dollar prices, but the rest of the store
 * (product page, cart, checkout) follows the shopper's own region. We never change that silently and never redirect
 * by IP: we say which region is active and offer one button to switch.
 *
 * `onlyWhenDifferent` (product page, when the shopper followed a link from a market page) renders nothing unless
 * the regions actually differ.
 */
export function RegionNotice({ want, onlyWhenDifferent, className }: { want: RegionCode; onlyWhenDifferent?: boolean; className?: string }) {
  const { data, isLoading, isError, refetch } = useRegions();
  const select = useSelectRegion();
  const box = cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-leaf-soft px-4 py-3 text-[14px] text-ink", className);

  if (isLoading) return onlyWhenDifferent ? null : <Skeleton className={cn("h-12", className)} />;
  if (isError || !data) {
    if (onlyWhenDifferent) return null;
    return (
      <div role="alert" className={box}>
        <span>We could not check which store region you are in.</span>
        <button type="button" onClick={() => refetch()} className="font-semibold underline">Try again</button>
      </div>
    );
  }
  const target = data.regions.find((r) => r.code === want);
  const current = data.regions.find((r) => r.code === data.current);
  if (!target) return null;
  if (current?.code === target.code) {
    if (onlyWhenDifferent) return null;
    return (
      <p className={box}>
        <Globe className="h-4.5 w-4.5 shrink-0 text-leaf-dark" aria-hidden />
        <span>Prices are in {target.currency} and your store region is {target.name}. You can change region any time from the globe menu at the top.</span>
      </p>
    );
  }
  return (
    <div className={box}>
      <Globe className="h-4.5 w-4.5 shrink-0 text-leaf-dark" aria-hidden />
      <span className="min-w-0 flex-1 basis-60">
        {onlyWhenDifferent ? `You came from our ${target.name} pages, where prices are in ${target.currency}.` : `Prices on this page are in ${target.currency}.`} Your store region is {current?.name ?? "not set"}
        {current ? ` (${current.currency})` : ""}, so {onlyWhenDifferent ? "this product page" : "product pages"}, your cart and checkout use that until you switch.
      </span>
      <button type="button" disabled={select.isPending} onClick={() => select.mutate(target.code)} className="shrink-0 rounded-full bg-ink px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-leaf-dark disabled:opacity-50">
        {select.isPending ? "Switching…" : `Switch to ${target.name} (${target.currency})`}
      </button>
      {select.isError && <span role="alert" className="basis-full text-[13px] text-danger">Could not switch region. Please try again.</span>}
    </div>
  );
}
