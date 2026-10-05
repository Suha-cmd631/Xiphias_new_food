import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, FlaskConical, Truck } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Faq } from "@/components/ui/faq";
import { ProductGrid } from "@/components/shop/product-grid";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { QuoteForm } from "@/components/forms/quote-form";
import { QuickView } from "@/components/shop/quick-view";

export const metadata: Metadata = { title: { absolute: "B2B Superfoods: Bulk, Private Label & Export | Xiphias" }, description: "Bulk supply, private label and export of certified organic superfoods — black rice, makhana, white tea, masala tea and more.", alternates: { canonical: "/b2b" } };

const SERVICES = [
  { img: "/img/b2b_2.webp", t: "Bulk Supply", lead: "Premium-quality organic superfoods for businesses and retailers", pts: ["Wide range: Black Rice, Makhana, White Tea, Masala Tea, Green Tea", "Flexible bulk quantities to meet your business needs", "Fast and reliable nationwide delivery in India", "Trusted wholesale supplier and manufacturer of organic products"], cta: "Get bulk pricing" },
  { img: "/img/b2b_3.webp", t: "Private Labelling", lead: "Build your brand with custom organic products", pts: ["Wide range: Black Rice, Makhana, White Tea, Masala Tea, Green Tea", "100% organic and chemical-free products", "Flexible bulk orders for businesses", "Artwork and compliance review included"], cta: "Start a private label" },
  { img: "/img/b2b_export.webp", t: "Export", lead: "Premium organic teas and superfoods for export", pts: ["Access to global health-conscious markets", "Reliable and timely export support", "Flexible bulk orders for international business", "Active lanes to the UAE, EU and North America"], cta: "Talk to the export desk" },
];
const STEPS = [["01", "Tell us the product and volume", "From sample lots to full containers. Share your market and label requirements."], ["02", "Get a landed quote in 24 hours", "Ex-works, FOB or CIF pricing with organic and phytosanitary certificates listed."], ["03", "Approve the sample, we ship", "Lab certificate travels with every lot; tracking shared until delivery."]];
const FAQS = [
  { q: "What are the 5 best superfoods for a healthy diet?", a: "<ul><li><b>Black Rice</b> – packed with antioxidants, fibre and iron; helps improve digestion, heart health and energy levels.</li><li><b>Makhana (Fox Nuts)</b> – a low-calorie, nutrient-dense snack rich in protein, magnesium and antioxidants; supports bone health and immunity.</li><li><b>White Tea (Silver Needle)</b> – antioxidant-rich, helps fight free radicals, supports metabolism and healthy skin.</li><li><b>Masala Tea</b> – a spiced blend that energises, aids digestion and provides anti-inflammatory benefits.</li><li><b>Green Tea</b> – catechins and antioxidants that improve brain function, boost metabolism and support heart health.</li></ul>" },
  { q: "What is the most healthy superfood?", a: "While many superfoods provide unique health benefits, Black Rice from Xiphias Superfoods stands out for its exceptional nutritional profile. Packed with antioxidants, fibre and iron, it helps boost energy, supports heart health and improves digestion. Its rich dark colour indicates high levels of anthocyanins." },
  { q: "Superfoods: what are their health benefits?", a: "Superfoods are nutrient-dense foods that offer a wide range of health benefits. Regular consumption can boost immunity, improve energy levels, support heart health, enhance digestion and promote healthy skin." },
  { q: "Are Xiphias Superfoods products suitable for all dietary preferences?", a: "Yes. Our products are curated to suit vegetarian, vegan, gluten-free and organic diets. All our teas, superfoods and snacks are made from natural, high-quality ingredients, free from artificial additives." },
  { q: "How can Xiphias Superfoods benefit my daily life?", a: "Our range provides essential antioxidants, vitamins and minerals that support boosted immunity, improved digestion and gut health, increased energy and focus, and healthy skin and metabolism." },
];

export default async function B2BPage() {
  const best = await apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 12 } });
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "B2B Solution" }]} />
      <div className="wrap">
        <PageHero kick="B2B Solution" title="Bulk supply, private label and export of certified organic superfoods" image="/img/b2b_export.webp" alt="Xiphias export packs ready for shipping" text="Xiphias Superfoods is a rapidly expanding organic farming company in India, offering a seamless B2B platform that connects exporters, manufacturers, importers, producers, buyers and wholesale suppliers. We facilitate the trade of premium-quality organic products, ensuring that your business thrives in the global marketplace.">
          <ButtonLink href="#quote" variant="dark">Request a quote</ButtonLink>
          <ButtonLink href="mailto:info@xiphias.in?subject=Catalogue%20request">Download catalogue</ButtonLink>
        </PageHero>
      </div>
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <Reveal from="left" className="pic relative">
            <span className="imw block overflow-hidden rounded-card shadow-card"><Image src="/img/b2b_1.webp" alt="Organic greenhouse with harvest crates" width={640} height={427} className="aspect-[4/3] w-full object-cover" /></span>
            <div className="pop absolute -left-4 bottom-7 max-w-[240px] rounded-2xl bg-white px-4.5 py-3.5 shadow-card"><b className="block font-head text-[22px] font-medium leading-tight">100% certified organic</b><span className="text-[12.5px] text-muted">Every product and supplier vetted for sustainability, transparency and quality.</span></div>
          </Reveal>
          <Reveal from="right" delay={100}>
            <span className="kick">XIPHIAS Superfoods</span>
            <h2 className="my-3 text-[clamp(30px,3.6vw,46px)] leading-[1.1]"><WordRise text="One of India's top organic food manufacturers" /></h2>
            <p className="mb-3.5 text-[16px] text-[#444]">We are dedicated to supplying certified organic food products to businesses nationwide. We specialise in bulk supply and private labelling, helping you deliver farm-fresh, natural produce to your customers while maintaining the highest quality standards.</p>
            <p className="mb-3.5 text-[16px] text-[#444]"><b>Bulk supply &amp; private labelling of organic foods.</b> Whether you need bulk organic food products or custom-branded private label solutions, Xiphias Superfoods makes it simple and efficient. Our platform ensures access to 100% certified organic products, giving your business a competitive edge in the organic marketplace.</p>
            <p className="text-[16px] text-[#444]"><b>Certified organic products for every business.</b> We carefully vet each product and supplier to ensure sustainability, transparency and quality. From organic teas and spices to superfoods and grains, every item meets stringent standards.</p>
          </Reveal>
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="Grow your business with organic goodness" title="Partner with XIPHIAS SuperFoods" text="Access premium, farm-fresh organic products in bulk — trusted by retailers worldwide." center />
        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.t} delay={i * 80} as="article" className="flex flex-col overflow-hidden rounded-card border border-line bg-white transition-all hover:-translate-y-1.5 hover:border-transparent hover:shadow-card">
              <span className="imw block overflow-hidden"><Image src={s.img} alt="" width={640} height={480} className="aspect-[4/3] w-full object-cover" /></span>
              <div className="grid flex-1 gap-2.5 p-6 pb-7">
                <h3 className="text-[26px]">{s.t}</h3>
                <p className="text-[14.5px] font-semibold text-leaf-dark">{s.lead}</p>
                <ul className="grid gap-1.5 pl-4.5 text-[14.5px] text-[#444] list-disc">{s.pts.map((p) => <li key={p}>{p}</li>)}</ul>
                <ButtonLink href="#quote" size="sm" className="mt-auto justify-self-start">{s.cta}</ButtonLink>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="How it works" title="From enquiry to delivery in three steps" />
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 80} className="rounded-card bg-soft p-7"><i className="pop mb-3 block font-head text-[40px] font-medium not-italic leading-none text-leaf">{n}</i><b className="mb-1.5 block font-head text-[21px] font-semibold">{t}</b><span className="text-[14.5px] text-[#444]">{d}</span></Reveal>
          ))}
        </div>
      </Section>
      <Section tight id="quote">
        <Reveal from="scale" className="grid gap-10 rounded-card bg-ink p-8 text-white md:grid-cols-[0.9fr_1.1fr] md:p-12">
          <div>
            <span className="kick !text-leaf">Request a quote</span>
            <h2 className="text-[clamp(28px,3.4vw,40px)] leading-tight text-white">Tell us what you need. We reply within one working day.</h2>
            <p className="mt-3 text-[15px] text-white/75">Importers, hotel groups, cafés, Ayurveda brands and retailers source from the same farms we do.</p>
            <ul className="mt-6 grid gap-3 text-[14.5px]">
              <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-leaf" /> Certified organic · FSSAI · ISO facility</li>
              <li className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-leaf" /> Lab-tested every lot, certificate on request</li>
              <li className="flex items-center gap-3"><Truck className="h-5 w-5 text-leaf" /> Nationwide delivery in India · export worldwide</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 text-foreground"><QuoteForm /></div>
        </Reveal>
      </Section>
      <Section><SectionHead title="Frequently asked questions" center /><Faq items={FAQS} /></Section>
      <Section tight><SectionHead kick="Best seller" title="Products available in bulk" more={{ href: "/shop", label: "View all products" }} /><ProductGrid items={best.items} /></Section>
      <NewsletterBox source="b2b" />
      <QuickView />
    </>
  );
}
