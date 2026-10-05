"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ compact, source, className }: { compact?: boolean; source: string; className?: string }) {
  const [email, setEmail] = useState("");
  const m = useMutation({ mutationFn: () => api.post<{ status: string }>("/newsletter/subscribe", { email, source }) });
  if (m.isSuccess) return <p className={cn("text-[14px] text-leaf-dark", className)}>{m.data.status === "confirmed" ? "You're already subscribed." : "Check your inbox to confirm your subscription."}</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" aria-label="Email" className={cn("w-full min-w-0 shrink-0 rounded-full border-[1.5px] sm:w-auto sm:flex-1 sm:shrink border-line bg-white px-4 outline-none focus:border-ink", compact ? "h-11 text-[14px]" : "h-13 text-[15px]")} />
      <Button type="submit" variant="dark" size={compact ? "sm" : "md"} disabled={m.isPending} className={cn("shrink-0", compact ? "h-11" : "h-13")}>{m.isPending ? "…" : "Submit"}</Button>
      {m.isError && <span className="text-[12.5px] text-danger">Please check the email address.</span>}
    </form>
  );
}
