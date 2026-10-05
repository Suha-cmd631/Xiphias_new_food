import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

const ICONS = { Instagram, Facebook, LinkedIn: Linkedin, YouTube: Youtube } as const;

export function Footer() {
  return (
    <footer className="mt-10 bg-soft">
      <div className="wrap py-14">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Image src="/img/logo_big.webp" alt="Xiphias Superfoods" width={112} height={98} className="h-20 w-auto" />
            <p className="mt-3 text-[14px] text-muted">Pure organic superfoods from farm to doorstep — global delivery for a healthier, better life. A XIPHIAS Projects Pvt. Ltd. company.</p>
            <ul className="mt-4 flex gap-2" aria-label="Follow us">
              {SITE.social.map((x) => { const I = ICONS[x.label as keyof typeof ICONS]; return (
                <li key={x.label}><a href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-ink hover:text-white"><I className="h-4 w-4" /></a></li>
              ); })}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[17px]">Quick links</h4>
            <ul className="grid gap-2 text-[14.5px] text-[#444]">
              {SITE.nav.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-leaf-dark">{n.label}</Link></li>)}
              <li><Link href="/faq" className="hover:text-leaf-dark">FAQ</Link></li>
              <li><Link href="/track" className="hover:text-leaf-dark">Track order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[17px]">Contact</h4>
            <p className="text-[14px] text-[#444]">{SITE.address}</p>
            <p className="mt-2 text-[14px] text-[#444]">{SITE.email}<br />{SITE.phone}</p>
          </div>
          <div>
            <h4 className="mb-3 text-[17px]">Store pickup</h4>
            <p className="text-[14px] text-[#444]">{SITE.pickup}</p>
            <p className="mt-2 text-[14px] text-[#444]">Usually ready in 24 hrs · Mon–Fri 9:00–17:00 · Sat 10:00–13:00 · Sun closed</p>
          </div>
          <div>
            <h4 className="mb-3 text-[17px]">Newsletter</h4>
            <p className="mb-3 text-[14px] text-[#444]">New lots, recipes and offers. No noise.</p>
            <NewsletterForm compact source="footer" />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} XIPHIAS Superfoods</span>
          <span className="flex flex-wrap gap-x-4">
            <Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link><Link href="/policies/terms">Terms</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/cookies">Cookies</Link>
          </span>
          <span>FSSAI · ISO · Certified organic · Secure checkout with JioPay &amp; Stripe</span>
        </div>
      </div>
    </footer>
  );
}
