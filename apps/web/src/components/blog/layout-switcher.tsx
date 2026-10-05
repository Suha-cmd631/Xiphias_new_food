"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PanelLeft, PanelRight, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTS = [["left", "Left sidebar", PanelLeft], ["right", "Right sidebar", PanelRight], ["full", "Full width", Square]] as const;

export function LayoutSwitcher({ current }: { current: string }) {
  const sp = useSearchParams();
  const href = (l: string) => { const n = new URLSearchParams(sp.toString()); n.set("layout", l); return `/blog?${n}`; };
  return (
    <div className="inline-flex rounded-full border-[1.5px] border-line bg-white p-1" role="group" aria-label="Layout">
      {OPTS.map(([v, label, Icon]) => (
        <Link key={v} href={href(v)} scroll={false} aria-current={current === v ? "true" : undefined} aria-label={label} className={cn("inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13.5px] font-semibold text-muted sm:px-4", current === v && "bg-ink text-white")}>
          <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </div>
  );
}
