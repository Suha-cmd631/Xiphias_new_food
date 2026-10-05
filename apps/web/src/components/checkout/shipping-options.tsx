"use client";
import type { Cart } from "@xsf/contracts";
import { useSetShipping, useShippingRates } from "@/lib/api/queries";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

export function ShippingOptions({ cart }: { cart: Cart }) {
  const rates = useShippingRates(!!cart.shippingAddress);
  const set = useSetShipping();
  if (rates.isLoading) return <div className="grid gap-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>;
  if (rates.isError) return <ErrorState message="Couldn't fetch shipping rates." onRetry={() => rates.refetch()} />;
  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label="Shipping method">
      {rates.data?.options.map((o) => (
        <label key={o.id} className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border-[1.5px] p-4 transition-colors", cart.shippingOption?.id === o.id ? "border-ink bg-soft" : "border-line hover:border-ink")}>
          <input type="radio" name="ship" className="h-4 w-4 accent-ink" checked={cart.shippingOption?.id === o.id} onChange={() => set.mutate(o.id)} disabled={set.isPending} />
          <span className="flex-1"><b className="block text-[15px]">{o.name}</b><small className="text-muted">{o.carrier} · {o.etaDays[0] === 0 ? "ready in 24 h" : `${o.etaDays[0]}–${o.etaDays[1]} business days`}</small></span>
          <b>{o.amount.amount === 0 ? "Free" : o.amount.formatted}</b>
        </label>
      ))}
      {rates.data?.options.length === 0 && <p className="text-[14px] text-muted">No shipping options for this address yet.</p>}
    </div>
  );
}
