import type { ProductCard as Card } from "@xsf/contracts";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductGrid({ items, cols = 4, className }: { items: Card[]; cols?: 3 | 4; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-5 md:grid-cols-3 xl:gap-7", cols === 4 && "lg:grid-cols-4", className)}>
      {items.map((p, i) => <ProductCard key={p.slug} p={p} index={i} />)}
    </div>
  );
}
