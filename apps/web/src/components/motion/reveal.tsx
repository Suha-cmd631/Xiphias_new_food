"use client";
import { Fragment, useEffect, useRef, type ReactNode, type ElementType, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveal-on-scroll (IntersectionObserver). Elements below the fold start hidden (`pre`) and get `in`
 * once they enter the viewport — the same motion language as the approved mockup. SSR renders them visible;
 * the `js` class on <html> switches the hidden state on only when JS runs.
 */
export function Reveal({ children, className, from = "bottom", delay = 0, as: Tag = "div", style }: { children: ReactNode; className?: string; from?: "bottom" | "top" | "left" | "right" | "scale"; delay?: number; as?: ElementType; style?: CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    document.documentElement.classList.add("js");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight) el.classList.add("pre");
    else el.classList.add("in");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting || e.boundingClientRect.top < 0) { el.classList.add("in"); io.disconnect(); }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dir = from === "left" ? "from-left" : from === "right" ? "from-right" : from === "top" ? "from-top" : from === "scale" ? "scale" : "";
  return (
    <Tag ref={ref} className={cn("rv", dir, className)} style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </Tag>
  );
}

/** Splits a heading into words that rise into view when the surrounding Reveal enters. */
export function WordRise({ text }: { text: string }) {
  return (
    <span className="wr">
      {text.split(/\s+/).map((w, i) => (
        <Fragment key={i}>
          <span className="w">
            <i style={{ transitionDelay: `${i * 45}ms` }}>{w}</i>
          </span>{" "}
        </Fragment>
      ))}
    </span>
  );
}
