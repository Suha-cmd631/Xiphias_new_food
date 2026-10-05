import type { ProductListResponse } from "@xsf/contracts";
import { Filters } from "./filters";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";
import { QuickView } from "./quick-view";
import { ButtonLink } from "@/components/ui/button";

export function ShopView({ data, basePath, params, currency }: { data: ProductListResponse; basePath: string; params: Record<string, string | undefined>; currency: string }) {
  const sortLabel: Record<string, string> = { featured: "Featured", "price-asc": "Price: low to high", "price-desc": "Price: high to low", "name-asc": "Name A–Z", "name-desc": "Name Z–A", newest: "Newest" };
  return (
    <section className="pb-20 pt-7">
      <div className="wrap grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <Filters facets={data.facets} currency={currency} total={data.pagination.total} />
        <div>
          <div className="mb-5 flex items-center justify-between text-[14px] text-muted">
            <span>{data.pagination.total} product{data.pagination.total === 1 ? "" : "s"}</span>
            <span>Sorted by {sortLabel[params.sort ?? "featured"]}</span>
          </div>
          {data.items.length ? <ProductGrid items={data.items} cols={3} /> : (
            <div className="rounded-card bg-soft px-6 py-16 text-center">
              <p className="text-[18px] font-medium">Nothing matches these filters.</p>
              <ButtonLink href={basePath} variant="dark" className="mt-4">Clear all filters</ButtonLink>
            </div>
          )}
          <Pagination p={data.pagination} basePath={basePath} params={params} />
        </div>
      </div>
      <QuickView />
    </section>
  );
}
