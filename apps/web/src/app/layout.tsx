import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Announcement } from "@/components/layout/announcement";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SITE } from "@/lib/site";
import { apiGet } from "@/lib/api/server";

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
    <html lang="en" className="js">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" />
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
        </Providers>
      </body>
    </html>
  );
}
