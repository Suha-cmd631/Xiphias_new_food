import type { Metadata } from "next";
import Image from "next/image";
import { Leaf, FlaskConical, Truck, ShieldCheck } from "lucide-react";
import type { ProductCard } from "@xsf/contracts";
import { apiGet } from "@/lib/api/server";
import { PageHeader, Section, SectionHead } from "@/components/ui/section";
import { PageHero } from "@/components/ui/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, WordRise } from "@/components/motion/reveal";
import { Faq } from "@/components/ui/faq";
import { ProductGrid } from "@/components/shop/product-grid";
import { NewsletterBox } from "@/components/home/newsletter-box";
import { QuickView } from "@/components/shop/quick-view";

export const metadata: Metadata = { title: { absolute: "About XIPHIAS Superfoods | Organic Wellness Brand" }, description: "XIPHIAS SuperFoods procures certified organic superfoods directly from farmers and delivers worldwide. Super Food for Super Life.", alternates: { canonical: "/about" } };

const VALUES = [
  { Icon: Leaf, t: "Direct from farmers", d: "We procure straight from growers, eliminating intermediaries." },
  { Icon: FlaskConical, t: "Certified & tested", d: "Certified organic, lab-screened every lot, no additives or pesticides." },
  { Icon: Truck, t: "Worldwide delivery", d: "Popular in the USA, Germany, Canada, the UAE and many more." },
  { Icon: ShieldCheck, t: "Curated rare superfoods", d: "A specially curated catalogue of rare organic superfoods and staples." },
];
const SECTORS = ["Horticulture", "Floriculture", "E-Dairy", "Food Processing", "Organic Farming", "Fishery", "Real Estate", "Warehouse Solutions"];
const FAQS = [
  { q: "What is Xiphias Superfoods, and what makes it unique?", a: "Xiphias Superfoods is dedicated to providing high-quality, nutrient-rich superfoods designed to enhance health and well-being. We stand out by combining nature's finest ingredients with science-backed nutrition, ensuring our products are pure, powerful, and effective." },
  { q: "What is the philosophy behind Xiphias Superfoods?", a: "We believe that true wellness starts with what you eat. Our philosophy is rooted in the idea that food is the foundation of vitality, energy, and balance. By offering natural, clean, and functional superfoods, we help people nourish their bodies and minds for a healthier life." },
  { q: "Where do you source your ingredients from?", a: "We carefully source our ingredients from trusted, sustainable farms and suppliers. Our commitment to quality means we select only the finest superfoods, ensuring they are free from harmful additives, pesticides, and unnecessary processing." },
  { q: "Are your products suitable for all dietary preferences?", a: "Yes. Our superfoods are designed to support various lifestyles, including vegan, gluten-free, and organic diets. We prioritise clean-label products with no artificial additives, making them suitable for anyone looking to improve their health naturally." },
  { q: "How can Xiphias Superfoods benefit my daily life?", a: "Incorporating Xiphias Superfoods into your routine can help boost energy, improve digestion, support immunity, and enhance overall well-being. Our products are packed with essential nutrients to fuel your body and mind, helping you live a more vibrant, balanced life." },
];

export default async function AboutPage() {
  const best = await apiGet<{ items: ProductCard[] }>("/catalog/products/bestsellers", { query: { limit: 8 } });
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "About" }]} />
      <div className="wrap">
        <PageHero kick="About XIPHIAS Superfoods" title="Super Food for Super Life" image="/img/about_1.webp" alt="Organic farm rows at sunrise" text="XIPHIAS SuperFoods is a fully-owned subsidiary of XIPHIAS Projects Pvt. Ltd., headquartered in Bangalore, India. We deliver a diverse range of services spanning Horticulture, Floriculture, E-Dairy, Food Processing, Organic Farming, Fishery, Real Estate and Warehouse Solutions.">
          <ButtonLink href="/shop" variant="dark">Shop the collection</ButtonLink>
          <ButtonLink href="/b2b">Partner with us</ButtonLink>
        </PageHero>
      </div>
      <Section>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <Reveal from="left" className="pic relative">
            <span className="imw block overflow-hidden rounded-card shadow-card"><Image src="/img/about_2.webp" alt="Farmer tending to crops" width={760} height={507} className="aspect-[4/3] w-full object-cover" /></span>
            <div className="pop absolute -left-4 bottom-7 max-w-[240px] rounded-2xl bg-white px-4.5 py-3.5 shadow-card"><b className="block font-head text-[22px] font-medium leading-tight">No intermediaries</b><span className="text-[12.5px] text-muted">We procure our products directly from the farmers.</span></div>
          </Reveal>
          <Reveal from="right" delay={100}>
            <span className="kick">Trusted organic food store</span>
            <h2 className="my-3 text-[clamp(30px,3.6vw,46px)] leading-[1.1]"><WordRise text="Healthy, pure, high-quality organic food — for you and the planet" /></h2>
            <p className="mb-3.5 text-[16px] text-[#444]">At XIPHIAS SuperFoods, we understand the importance of healthy, pure, and high-quality organic food for your well-being and the environment. We procure our products directly from the farmers, eliminating the need for intermediaries. Our catalogue of natural organic products is specially curated and consists of a healthy collection of rare organic superfoods and products.</p>
            <p className="text-[16px] text-[#444]">As reflected in our motto, “Super Food for Super Life”, we are committed to delivering top-quality natural products right to your doorstep. Our catalogue is available for worldwide delivery and enjoys widespread popularity in the USA, Germany, Canada, the UAE and many more. With us, you can embark on a transformative journey towards a healthier and more sustainable lifestyle, all from the comfort of your home.</p>
          </Reveal>
        </div>
      </Section>
      <Section tight>
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="grid content-start gap-3 rounded-card bg-sage p-8 sm:p-11"><span className="kick">The XIPHIAS story</span><h3 className="text-[28px] leading-tight"><WordRise text="True wellness starts from within" /></h3><p className="text-[15.5px] text-[#444]">The food we eat fuels not just our bodies but our minds and spirits as well. That's why we're committed to providing pure, nutrient-rich superfoods that nourish, energise, and uplift. Inspired by nature and backed by science, our mission is to help you live healthier, stronger, and more vibrant every day.</p><p className="font-head text-[19px] italic text-leaf-dark">“Eat better, live better — because wellness begins with what's on your plate.”</p></Reveal>
          <Reveal delay={80} className="grid content-start gap-3 rounded-card bg-beige p-8 sm:p-11"><span className="kick">Our mission</span><h3 className="text-[28px] leading-tight"><WordRise text="Redefine wellness through pure, nutrient-rich superfoods" /></h3><p className="text-[15.5px] text-[#444]">We believe that true health begins with what we eat, fuelling not just our bodies but our minds and spirits as well. By blending nature's best ingredients with science-backed nutrition, we strive to empower individuals to live healthier, stronger, and more vibrant lives. Our goal is simple — make wholesome food accessible and help people thrive from the inside out.</p></Reveal>
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="Why people choose us" title="What we stand for" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 60} className="grid gap-2.5 rounded-card border border-line p-6 transition-all hover:-translate-y-1 hover:shadow-card">
              <i className="pop grid h-13 w-13 place-items-center rounded-full bg-leaf-soft"><Icon className="h-6 w-6 stroke-[1.6] text-leaf-dark" /></i>
              <b className="font-head text-[20px] font-semibold">{t}</b><span className="text-[14px] text-muted">{d}</span>
            </Reveal>
          ))}
        </div>
      </Section>
      <Section tight>
        <SectionHead kick="XIPHIAS Projects Pvt. Ltd." title="Part of a larger group" text="XIPHIAS Superfoods draws on the group's work across these sectors." />
        <Reveal className="flex flex-wrap gap-2.5">{SECTORS.map((s, i) => <span key={s} className="pop rounded-full border-[1.5px] border-line bg-white px-4.5 py-2.5 text-[14.5px] font-medium" style={{ transitionDelay: `${i * 50}ms` }}>{s}</span>)}</Reveal>
      </Section>
      <Section><SectionHead title="Frequently asked questions" center /><Faq items={FAQS} /></Section>
      <Section tight><SectionHead kick="Best seller" title="Most loved products" more={{ href: "/shop", label: "View all products" }} /><ProductGrid items={best.items} /></Section>
      <NewsletterBox source="about" />
      <QuickView />
    </>
  );
}
