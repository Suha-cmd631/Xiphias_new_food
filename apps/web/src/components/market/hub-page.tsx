import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { Notice } from "@/components/ui/feedback";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, itemListLd } from "@/components/seo/schemas";
import { NotifyPanel } from "@/components/market/notify-panel";
import { RegionNotice } from "@/components/market/region-notice";
import { CA_NOTICE, MARKETS, US_SHIPPING_NOTE, type MarketCode } from "@/lib/market";
import { TOPICS } from "@/lib/market-topics";

/** /us and /ca: the list of landing pages for that market. `cards` (US only) supplies the live "from" price per product. */
export function HubPage({ market, h1, text, cards }: { market: MarketCode; h1: string; text: string; cards?: Map<string, ProductCard> }) {
  const m = MARKETS[market];
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: m.country, path: `/${market}` }])} />
      <JsonLd data={itemListLd(`Xiphias Superfoods guides for ${m.country}`, TOPICS.map((t) => ({ name: t.label, path: `/${market}/${t.slug}` })))} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: m.country }]} title={h1} text={text}>
        {m.selling ? <RegionNotice want={m.region} className="mt-5 max-w-[860px]" /> : <Notice tone="warn" className="mt-5 max-w-[860px]">{CA_NOTICE} Leave your email below and we will tell you when that changes.</Notice>}
      </PageHeader>

      <Section tight>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-7">
          {TOPICS.map((t, i) => {
            const card = m.selling ? t.productSlugs.map((s) => cards?.get(s)).find((c) => c && c.availableInRegion && c.fromPrice.amount > 0) : undefined;
            return (
              <Reveal key={t.slug} delay={(i % 4) * 60}>
                <Link href={`/${market}/${t.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-card">
                  <Image src={t.image} alt="" width={640} height={480} priority={i < 4} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="aspect-[4/3] w-full bg-soft object-cover object-bottom" />
                  <div className="grid flex-1 content-start gap-1.5 p-5">
                    <h2 className="text-[21px] leading-snug">{t.label}</h2>
                    <p className="text-[14px] text-muted">{t.teaser}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      {card ? <b className="text-[15.5px] font-semibold text-leaf-dark">From {card.fromPrice.formatted}</b> : <span />}
                      <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink group-hover:text-leaf-dark">{m.selling ? "Guide and price" : "Read the guide"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tight className="pb-16 sm:pb-24">
        {m.selling ? (
          <div className="grid gap-6 rounded-card bg-soft p-7 sm:p-10 md:grid-cols-[1fr_1.4fr] md:items-center">
            <SectionHead kick="Delivery" title="Shipping to the United States" />
            <div>
              <p className="text-[16px] leading-[1.75] text-foreground">{US_SHIPPING_NOTE}</p>
              <p className="mt-3 text-[14.5px] text-muted">
                Details are in the <Link href="/policies/shipping" className="font-semibold text-leaf-dark underline">shipping policy</Link> and the <Link href="/policies/returns" className="font-semibold text-leaf-dark underline">returns policy</Link>. Looking for something else? <Link href="/shop" className="font-semibold text-leaf-dark underline">Browse the full shop</Link>.
              </p>
            </div>
          </div>
        ) : (
          <NotifyPanel />
        )}
      </Section>
    </>
  );
}
