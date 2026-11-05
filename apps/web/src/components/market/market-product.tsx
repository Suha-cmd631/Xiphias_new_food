import Image from "next/image";
import type { ProductDetail } from "@xsf/contracts";
import { ButtonLink } from "@/components/ui/button";
import { MARKETS, isMarketSafe, marketName, marketProductHref, usPack, type MarketCode } from "@/lib/market";
import { unitPrice } from "@/lib/unit-price";

/**
 * Product block on a market landing page. United States: live prices from the US price list and one clear button to
 * the product page. Canada: the same product facts with no price and no way to buy.
 */
export function MarketProduct({ p, market }: { p: ProductDetail; market: MarketCode }) {
  const m = MARKETS[market];
  const name = marketName(p.name);
  const photo = p.hoverImage ?? p.image;
  const selling = m.selling && p.availableInRegion && p.variants.length > 0;
  return (
    <article className="grid gap-6 rounded-card border border-line bg-white p-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:p-7 lg:gap-9">
      <Image src={photo} alt={name} width={480} height={480} sizes="(max-width: 640px) 100vw, 240px" className="aspect-square w-full rounded-xl bg-soft object-cover" />
      <div className="min-w-0">
        <span className="kick">{p.category.name}{p.origin ? ` · ${p.origin}` : ""}</span>
        <h3 className="text-[clamp(22px,2.4vw,28px)] leading-tight">{name}</h3>
        {isMarketSafe(p.subtitle) && <p className="mt-1 text-[14.5px] text-muted">{p.subtitle}</p>}
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {p.variants.map((v) => {
            const us = usPack(v.title);
            const per = selling ? unitPrice(v) : null;
            return (
              <li key={v.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
                <span className="text-[15px] font-medium text-ink">{v.title}{us && <span className="font-normal text-muted"> ({us})</span>}</span>
                {selling ? (
                  <span className="flex items-baseline gap-2">
                    {v.compareAt && <s className="text-[13.5px] text-muted">{v.compareAt.formatted}</s>}
                    <b className="font-head text-[20px] font-medium text-leaf-dark">{v.price.formatted}</b>
                    {!v.inStock && <span className="text-[12.5px] font-semibold text-danger">Sold out</span>}
                  </span>
                ) : (
                  <span className="text-[13px] text-muted">{m.selling ? `Not available in ${m.country}` : `Not sold in ${m.country} yet`}</span>
                )}
                {per && <span className="basis-full text-[12.5px] text-muted">{per}</span>}
              </li>
            );
          })}
        </ul>
        {selling ? (
          <>
            <ButtonLink href={marketProductHref(p.slug, market)} variant="dark" size="lg" className="mt-5 w-full sm:w-auto">View product and add to cart</ButtonLink>
            <p className="mt-3 text-[12.5px] text-muted">Prices in {m.currencyName}, read live from our {m.short} price list.</p>
          </>
        ) : m.selling ? (
          <p className="mt-4 text-[14px] text-danger">This product is not available for delivery to {m.country} at the moment.</p>
        ) : (
          <ButtonLink href="#notify" variant="dark" className="mt-5 w-full sm:w-auto">Tell me when you deliver to {m.country}</ButtonLink>
        )}
      </div>
    </article>
  );
}
