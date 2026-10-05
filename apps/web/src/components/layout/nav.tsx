"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <ul className="hidden items-center gap-10 text-[17px] font-medium text-ink md:flex">
      {SITE.nav.map((item) => (
        <li key={item.href} className="group relative">
          <Link
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-1.5 py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-leaf after:transition-transform after:duration-300 group-hover:after:scale-x-100",
              active(item.href) && "after:scale-x-100",
            )}
          >
            {item.label}
            {(item.href === "/shop" || item.href === "/blog") && <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />}
          </Link>
          {item.href === "/shop" && <MegaMenu />}
          {item.href === "/blog" && <BlogMenu />}
        </li>
      ))}
    </ul>
  );
}

function MegaMenu() {
  return (
    <div className="invisible absolute -left-6 top-full z-50 grid w-max translate-y-2 grid-cols-5 gap-3.5 rounded-2xl border border-line bg-white p-5 opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      {SITE.categories.map((c) => (
        <Link key={c.slug} href={`/shop/${c.slug}`} className="grid w-[150px] gap-2 text-[13.5px] font-semibold text-ink hover:text-leaf-dark">
          <Image src={c.image} alt="" width={150} height={150} className="aspect-square w-full rounded-xl object-cover" loading="lazy" />
          <span>
            {c.name}
            <small className="block text-[12px] font-normal text-muted">{c.desc}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}

function BlogMenu() {
  const item = "flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-[14.5px] font-medium text-ink hover:bg-soft hover:text-leaf-dark";
  return (
    <div className="invisible absolute -left-3.5 top-full z-50 grid min-w-[220px] translate-y-2 gap-0.5 rounded-2xl border border-line bg-white p-2.5 opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <Link href="/blog?layout=left" className={item}>Left sidebar</Link>
      <Link href="/blog?layout=right" className={item}>Right sidebar</Link>
      <Link href="/blog?layout=full" className={item}>Full width</Link>
      <hr className="my-1.5 border-line" />
      <Link href="/blog" className={item}>All 79 articles</Link>
    </div>
  );
}
