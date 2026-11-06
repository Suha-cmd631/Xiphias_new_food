import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { FooterBlurb, FooterBadges } from "@/components/layout/footer-claims";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

const ICONS = { Instagram, Facebook, LinkedIn: Linkedin, YouTube: Youtube } as const;

const COMPANY = [
  { href: "/learn", label: "Learn: guides & recipes" },
  { href: "/about", label: "Our story" },
  { href: "/blog", label: "Journal" },
  { href: "/b2b", label: "Wholesale & private label" },
  { href: "/us", label: "Shipping to the USA" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/track", label: "Track an order" },
];

/** Navy footer: brand, shelves, company links, visit details, newsletter. */
export function Footer() {
  const link = "text-[#c6cfdc] transition-colors hover:text-gold";
  return (
    <footer className="mt-12 bg-ink text-[#c6cfdc] sm:mt-16">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="wrap py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr_1.3fr]">
          <div>
            <span className="inline-block rounded-2xl bg-paper p-2"><Image src="/img/logo_big.webp" alt="Xiphias Superfoods" width={112} height={98} className="h-16 w-auto" /></span>
            <FooterBlurb />
            <ul className="mt-5 flex gap-2" aria-label="Follow us">
              {SITE.social.map((x) => { const I = ICONS[x.label as keyof typeof ICONS]; return (
                <li key={x.label}><a href={x.href} target="_blank" rel="noopener noreferrer" aria-label={x.label} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:border-gold hover:text-gold"><I className="h-4 w-4" /></a></li>
              ); })}
            </ul>
          </div>
          <nav aria-label="Shop">
            <h4 className="mb-3.5 text-[18px] text-white">Shop</h4>
            <ul className="grid gap-2 text-[14.5px]">
              <li><Link href="/shop" className={link}>All products</Link></li>
              {SITE.categories.map((c) => <li key={c.slug}><Link href={`/shop/${c.slug}`} className={link}>{c.name}</Link></li>)}
              <li><Link href="/wishlist" className={link}>Wishlist</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h4 className="mb-3.5 text-[18px] text-white">Xiphias</h4>
            <ul className="grid gap-2 text-[14.5px]">
              {COMPANY.map((n) => <li key={n.href}><Link href={n.href} className={link}>{n.label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <h4 className="mb-3.5 text-[18px] text-white">Visit &amp; contact</h4>
            <p className="text-[14px]">{SITE.address}</p>
            <p className="mt-2 text-[14px]">{SITE.email}<br />{SITE.phone}</p>
            <p className="mt-3 text-[14px]"><span className="text-white">Store pickup:</span> {SITE.pickup}</p>
            <p className="mt-1 text-[13px] text-[#9aa8bd]">Mon–Fri 9:00–17:00 · Sat 10:00–13:00 · Sun closed (IST)</p>
          </div>
          <div>
            <h4 className="mb-3.5 text-[18px] text-white">Harvest notes</h4>
            <p className="mb-3 text-[14px]">New lots, brewing guides and recipes, twice a month. No noise.</p>
            <NewsletterForm compact source="footer" />
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-[#9aa8bd] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} XIPHIAS Superfoods · A XIPHIAS Projects Pvt. Ltd. company</span>
          <span className="flex flex-wrap gap-x-4">
            {[["shipping", "Shipping"], ["returns", "Returns"], ["terms", "Terms"], ["privacy", "Privacy"], ["cookies", "Cookies"]].map(([s, l]) => <Link key={s} href={`/policies/${s}`} className="hover:text-gold">{l}</Link>)}
          </span>
          <FooterBadges />
        </div>
      </div>
    </footer>
  );
}
