"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Desktop menu: the five shelves by name, then Learn and Wholesale. "Shop all" opens a picture menu of the shelves. */
export function Nav() {
  const path = usePathname();
  const active = (href: string) => (href === "/shop" ? path === "/shop" : path.startsWith(href));
  return (
    <ul className="hidden items-center gap-6 text-[14.5px] font-medium text-ink md:flex lg:gap-8">
      {SITE.mainNav.map((item) => (
        <li key={item.href} className="group relative">
          <Link
            href={item.href}
            aria-current={active(item.href) ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-1.5 py-3 transition-colors hover:text-royal after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 group-hover:after:scale-x-100",
              active(item.href) && "text-royal after:scale-x-100",
            )}
          >
            {item.label}
            {item.href === "/shop" && <ChevronDown className="h-3 w-3 text-gold-deep transition-transform group-hover:rotate-180" />}
          </Link>
          {item.href === "/shop" && <MegaMenu />}
        </li>
      ))}
    </ul>
  );
}

function MegaMenu() {
  return (
    <div className="invisible absolute -left-6 top-full z-50 grid w-max translate-y-2 grid-cols-5 gap-4 rounded-[22px] border border-line bg-paper p-5 opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      {SITE.categories.map((c) => (
        <Link key={c.slug} href={`/shop/${c.slug}`} className="grid w-[150px] gap-2 text-[13.5px] font-semibold text-ink hover:text-royal">
          <span className="block aspect-square overflow-hidden rounded-2xl bg-cream">
            <Image src={c.image} alt="" width={150} height={150} className="h-full w-full object-cover" loading="lazy" />
          </span>
          <span>
            {c.name}
            <small className="block text-[12px] font-normal text-muted">{c.desc}</small>
          </span>
        </Link>
      ))}
    </div>
  );
}
