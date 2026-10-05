"use client";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/site";
import { useMe } from "@/lib/api/queries";
import { useOverlay } from "@/lib/use-overlay";

/** Phone menu. Rendered on <body> (a portal) so the animated header can't clip it; closes on navigation and Esc. */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: me } = useMe();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useOverlay(open, close);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Menu" aria-expanded={open} className="grid h-12 w-10 place-items-center"><Menu className="h-6.5 w-6.5" /></button>
      {open && mounted && createPortal(
        <div className="anim-fadein fixed inset-0 z-[80] bg-black/40" onClick={close} role="dialog" aria-modal="true" aria-label="Menu">
          <nav className="anim-slidein ml-auto flex h-full w-[82%] max-w-sm flex-col overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} aria-label="Close menu" className="self-end p-1"><X className="h-6 w-6" /></button>
            <ul className="mt-4 grid gap-1 text-[20px] font-medium text-ink">
              {SITE.nav.map((i) => (
                <li key={i.href}><Link href={i.href} onClick={close} className="block border-b border-line py-3">{i.label}</Link></li>
              ))}
            </ul>
            <div className="mt-6">
              <span className="kick">Shelves</span>
              <ul className="grid gap-2.5 text-[15.5px]">
                {SITE.categories.map((c) => <li key={c.slug}><Link href={`/shop/${c.slug}`} onClick={close}>{c.name}</Link></li>)}
              </ul>
            </div>
            <div className="mt-6">
              <span className="kick">Your account</span>
              <ul className="grid gap-2.5 text-[15.5px]">
                <li><Link href={me ? "/account" : "/account/login"} onClick={close}>{me ? `${me.firstName}'s orders` : "Sign in / register"}</Link></li>
                <li><Link href="/wishlist" onClick={close}>Wishlist</Link></li>
                <li><Link href="/track" onClick={close}>Track an order</Link></li>
                <li><Link href="/store" onClick={close}>Store pickup · Koramangala</Link></li>
              </ul>
            </div>
            <p className="mt-auto pt-8 text-[13px] text-muted">{SITE.phone} · {SITE.email}</p>
          </nav>
        </div>,
        document.body,
      )}
    </div>
  );
}
