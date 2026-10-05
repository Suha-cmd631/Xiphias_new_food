import { Reveal } from "@/components/motion/reveal";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Reveal className="mx-auto max-w-[860px]">
      {items.map((f, i) => (
        <details key={f.q} open={i === 0} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-head text-[21px] font-medium text-ink">{f.q}<span className="text-[28px] text-leaf-dark transition-transform group-open:rotate-45">+</span></summary>
          <div className="prose-site max-w-[70ch] pb-5 text-[15.5px]" dangerouslySetInnerHTML={{ __html: f.a }} />
        </details>
      ))}
    </Reveal>
  );
}
