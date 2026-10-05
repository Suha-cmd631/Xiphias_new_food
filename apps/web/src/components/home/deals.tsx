"use client";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Section } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { nextSundayIst } from "@/lib/time";

function parts(ms: number) {
  const d = Math.floor(ms / 864e5); ms %= 864e5;
  const h = Math.floor(ms / 36e5); ms %= 36e5;
  const m = Math.floor(ms / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return [["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]] as const;
}

export function Deals() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = nextSundayIst();
    const t = setInterval(() => setLeft(Math.max(0, end - Date.now())), 1000);
    setLeft(Math.max(0, end - Date.now()));
    return () => clearInterval(t);
  }, []);
  return (
    <Section tight>
      <Reveal from="top" className="grid items-center gap-8 rounded-card bg-ink px-8 py-10 text-white md:grid-cols-2 md:px-14 md:py-14">
        <div>
          <h2 className="text-[clamp(30px,3.6vw,44px)] leading-[1.1] text-white">Healthy Deals,<br />Racing Time!</h2>
          <p className="mt-3 max-w-[48ch] text-[15.5px] text-white/75">Grab your favourite organic essentials at flash prices. These exclusive offers vanish when the clock hits zero — use code <b className="text-leaf">BULKSAVE</b> for 20% off bulk packs.</p>
          <ButtonLink href="/shop?onSale=true" variant="leaf" className="mt-6">Claim the Deal</ButtonLink>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:justify-end">
          {parts(left ?? 0).map(([label, v], i) => (
            <div key={label} className="flex items-center gap-2 sm:gap-4">
              {i > 0 && <span className="pb-6 text-[28px] text-white/40">:</span>}
              <div className="pop grid w-16 place-items-center rounded-2xl bg-white/10 py-3 sm:w-20">
                <b className="font-head text-[32px] font-medium tabular-nums sm:text-[40px]">{String(v).padStart(2, "0")}</b>
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/60">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
