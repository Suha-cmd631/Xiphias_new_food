"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderSummary } from "@xsf/contracts";
import { api } from "@/lib/api/client";
import { keys, useMe } from "@/lib/api/queries";
import { PageHeader } from "@/components/ui/section";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { formatDate } from "@/lib/time";
import { useEffect } from "react";

export default function AccountPage() {
  const me = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const orders = useQuery({ queryKey: ["me", "orders"], queryFn: () => api.get<{ items: OrderSummary[] }>("/me/orders"), enabled: !!me.data });
  const logout = useMutation({ mutationFn: () => api.post("/auth/logout"), onSuccess: () => { window.location.assign("/"); } });
  useEffect(() => { if (me.isFetched && !me.data) router.replace("/account/login"); }, [me.isFetched, me.data, router]);
  if (!me.data) return <div className="wrap py-10"><Skeleton className="h-40" /></div>;
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Account" }]} title={`Hello, ${me.data.firstName}`} text={me.data.email} />
      <div className="wrap grid gap-10 pb-20 pt-6 lg:grid-cols-[260px_1fr]">
        <aside className="grid h-fit gap-1 rounded-card bg-soft p-4 text-[15px]">
          <span className="rounded-lg bg-white px-3 py-2 font-semibold">Orders</span>
          <Link href="/track" className="px-3 py-2 hover:underline">Track an order</Link>
          <Link href="/contact" className="px-3 py-2 hover:underline">Help</Link>
          <Button variant="ghost" size="sm" className="mt-2 justify-start" onClick={() => logout.mutate()}>Sign out</Button>
        </aside>
        <div>
          <h2 className="text-[24px]">Your orders</h2>
          {orders.isLoading && <Skeleton className="mt-4 h-32" />}
          {orders.isError && <ErrorState className="mt-4" onRetry={() => orders.refetch()} />}
          {orders.data?.items.length === 0 && <div className="mt-4 rounded-card border border-line p-8 text-center"><p className="text-muted">No orders yet.</p><ButtonLink href="/shop" variant="dark" className="mt-4">Shop now</ButtonLink></div>}
          <ul className="mt-4 divide-y divide-line rounded-card border border-line">
            {orders.data?.items.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-[14.5px]">
                <span><b>{o.number}</b><br /><small className="text-muted">{formatDate(o.placedAt)} · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}</small></span>
                <span className="rounded-full bg-soft px-3 py-1 text-[12.5px] capitalize">{o.status}</span>
                <b>{o.grandTotal.formatted}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
