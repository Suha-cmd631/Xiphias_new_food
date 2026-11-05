import Link from "next/link";
import type { Category } from "@xsf/contracts";
import { Reveal } from "@/components/motion/reveal";

/** The five shelves as small text links above the bestsellers grid (replaces the old photo-tile shelf section). */
export function ShelfLinks({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <Reveal as="nav" className="-mt-2 mb-8 sm:mb-10">
      <ul aria-label="Shop by shelf" className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/shop/${c.slug}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[13.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white">
              {c.name}
              <span className="text-[12px] tabular-nums opacity-60">{c.productCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
