"use client";
import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { OrderDetail } from "@xsf/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { keys, useCheckoutStatus } from "@/lib/api/queries";
import { api } from "@/lib/api/client";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";

export default function ThankYou({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const status = useCheckoutStatus(orderId, true);
  const settled = status.data?.paymentStatus === "paid" || status.data?.paymentStatus === "failed";
  const order = useQuery({ queryKey: ["order", orderId], queryFn: () => api.get<OrderDetail>(`/orders/${orderId}`), enabled: settled });
  const paid = status.data?.paymentStatus === "paid";
  const qc = useQueryClient();
  // The cart changes when payment settles (emptied on success, handed back on failure) — refresh the header's copy.
  useEffect(() => { if (settled) void qc.invalidateQueries({ queryKey: keys.cart }); }, [settled, qc]);
  return (
    <div className="wrap pb-20 pt-10">
      <div className="mx-auto max-w-2xl text-center">
        {!status.data && <Skeleton className="mx-auto h-24 w-full" />}
        {status.data && !settled && <><Clock className="mx-auto h-12 w-12 text-gold" /><h1 className="mt-4 text-[32px]">Confirming your payment…</h1><p className="mt-2 text-muted">Order {status.data.orderNumber}. This usually takes a few seconds.</p></>}
        {paid && <><CheckCircle2 className="mx-auto h-14 w-14 text-leaf" /><h1 className="mt-4 text-[clamp(30px,4vw,44px)]">Thank you — order {status.data!.orderNumber} is confirmed</h1><p className="mt-2 text-muted">A receipt is on its way to your inbox. We'll email tracking the moment it ships.</p></>}
        {status.data?.paymentStatus === "failed" && <><XCircle className="mx-auto h-14 w-14 text-danger" /><h1 className="mt-4 text-[32px]">Payment didn't go through</h1><p className="mt-2 text-muted">Nothing was charged. Your cart has been kept exactly as it was, so you can try again.</p><ButtonLink href="/checkout" variant="dark" className="mt-5">Try payment again</ButtonLink></>}
      </div>
      {order.data && (
        <div className="mx-auto mt-10 max-w-2xl rounded-card border border-line p-6">
          <ul className="divide-y divide-line">{order.data.lines.map((l, i) => <li key={i} className="flex justify-between py-3 text-[15px]"><span>{l.productName} <small className="text-muted">· {l.variantTitle} × {l.qty}</small></span><b>{l.lineTotal.formatted}</b></li>)}</ul>
          <dl className="mt-3 grid gap-1 border-t border-line pt-3 text-[14.5px]">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{order.data.subtotal.formatted}</dd></div>
            {order.data.discount.amount > 0 && <div className="flex justify-between text-leaf-dark"><dt>Discount</dt><dd>−{order.data.discount.formatted}</dd></div>}
            <div className="flex justify-between"><dt>Shipping ({order.data.shippingMethod?.name})</dt><dd>{order.data.shipping.formatted}</dd></div>
            <div className="flex justify-between text-[17px] font-semibold"><dt>{paid ? "Total paid" : "Order total"}</dt><dd>{order.data.grandTotal.formatted}</dd></div>
          </dl>
          <p className="mt-4 text-[14px] text-[#444]">Ships to {order.data.shippingAddress.firstName} {order.data.shippingAddress.lastName}, {order.data.shippingAddress.line1}, {order.data.shippingAddress.city} {order.data.shippingAddress.postalCode}, {order.data.shippingAddress.countryCode}.</p>
          {paid && <div className="mt-5 flex flex-wrap gap-3"><ButtonLink href="/track" variant="dark">Track order</ButtonLink><ButtonLink href="/shop">Continue shopping</ButtonLink><Link href="/account/register" className="self-center text-[14px] underline">Create an account to see orders</Link></div>}
        </div>
      )}
    </div>
  );
}
