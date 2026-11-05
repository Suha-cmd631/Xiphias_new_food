import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Announcement } from "@/components/layout/announcement";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Analytics } from "@/components/analytics/ga";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SITE } from "@/lib/site";
import { apiGet } from "@/lib/api/server";

// Self-hosted fonts (SIL OFL, licences in src/fonts). No third-party font requests.
// Fraunces: variable display serif with an optical-size axis, so large headlines get the fine high-contrast cut
// and small card titles the sturdier one. DM Sans: body. The latin-ext file only adds what latin lacks (₹ etc.).
const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-latin-opsz-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../fonts/fraunces-latin-opsz-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});
const dmSans = localFont({
  src: [{ path: "../fonts/dm-sans-latin-wght-normal.woff2", weight: "100 1000", style: "normal" }],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});
const dmSansExt = localFont({
  src: [{ path: "../fonts/dm-sans-latin-ext-wght-normal.woff2", weight: "100 1000", style: "normal" }],
  variable: "--font-dm-sans-ext",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF" }],
});

// Prices, cart and region are per-visitor cookies → render on request. ISR per page comes in drop 2.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Xiphias Superfoods – Premium Organic Teas, Spices & Superfoods", template: "%s | Xiphias Superfoods" },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, images: ["/img/banner_offer.webp"] },
  robots: { index: true, follow: true },
};

type Announce = { text: string; code: string; suffix: string; href: string };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await apiGet<{ announcement?: Announce }>("/content/settings", { query: { keys: "announcement" } }).catch(() => ({}) as { announcement?: Announce });
  const a = settings.announcement ?? { text: "Save 20% on bulk packs — use code", code: "BULKSAVE", suffix: "at checkout", href: "/shop" };
  return (
    <html lang="en" className={`js ${fraunces.variable} ${dmSans.variable} ${dmSansExt.variable}`}>
      <head>
        <link rel="icon" href="/img/logo_big.webp" />
      </head>
      <body>
        <Providers>
          <div className="site">
            <Announcement {...a} />
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <CookieBanner />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
