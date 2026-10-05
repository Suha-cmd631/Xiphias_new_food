"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { storeOpenNow } from "@/lib/time";
import { cn } from "@/lib/utils";

export function StorePill() {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => setOpen(storeOpenNow()), []);
  return (
    <Link href="/store" className="hidden items-center gap-3 text-[14px] text-muted md:flex">
      <Store className="h-9 w-9 stroke-[1.3] text-ink" />
      <span>
        My store{" "}
        <i className={cn("ml-1.5 border-l border-line pl-2 not-italic", open ? "text-leaf-dark" : "")}>{open == null ? "" : open ? "Open now" : "Closed"}</i>
        <b className="block font-head text-[19px] font-medium text-ink">Koramangala ▾</b>
      </span>
    </Link>
  );
}
