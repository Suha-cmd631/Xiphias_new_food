import { Reveal } from "@/components/motion/reveal";

export function ProductSections({ sections }: { sections: { heading: string; html: string }[] }) {
  return (
    <div className="grid gap-4">
      {sections.map((s, i) => (
        <Reveal key={s.heading} delay={i * 50}>
          <details open={i < 2} className="group rounded-[20px] border border-line bg-paper px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-head text-[20px] font-normal text-ink">
              {s.heading}<span className="text-[26px] font-light text-gold-deep transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="prose-site pb-5 text-[15px]" dangerouslySetInnerHTML={{ __html: s.html }} />
          </details>
        </Reveal>
      ))}
    </div>
  );
}
