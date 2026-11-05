import Link from "next/link";
import { Sprout, Truck, RotateCcw } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";

/**
 * Three plain facts about how the shop works — the same statements made on the product, about and policy pages.
 * No certifications or health claims here on purpose.
 */
const PROOFS = [
  { Icon: Sprout, tone: "text-fresh", t: "Sourced directly from farmers", d: "We procure straight from the growers, with no intermediaries.", href: "/about", link: "Our story" },
  { Icon: Truck, tone: "text-gold-deep", t: "Free delivery in India over ₹750", d: "Ships in 1–2 days from Bengaluru.", href: "/policies/shipping", link: "Shipping" },
  { Icon: RotateCcw, tone: "text-gold-deep", t: "30-day returns on unopened packs", d: "Write to us within 30 days of delivery.", href: "/policies/returns", link: "Returns" },
];

export function Proofs() {
  return (
    <Section tight ariaLabel="How we work">
      <ul className="grid border-y border-line md:grid-cols-3">
        {PROOFS.map(({ Icon, tone, t, d, href, link }, i) => (
          <Reveal as="li" key={t} delay={i * 90} className="flex gap-5 border-line py-8 max-md:[&:not(:first-child)]:border-t md:flex-col md:gap-0 md:px-10 md:py-14 md:first:pl-0 md:last:pr-0 md:[&:not(:first-child)]:border-l lg:px-14">
            <Icon className={`mt-1 h-7 w-7 shrink-0 stroke-[1.25] md:mt-0 md:h-8 md:w-8 ${tone}`} aria-hidden />
            <div>
              <h3 className="max-w-[16ch] text-[23px] font-normal leading-[1.15] tracking-[-0.018em] md:mt-6 md:text-[clamp(24px,2.2vw,30px)]">{t}</h3>
              <p className="mt-2 text-[15px] text-muted md:mt-3">{d} <Link href={href} className="whitespace-nowrap font-semibold text-ink underline decoration-gold decoration-1 underline-offset-4 hover:text-royal">{link}</Link></p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
