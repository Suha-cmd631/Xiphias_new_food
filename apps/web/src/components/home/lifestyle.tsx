import { Truck, RotateCcw, Gift, ShieldCheck, Leaf } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHead } from "@/components/ui/section";

const ITEMS = [
  { bg: "bg-sage", Icon: Truck, t: "Free shipping", d: "On orders over ₹750 in India" },
  { bg: "bg-beige", Icon: RotateCcw, t: "30-day returns", d: "On unopened packs" },
  { bg: "bg-teal", Icon: Gift, t: "Offer & gift", d: "A free sample on orders over ₹1,500" },
  { bg: "bg-rose", Icon: ShieldCheck, t: "Secure checkout", d: "JioPay in India · Stripe worldwide" },
  { bg: "bg-sky", Icon: Leaf, t: "100% natural", d: "Plant-based and chemical-free" },
];

export function Lifestyle() {
  return (
    <Section tight ariaLabel="Shop by lifestyle">
      <SectionHead title="Shop By Lifestyle" center from="top" />
      <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-3 lg:grid-cols-5">
        {ITEMS.map(({ bg, Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 60} className="group grid justify-items-center gap-3.5">
            <i className={`pop grid h-[120px] w-[120px] place-items-center rounded-full transition-transform duration-300 group-hover:-translate-y-1.5 lg:h-[140px] lg:w-[140px] ${bg}`}>
              <Icon className="h-12 w-12 stroke-[1.2] text-ink" />
            </i>
            <b className="font-head text-[20px] font-medium text-ink">{t}</b>
            <span className="max-w-[22ch] text-[14px] text-muted">{d}</span>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
