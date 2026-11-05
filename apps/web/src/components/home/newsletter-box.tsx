import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function NewsletterBox({ source }: { source: string }) {
  return (
    <Section tight>
      <Reveal from="scale" className="grid items-center gap-7 rounded-3xl bg-royal-soft px-7 py-11 sm:px-12 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-14 lg:px-16 xl:px-20">
        <div>
          <span className="kick">Newsletter</span>
          <h2 className="max-w-[20ch] text-[clamp(28px,3.1vw,42px)] leading-[1.1]">Exclusive offers <em className="font-light text-royal">&amp; wellness tips</em></h2>
          <p className="mt-3 max-w-[48ch] text-[15px] text-muted">Recipes, product launches and subscriber-only discounts. One email at a time.</p>
        </div>
        <NewsletterForm source={source} />
      </Reveal>
    </Section>
  );
}
