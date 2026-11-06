"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** "New here? 10% off" with a one-tap copy of WELCOME10. */
export function CouponChip({ className }: { className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText("WELCOME10"); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* code is visible anyway */ } };
  return (
    <p className={cn("inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1.5 rounded-[22px] border border-dashed border-gold/70 bg-paper/70 py-1.5 pl-4 pr-1.5 text-[13.5px] text-muted", className)}>
      <span>New here? <b className="font-semibold text-ink">10% off</b> your first order with</span>
      <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-royal-deep px-3 py-1 font-mono text-[12.5px] font-semibold tracking-wider text-white hover:bg-royal" aria-label="Copy coupon code WELCOME10">
        WELCOME10 {done ? <Check className="h-3.5 w-3.5 text-gold" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </p>
  );
}
