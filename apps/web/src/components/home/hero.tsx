"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "./hero-slides";

/**
 * Editorial hero: warm off-white panel, serif headline, the real pack on the right.
 * - Every slide's text is in the server HTML; only the first headline is the page <h1>, the rest are paragraphs.
 * - Slides are stacked in one grid cell, so the panel height never changes between slides (no layout shift).
 * - Pack shots have a white studio background: `mix-blend-multiply` on the <img> itself lets it melt into the panel.
 *   Keep transforms / opacity / z-index off the image's ancestors, or the blend is isolated and the white box returns.
 */
const INTERVAL = 7500;

function Coupon() {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText("WELCOME10"); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked: code is visible anyway */ } };
  return (
    <p className="text-[13px] leading-relaxed text-muted">
      New here? 10% off your first order with{" "}
      <button onClick={copy} className="inline-flex items-center gap-1.5 border-b border-dashed border-gold-deep/60 font-semibold tracking-[0.08em] text-ink transition-colors hover:text-royal" aria-label="Copy coupon code WELCOME10">
        WELCOME10 {done ? <Check className="h-3.5 w-3.5 text-fresh" /> : <Copy className="h-3.5 w-3.5 text-gold-deep" />}
      </button>
    </p>
  );
}

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = slides.length;
  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);
  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (n > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setAuto(true); timer.current = setInterval(() => setIdx((i) => (i + 1) % n), INTERVAL); }
  }, [n]);
  useEffect(() => { restart(); return () => { if (timer.current) clearInterval(timer.current); }; }, [restart]);
  if (!n) return null;
  return (
    <section className="pt-4 sm:pt-6" aria-roledescription="carousel" aria-label="Featured">
      <div className="wrap">
        <div className="anim-herowipe relative overflow-hidden rounded-3xl bg-soft lg:grid lg:min-h-[580px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] xl:min-h-[620px]">
          {/* text: all slides share one grid cell */}
          <div className="flex flex-col justify-center px-6 pt-9 sm:px-12 sm:pt-12 lg:pb-28 lg:pl-16 lg:pr-4 lg:pt-14 xl:pl-20">
            <div className="grid">
            {slides.map((s, i) => {
              const on = i === idx;
              const Title = i === 0 ? "h1" : "p";
              return (
                <div key={s.slug} aria-hidden={!on} inert={!on} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`} className={cn("col-start-1 row-start-1 flex flex-col justify-center", on ? "hero-t" : "invisible")}>
                  <span className="kick flex items-center gap-3 !mb-0"><i className="h-px w-8 bg-gold" aria-hidden />{s.kick}</span>
                  <Title className="mt-5 font-head text-[clamp(35px,4.5vw,68px)] font-normal leading-[1.04] tracking-[-0.028em] text-ink">
                    <span className="block text-balance">{s.lead}</span> <em className="block text-balance font-light text-royal">{s.accent}</em>
                  </Title>
                  <p className="mt-5 max-w-[40ch] text-[16.5px] leading-relaxed text-foreground sm:text-[17.5px]">{s.text}</p>
                  {s.product && (
                    <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[14px] text-muted">
                      <b className="text-[22px] font-semibold tabular-nums text-ink">{s.product.price}</b>
                      {s.product.compareAt && <s className="text-[14.5px]">{s.product.compareAt}</s>}
                      <span className="flex items-center gap-3"><i className="h-3.5 w-px bg-gold" aria-hidden />{s.product.name}{s.product.pack ? ` · ${s.product.pack}` : ""}</span>
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                    <Link href={s.href} className={buttonVariants({ variant: "dark", size: "lg" })}>{s.cta}</Link>
                    <Link href="/shop" className="group/all inline-flex items-center gap-2 border-b border-gold pb-1 text-[14.5px] font-semibold text-ink transition-colors hover:text-royal">All 16 products <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-1" /></Link>
                  </div>
                </div>
              );
            })}
            </div>
            <div className="mt-7 max-lg:hidden"><Coupon /></div>
          </div>
          {/* pack shot: flush with the panel's right edge so spoons / hands enter from outside the frame */}
          <div className="relative mt-2 aspect-[1088/960] w-full sm:ml-auto sm:max-w-[620px] lg:mt-0 lg:aspect-auto lg:max-w-none">
            <i className="absolute left-1/2 top-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70" aria-hidden />
            <i className="absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/60" aria-hidden />
            <div className="absolute inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:my-auto lg:aspect-[1088/960] lg:w-[112%] lg:max-h-full">
              {slides.map((s, i) => (
                <Image key={s.img} src={s.img} alt={i === idx ? `${s.product?.name ?? s.lead} pack` : ""} fill priority={i === 0} loading={i === 0 ? undefined : "lazy"} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 620px, 52vw" quality={88} className={cn("object-contain object-right mix-blend-multiply mask-l-from-90% mask-t-from-94% mask-b-from-94% transition-opacity duration-700", i === idx ? "opacity-100" : "opacity-0")} />
              ))}
            </div>
          </div>
          {/* controls + welcome code */}
          <div className="flex flex-col gap-4 px-6 pb-7 pt-2 sm:px-12 sm:pb-10 lg:absolute lg:inset-x-0 lg:bottom-0 lg:right-auto lg:px-16 lg:pb-9 xl:px-20">
            {n > 1 && (
              <div className="flex items-center gap-4">
                <button onClick={() => { go(idx - 1); restart(); }} aria-label="Previous slide" className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
                <button onClick={() => { go(idx + 1); restart(); }} aria-label="Next slide" className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"><ArrowRight className="h-4 w-4" /></button>
                <div className="ml-1 flex items-center gap-1.5">
                  {slides.map((s, i) => (
                    <button key={s.slug} onClick={() => { go(i); restart(); }} aria-label={`Show slide ${i + 1}`} aria-current={i === idx} className="group/dot grid h-10 place-items-center">
                      <span className={cn("block h-0.5 overflow-hidden rounded-full bg-ink/15 transition-all duration-300", i === idx ? "w-9" : "w-4 group-hover/dot:bg-ink/40")}>
                        {i === idx && <span key={`${idx}-${auto}`} className={cn("block h-full w-full bg-gold-deep", auto && "anim-heroprog")} />}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-[12.5px] tabular-nums tracking-[0.08em] text-muted">{String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
              </div>
            )}
            <div className="lg:hidden"><Coupon /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
