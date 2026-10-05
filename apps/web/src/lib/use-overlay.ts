"use client";
import { useEffect } from "react";

/** Shared behaviour for drawers and pop-ups: Esc closes them and the page behind stops scrolling. */
export function useOverlay(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [active, onClose]);
}
