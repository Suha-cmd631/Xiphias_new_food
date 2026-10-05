"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Copy } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quiet editorial hero: warm off-white panel, one headline, one product disc.
 * Real text for SEO, one priority image for LCP, fixed height so nothing shifts.
 */
const SLIDES = [
  { kick: "Grains & Rice · Assam", title: "Organic black rice, the Emperor's grain", text: "Heirloom, antioxidant-rich and naturally gluten-free — sourced directly from the farmers who grow it.", img: "/img/rice.webp", href: "/products/organic-black-rice", cta: "Shop black rice", meta: "1 kg · ₹600" },
  { kick: "Teas · Silver Needle", title: "White tea picked at dawn, one bud at a time", text: "Delicate, low-caffeine and loaded with antioxidants. Brew at 80 °C; re-steep three times.", img: "/img/white.webp", href: "/products/silver-needle-white-tea", cta: "Shop white tea", meta: "50 g · ₹2,900" },
  { kick: "Nuts & Snacks · Bihar", title: "Makhana — the light, protein-rich snack", text: "Hand-popped fox nuts from the ponds of Bihar. Roast with a little ghee and sea salt.", img: "/img/makhana.webp", href: "/products/premium-makhana-fox-nuts", cta: "Shop makhana", meta: "500 g · ₹1,100" },
  { kick: "Honey & Ghee · Raw", title: "Raw honey and slow-churned bilona ghee", text: "Unfiltered honey and A2 Gir cow ghee made the traditional way. Pantry staples, done properly.", img: "/img/honey.webp", href: "/shop/honey-ghee", cta: "Shop honey & ghee", meta: "500 ml · ₹520" },
];
const INTERVAL = 7500;

function CouponPill() {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText("WELCOME10"); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked: code is visible anyway */ } };
  return (
    <p className="mt-6 inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1.5 rounded-[22px] border border-dashed border-leaf-dark/40 bg-white/70 py-1.5 pl-4 pr-1.5 text-[13.5px] text-[#444]">
      <span>New here? <b className="font-semibold text-leaf-dark">10% off</b> your first order with</span>
      <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-mono text-[12.5px] font-semibold tracking-wider text-white hover:bg-leaf-dark" aria-label="Copy coupon code WELCOME10">
        WELCOME10 {done ? <Check className="h-3.5 w-3.5 text-leaf" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </p>
  );
}

export function Hero() {
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = SLIDES.length;
  const go = useCallback((i: number) => setIdx(((i % n) + n) % n), [n]);
  const restart = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer.current = setInterval(() => setIdx((i) => (i + 1) % n), INTERVAL);
  }, [n]);
  useEffect(() => { restart(); return () => { if (timer.current) clearInterval(timer.current); }; }, [restart]);
  const s = SLIDES[idx]!;
  return (
    <section className="pt-6" aria-roledescription="carousel" aria-label="Featured">
      <div className="wrap">
        <div className="anim-herowipe relative grid min-h-[560px] overflow-hidden rounded-3xl bg-[#f6f3ec] md:grid-cols-[1.1fr_0.9fr] lg:min-h-[620px]">
          {/* text */}
          <div key={idx} className="hero-t relative z-10 flex flex-col justify-center p-8 sm:p-12 lg:p-16 xl:p-20">
            <span className="kick">{s.kick}</span>
            <h1 className="mt-3 max-w-[17ch] text-[clamp(38px,4.4vw,64px)] leading-[1.02] tracking-[-0.01em]">{s.title}</h1>
            <p className="mt-5 max-w-[44ch] text-[16.5px] leading-relaxed text-[#555]">{s.text}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={s.href} className={buttonVariants({ variant: "dark", size: "lg" })}>{s.cta}</Link>
              <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>All products</Link>
            </div>
            <CouponPill />
            <div className="mt-10 flex items-center gap-3 sm:mt-12">
              <button onClick={() => { go(idx - 1); restart(); }} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-white"><ArrowLeft className="h-4.5 w-4.5" /></button>
              <button onClick={() => { go(idx + 1); restart(); }} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-white"><ArrowRight className="h-4.5 w-4.5" /></button>
              <span className="ml-3 text-[13px] tabular-nums text-muted">{String(idx + 1).padStart(2, "0")} — {String(n).padStart(2, "0")}</span>
            </div>
          </div>
          {/* disc */}
          <div className="relative min-h-[360px] md:min-h-0">
            <div className="absolute left-1/2 top-1/2 aspect-square w-[76%] -translate-x-1/2 -translate-y-[55%] overflow-hidden rounded-full shadow-[0_30px_70px_-30px_rgb(0_0_0/.45)] ring-1 ring-black/5 md:w-[84%]">
              {SLIDES.map((sl, i) => (
                <Image key={sl.img} src={sl.img} alt={i === idx ? sl.title : ""} fill priority={i === 0} sizes="(max-width: 768px) 80vw, 40vw" quality={88} className={cn("anim-spin-slow scale-[1.35] object-cover transition-opacity duration-[1200ms]", i === idx ? "opacity-100" : "opacity-0")} />
              ))}
            </div>
            <p key={`m${idx}`} className="anim-cardin absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] tracking-[0.04em] text-muted" style={{ animationDelay: "400ms" }}>{s.meta}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
