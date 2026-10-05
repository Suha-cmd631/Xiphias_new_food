"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { OrderDetail } from "@xsf/contracts";
import { api } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/section";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/time";

const STEPS = ["paid", "processing", "shipped", "delivered"];

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const m = useMutation({ mutationFn: () => api.get<OrderDetail>(`/track?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email)}`) });
  const o = m.data;
  const stage = o ? Math.max(0, STEPS.indexOf(o.status)) : -1;
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Track order" }]} title="Track your order" text="Enter the order number from your confirmation email." />
      <div className="wrap pb-20 pt-6">
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="grid max-w-xl gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Label>Order number<Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="XS-2026-000123" required /></Label>
          <Label>Email<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Label>
          <Button type="submit" variant="dark" className="self-end" disabled={m.isPending}>Track</Button>
        </form>
        {m.isError && <p className="mt-4 text-danger">We couldn't find that order. Check the number and the email you used.</p>}
        {o && (
          <div className="mt-10 max-w-2xl rounded-card border border-line p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-[24px]">{o.number}</h2><span className="text-[14px] text-muted">Placed {formatDate(o.placedAt)} · {o.grandTotal.formatted}</span></div>
            <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-[12.5px]">
              {STEPS.map((s, i) => <li key={s} className={`rounded-full px-2 py-2 capitalize ${i <= stage ? "bg-leaf text-ink font-semibold" : "bg-soft text-muted"}`}>{s}</li>)}
            </ol>
            {o.status === "cancelled" && <p className="mt-4 text-danger">This order was cancelled.</p>}
            <div className="mt-6 text-[14.5px]">
              {o.tracking ? (
                <>
                  <p><b>{o.tracking.carrier}</b> · {o.tracking.awb ? `AWB ${o.tracking.awb}` : "awaiting courier booking"} · {o.tracking.status.replace(/_/g, " ")}</p>
                  {o.tracking.trackingUrl && <a href={o.tracking.trackingUrl} target="_blank" rel="noreferrer" className="underline">Open courier tracking</a>}
                  <ul className="mt-3 grid gap-1 text-muted">{o.tracking.events.map((e, i) => <li key={i}>{formatDate(e.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} — {e.status}{e.location ? `, ${e.location}` : ""}</li>)}</ul>
                </>
              ) : <p className="text-muted">Your parcel hasn't been handed to the courier yet. You'll get an email when it ships.</p>}
            </div>
            <ul className="mt-5 divide-y divide-line border-t border-line">{o.lines.map((l, i) => <li key={i} className="flex justify-between py-2.5 text-[14px]"><span>{l.productName} · {l.variantTitle} × {l.qty}</span><b>{l.lineTotal.formatted}</b></li>)}</ul>
          </div>
        )}
      </div>
    </>
  );
}
