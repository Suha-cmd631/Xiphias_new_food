import type { Metadata } from "next";
import { brandTitle } from "@/lib/seo";
import Image from "next/image";
import { Sprout, FlaskConical, Truck, Gem } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Faq } from "@/components/ui/faq";
import { ProductGrid } from "@/components/shop/product-grid";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { QuickView } from "@/components/shop/quick-view";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, faqLd } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: brandTitle("Our Story: Single-Origin Superfoods from India"),
  description: "Xiphias Superfoods buys teas, heirloom grains, spices, honey and ghee directly from India's small farms, tests every lot and ships worldwide from Bengaluru.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { Icon: Sprout, t: "Direct from farmers", d: "We buy straight from growers and farmer groups, with no middlemen in between." },
  { Icon: FlaskConical, t: "Tested every lot", d: "Every lot is lab-tested. Ask us for the report for your order." },
  { Icon: Truck, t: "Shipped worldwide", d: "Dispatched from Bengaluru in 1–2 days. Customers order from the USA, Germany, Canada, the UAE and more." },
  { Icon: Gem, t: "Rare, curated foods", d: "A short list of foods we know well, from Silver Needle tea to Joha rice, rather than a long one we don't." },
];
const SECTORS = ["Horticulture", "Floriculture", "E-Dairy", "Food Processing", "Farming", "Fishery", "Real Estate", "Warehouse Solutions"];
const FAQS = [
  { q: "Who is behind Xiphias Superfoods?", a: "Xiphias Superfoods is a fully-owned subsidiary of XIPHIAS Projects Pvt. Ltd., headquartered in Bengaluru (Bangalore), India. The group also works in horticulture, food processing, dairy and warehousing." },
  { q: "Where do your foods come from?", a: "Each product comes from a named growing region: black and Joha rice from northeast India, green and masala tea from Assam, makhana from Bihar, ghee from Gir cows in Gujarat, pepper and ginger from Kerala's Malabar coast, and Silver Needle white tea from Fujian, its traditional home. The origin is printed on every product page." },
  { q: "How do you check quality?", a: "We buy directly from growers, and test every lot. If you would like the lab report or FSSAI licence for your order, contact us with your order number." },
  { q: "Do you ship outside India?", a: "Yes. Orders ship from Bengaluru by DHL Express to the USA and many other countries. Prices, shipping and delivery times for your country are shown at checkout." },
  { q: "Do you sell wholesale?", a: "Yes. We supply cafés, stores and brands in bulk and under private label, and handle export paperwork. Visit our wholesale page to request a quote." },
];

export default async function AboutPage() {
  const best = await apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 8 } }).catch(() => ({ items: [] as ProductCard[] }));
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Our story", path: "/about" }])} />
      <JsonLd data={faqLd(FAQS)} />
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Our story" }]} />
      <div className="wrap">
        <PageHero kick="Our story" title="Super food for a super life, from the farms that grow it." image="/img/about_1.webp" alt="Rows of crops on an Indian farm at sunrise" text="Xiphias Superfoods brings rare and traditional foods to kitchens around the world: heirloom black rice, makhana, Gir cow ghee, raw honey and Malabar spices from India, plus fine teas like Silver Needle, bought directly from the people who grow them.">
          <ButtonLink href="/shop" variant="dark">Shop the collection</ButtonLink>
          <ButtonLink href="/b2b">Wholesale enquiries</ButtonLink>
        </PageHero>
      </div>
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Reveal from="left" className="relative">
            <span className="block overflow-hidden rounded-[28px] border border-line"><Image src="/img/about_2.webp" alt="A farmer tending crops in the field" width={760} height={507} className="aspect-[4/3] w-full object-cover" /></span>
            <div className="absolute -bottom-5 left-5 max-w-[250px] rounded-2xl border border-line bg-paper px-5 py-4 shadow-card"><b className="block font-head text-[21px] font-normal leading-tight text-royal-deep">No middlemen</b><span className="text-[13px] text-muted">We buy directly from the farmers.</span></div>
          </Reveal>
          <Reveal from="right" delay={100}>
            <span className="kick kick-line">Why we started</span>
            <h2 className="my-3 text-[clamp(30px,3.6vw,46px)] leading-[1.08]">Good food should be easy to trace.</h2>
            <p className="mb-4 text-[16.5px] leading-relaxed">Many of India&apos;s best foods are grown on small farms and pass through several traders before they reach a shop shelf, losing their story and often their freshness along the way. We buy directly from growers and farmer groups, test every lot and ship to your door from Bengaluru.</p>
            <p className="text-[16.5px] leading-relaxed">The catalogue is deliberately short: sixteen foods we know well, each from a named region. Customers order from across India and from the USA, Germany, Canada, the UAE and beyond.</p>
          </Reveal>
        </div>
      </Section>
      <section className="bg-royal-deep py-14 text-white sm:py-20">
        <div className="wrap grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <span className="kick kick-line !text-gold">Our motto</span>
            <p className="font-head text-[clamp(30px,3.8vw,50px)] font-light leading-[1.1] text-white">&ldquo;Super Food for Super Life.&rdquo;</p>
          </div>
          <p className="text-[17px] leading-relaxed text-white/80">We believe everyday meals are where good habits are built: a pot of tea in the morning, a bowl of whole-grain rice at dinner, a handful of roasted makhana in between. Our job is to make those traditional foods easy to find, honest about where they come from, and simple to cook.</p>
        </div>
      </section>
      <Section>
        <SectionHead kick="What we stand for" title="Four promises on every pack" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 60} className="grid content-start gap-3 rounded-[22px] border border-line bg-paper p-7">
              <i className="grid h-12 w-12 place-items-center rounded-full border border-gold/50 bg-cream"><Icon className="h-5.5 w-5.5 stroke-[1.6] text-royal" /></i>
              <b className="font-head text-[21px] font-normal text-ink">{t}</b>
              <span className="text-[14.5px] leading-relaxed text-muted">{d}</span>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="XIPHIAS Projects Pvt. Ltd." title="Part of a larger group" text="Xiphias Superfoods draws on the group's experience across these sectors." />
        <Reveal className="flex flex-wrap gap-2.5">{SECTORS.map((s) => <span key={s} className="rounded-full border border-line bg-paper px-4.5 py-2.5 text-[14.5px] font-medium text-royal-deep">{s}</span>)}</Reveal>
      </Section>
      <Section><SectionHead kick="Questions" title="About Xiphias Superfoods" center /><Faq items={FAQS} /></Section>
      {best.items.length > 0 && <Section tight><SectionHead kick="Bestsellers" title="Where most people start" more={{ href: "/shop", label: "Shop all" }} /><ProductGrid items={best.items} /></Section>}
      <NewsletterBox source="about" />
      <QuickView />
    </>
  );
}
