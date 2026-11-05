import { Star } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHead } from "@/components/ui/section";

/** Testimonials are unverified until the owner confirms them, so any "Verified buyer" wording is stripped before rendering. */
const cleanMeta = (meta: string) => meta.replace(/verified\s+(buyer|purchase|customer)/gi, "").replace(/^[\s·,\-–—]+|[\s·,\-–—]+$/g, "").trim();

export function Reviews({ items }: { items: { name: string; meta: string; text: string }[] }) {
  if (!items.length) return null;
  return (
    <Section tight>
      <SectionHead kick="Customer stories" title="Loved from Bengaluru to Dubai" center from="top" />
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {items.map((r, i) => {
          const meta = cleanMeta(r.meta);
          return (
            <Reveal key={r.name} delay={i * 70} as="figure" className="flex flex-col gap-4 border-t border-gold pt-6">
              <div className="flex gap-0.5 text-gold" aria-label="5 out of 5">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="h-3.5 w-3.5 fill-current" aria-hidden />)}</div>
              <blockquote className="font-head text-[19px] leading-[1.45] text-ink">“{r.text}”</blockquote>
              <figcaption className="mt-auto text-[13.5px] text-muted"><b className="font-semibold text-ink">{r.name}</b>{meta && <> · {meta}</>}</figcaption>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
