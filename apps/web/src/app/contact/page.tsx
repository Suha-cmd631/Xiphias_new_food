import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHeader, Section } from "@/components/ui/section";
import { ContactForm } from "@/components/forms/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Us", description: "Contact the Xiphias Superfoods team in Koramangala, Bengaluru, about orders, products, shipping, wholesale or export. We reply within one business day.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <>
      <PageHeader crumbs={[{ href: "/", label: "Home" }, { label: "Contact" }]} title="Get in touch" text="Questions about an order, a product or a partnership — we reply within one business day." />
      <Section tight>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal from="left" className="grid content-start gap-5">
            <div className="rounded-[22px] border border-line bg-cream p-6">
              <h2 className="text-[22px]">Head office</h2>
              <p className="mt-2 flex gap-3 text-[14.5px] text-foreground/85"><MapPin className="h-5 w-5 shrink-0 text-leaf-dark" />{SITE.address}</p>
              <p className="mt-2 flex gap-3 text-[14.5px] text-foreground/85"><Phone className="h-5 w-5 shrink-0 text-leaf-dark" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a></p>
              <p className="mt-2 flex gap-3 text-[14.5px] text-foreground/85"><Mail className="h-5 w-5 shrink-0 text-leaf-dark" /><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
            </div>
            <div className="rounded-[22px] border border-line bg-paper p-6">
              <h2 className="text-[22px]">Store pickup</h2>
              <p className="mt-2 flex gap-3 text-[14.5px] text-foreground/85"><MapPin className="h-5 w-5 shrink-0 text-leaf-dark" />{SITE.pickup}</p>
              <p className="mt-2 flex gap-3 text-[14.5px] text-foreground/85"><Clock className="h-5 w-5 shrink-0 text-leaf-dark" />Mon–Fri 9:00–17:00 · Sat 10:00–13:00 · Sun closed (IST)</p>
            </div>
            <iframe title="Map" className="h-64 w-full rounded-card border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=JK+Nirmala+Arcade+80+Feet+Road+Koramangala+Bengaluru&output=embed" />
          </Reveal>
          <Reveal from="right" delay={100} className="rounded-[22px] border border-line bg-paper p-6 sm:p-8"><h2 className="mb-5 text-[26px]">Send us a message</h2><ContactForm /></Reveal>
        </div>
      </Section>
    </>
  );
}
