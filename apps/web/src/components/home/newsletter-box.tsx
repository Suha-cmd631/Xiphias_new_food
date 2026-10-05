import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function NewsletterBox({ source }: { source: string }) {
  return (
    <Section tight>
      <Reveal from="scale" className="grid items-center gap-6 rounded-card bg-sand px-8 py-10 md:grid-cols-[1.2fr_1fr] md:px-12">
        <div>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-tight">Stay updated with exclusive offers &amp; wellness tips</h2>
          <p className="mt-2 text-[15px] text-[#444]">Join our community for the latest in superfood trends, healthy recipes, product launches, and subscriber-only discounts. Discover a healthier lifestyle — one email at a time.</p>
        </div>
        <NewsletterForm source={source} />
      </Reveal>
    </Section>
  );
}
