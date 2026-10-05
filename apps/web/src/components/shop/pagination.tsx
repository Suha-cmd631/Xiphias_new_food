import Link from "next/link";
import type { Pagination as P } from "@xsf/contracts";
import { cn } from "@/lib/utils";

export function Pagination({ p, basePath, params }: { p: P; basePath: string; params: Record<string, string | undefined> }) {
  if (p.pages <= 1) return null;
  const href = (page: number) => {
    const sp = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => !!e[1]));
    if (page > 1) sp.set("page", String(page)); else sp.delete("page");
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const btn = "grid h-10 min-w-10 place-items-center rounded-full border-[1.5px] border-line px-3 text-[14px] font-semibold text-ink hover:border-ink";
  return (
    <nav aria-label="Pagination" className="mt-11 flex flex-wrap justify-center gap-1.5">
      {p.page > 1 && <Link href={href(p.page - 1)} className={btn} aria-label="Previous">‹</Link>}
      {Array.from({ length: p.pages }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={href(n)} aria-current={n === p.page ? "page" : undefined} className={cn(btn, n === p.page && "border-ink bg-ink text-white")}>{n}</Link>
      ))}
      {p.page < p.pages && <Link href={href(p.page + 1)} className={btn} aria-label="Next">›</Link>}
    </nav>
  );
}
