import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductDetail } from "@xsf/contracts";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Faq } from "@/components/ui/faq";
import { Notice } from "@/components/ui/feedback";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, faqLd, productLd } from "@/components/seo/schemas";
import { MarketProduct } from "@/components/market/market-product";
import { NotifyPanel } from "@/components/market/notify-panel";
import { RegionNotice } from "@/components/market/region-notice";
import { CA_NOTICE, MARKETS, US_SHIPPING_NOTE, marketDescription, marketName, type MarketCode } from "@/lib/market";
import { TOPICS, marketFaq, type Topic } from "@/lib/market-topics";
import { SITE } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** One landing page, rendered for either market from the same topic config. `products` are already priced for the market's region. */
export function TopicPage({ market, topic, products }: { market: MarketCode; topic: Topic; products: ProductDetail[] }) {
  const m = MARKETS[market];
  const path = `/${market}/${topic.slug}`;
  const faqs = [...topic.faqs, marketFaq(market)];
  const related = topic.related.map((s) => TOPICS.find((t) => t.slug === s)).filter((t): t is Topic => !!t);
  const hero = products[0]?.image ?? topic.image;
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: m.country, path: `/${market}` }, { name: topic.label, path }])} />
      <JsonLd data={faqLd(faqs)} />
      {m.selling && products.filter((p) => p.availableInRegion && p.variants.length > 0).map((p) => (
        <JsonLd key={p.slug} data={productLd(p, { name: marketName(p.name), description: marketDescription(p), url: `${SITE.url}/products/${p.slug}` })} />
      ))}

      <PageHeader crumbs={[{ href: "/", label: "Home" }, { href: `/${market}`, label: m.country }, { label: topic.label }]} />
      <div className="wrap">
        <PageHero kick={`${m.country} · ${products[0]?.category.name ?? "Pantry"}`} title={topic.h1} text={topic.intro} image={hero} alt={topic.label}>
          {m.selling ? <ButtonLink href="#buy" variant="dark">See price and pack sizes</ButtonLink> : <ButtonLink href="#notify" variant="dark">Tell me when you deliver to Canada</ButtonLink>}
          <ButtonLink href="#guide">{topic.guide.title}</ButtonLink>
        </PageHero>
        {m.selling ? <RegionNotice want={m.region} className="mt-5" /> : <Notice tone="warn" className="mt-5">{CA_NOTICE} You can read about the product here and leave your email to hear when ordering opens.</Notice>}
      </div>

      <Section tight>
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div className="grid max-w-[70ch] content-start gap-7">
            {topic.body.map((b) => (
              <div key={b.heading}>
                <h2 className="text-[clamp(22px,2.4vw,28px)] leading-tight">{b.heading}</h2>
                <p className="mt-2.5 text-[16px] leading-[1.75] text-foreground">{b.text}</p>
              </div>
            ))}
          </div>
          <aside id="guide" aria-label={topic.guide.title} className="scroll-mt-28 self-start rounded-card bg-soft p-6 sm:p-8">
            <span className="kick">US measurements</span>
            <h2 className="text-[24px] leading-tight">{topic.guide.title}</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line text-[14.5px]">
              {topic.guide.rows.map((r) => (
                <div key={r.label} className="grid grid-cols-[92px_1fr] gap-3 py-2.5">
                  <dt className="font-semibold text-ink">{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-5 grid gap-3 text-[14.5px]">
              {topic.guide.steps.map((s, i) => (
                <li key={i} className="grid grid-cols-[28px_1fr] gap-3">
                  <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-leaf text-[13px] font-bold text-ink">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </Section>

      <Section tight id={m.selling ? "buy" : undefined} className="scroll-mt-24">
        <SectionHead kick={m.selling ? "Price and pack sizes" : "The product"} title={m.selling ? `Buy ${topic.label.toLowerCase()} in the ${m.short}` : `${topic.label} from Xiphias`} />
        <div className="grid gap-6">
          {products.map((p) => <MarketProduct key={p.slug} p={p} market={market} />)}
          {products.length === 0 && <Notice tone="warn">This product is not in the catalog right now. Browse the <Link href="/shop" className="font-semibold underline">full shop</Link> instead.</Notice>}
        </div>
        {m.selling ? (
          <p className="mt-6 max-w-[70ch] text-[14.5px] text-muted">{US_SHIPPING_NOTE} See the <Link href="/policies/shipping" className="font-semibold text-leaf-dark underline">shipping policy</Link> and <Link href="/policies/returns" className="font-semibold text-leaf-dark underline">returns policy</Link>.</p>
        ) : (
          <div className="mt-8"><NotifyPanel about={topic.label.toLowerCase()} /></div>
        )}
      </Section>

      <Section tight>
        <SectionHead title={`${topic.label}: common questions`} center />
        <Faq items={faqs.map((f) => ({ q: f.q, a: `<p>${esc(f.a)}</p>` }))} />
      </Section>

      <Section tight className="pb-16 sm:pb-24">
        <SectionHead kick={m.country} title="More from the range" more={{ href: `/${market}`, label: `All ${m.short} guides` }} />
        <div className="grid gap-5 sm:grid-cols-3">
          {related.map((t, i) => (
            <Reveal key={t.slug} delay={i * 70}>
              <Link href={`/${market}/${t.slug}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-all hover:-translate-y-1 hover:border-transparent hover:shadow-card">
                <Image src={t.image} alt="" width={640} height={480} sizes="(max-width: 640px) 100vw, 33vw" className="aspect-[4/3] w-full bg-soft object-cover object-bottom" />
                <span className="grid flex-1 content-start gap-1.5 p-5">
                  <b className="font-head text-[20px] font-medium leading-snug text-ink">{t.label}</b>
                  <span className="text-[14px] text-muted">{t.teaser}</span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-semibold text-leaf-dark">Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
