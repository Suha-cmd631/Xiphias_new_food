import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal, WordRise } from "@/components/motion/reveal";

export function Section({ children, className, tight, id, ariaLabel }: { children: ReactNode; className?: string; tight?: boolean; id?: string; ariaLabel?: string }) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn(tight ? "py-10 sm:py-14" : "py-14 sm:py-24", className)}>
      <div className="wrap">{children}</div>
    </section>
  );
}

export function SectionHead({ kick, title, text, more, center, from = "bottom" }: { kick?: string; title: string; text?: string; more?: { href: string; label: string }; center?: boolean; from?: "bottom" | "top" }) {
  return (
    <Reveal from={from} className={cn("mb-9 flex gap-6 sm:mb-12", center ? "flex-col items-center text-center" : "items-end justify-between")}>
      <div>
        {kick && <span className="kick">{kick}</span>}
        <h2 className="text-[clamp(31px,3.7vw,50px)] leading-[1.08]">
          <WordRise text={title} />
        </h2>
        {text && <p className={cn("mt-3 max-w-[56ch] text-[15.5px] text-muted", center && "mx-auto")}>{text}</p>}
      </div>
      {more && (
        <Link href={more.href} className="group/more hidden shrink-0 items-center gap-2 border-b border-gold pb-1 text-[14.5px] font-semibold text-ink transition-colors hover:text-royal sm:inline-flex">
          {more.label} <ArrowRight className="h-4 w-4 transition-transform group-hover/more:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

export function PageHeader({ crumbs, title, text, children }: { crumbs: { href?: string; label: string }[]; title?: string; text?: string; children?: ReactNode }) {
  return (
    <section className="pt-7">
      <div className="wrap">
        <nav aria-label="Breadcrumb" className="text-[12.5px] text-muted">
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-2">/</span>}
              {c.href ? <Link href={c.href} className="hover:text-ink">{c.label}</Link> : <b className="text-ink">{c.label}</b>}
            </span>
          ))}
        </nav>
        {title && <h1 className="mt-3 text-[clamp(33px,4.2vw,54px)] leading-[1.08]">{title}</h1>}
        {text && <p className="mt-2 max-w-[60ch] text-muted">{text}</p>}
        {children}
      </div>
    </section>
  );
}
