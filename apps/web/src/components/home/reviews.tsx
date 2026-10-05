import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHead } from "@/components/ui/section";

export function Reviews({ items }: { items: { name: string; meta: string; text: string }[] }) {
  if (!items.length) return null;
  return (
    <Section tight>
      <SectionHead kick="Customer stories" title="Loved from Bengaluru to Dubai" center from="top" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {items.map((r, i) => (
          <Reveal key={r.name} delay={i * 70} className="grid content-start gap-3 rounded-card border border-line p-6">
            <div className="flex gap-0.5 text-gold">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
            <p className="text-[15px] text-[#444]">“{r.text}”</p>
            <div className="mt-auto"><b className="block text-ink">{r.name}</b><small className="text-muted">{r.meta}</small></div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
