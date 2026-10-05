"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function BlogSearch({ defaultValue, className }: { defaultValue: string; className?: string }) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();
  const sp = useSearchParams();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (sp.get("layout")) next.set("layout", sp.get("layout")!);
    router.push(`/blog${next.toString() ? `?${next}` : ""}`);
  };
  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="flex h-12 items-center rounded-full border-[1.5px] border-line bg-white pl-4 pr-1.5 focus-within:border-ink">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search our blog" aria-label="Search blog" className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-muted" />
        <button type="submit" aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft"><Search className="h-4.5 w-4.5" /></button>
      </div>
    </form>
  );
}
