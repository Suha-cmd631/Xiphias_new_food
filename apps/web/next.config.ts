import type { NextConfig } from "next";

const API = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@xsf/contracts"],
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 88], remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async rewrites() {
    // Same-origin API in the browser: /api/v1/* → Express. Cookies stay first-party in every environment.
    return [{ source: "/api/v1/:path*", destination: `${API}/api/v1/:path*` }];
  },
  async redirects() {
    // Old Shopify URLs → new routes (SEO). Mirror of the Redirect table; keep both in sync.
    return [
      { source: "/collections/all", destination: "/shop", permanent: true },
      { source: "/collections/b2b-solutions", destination: "/b2b", permanent: true },
      // Old collection handles → the matching category, in one hop. Anything unrecognised falls through to /shop.
      { source: "/collections/:slug(teas|tea|organic-teas|organic-tea|herbal-teas|herbal-tea)", destination: "/shop/teas", permanent: true },
      { source: "/collections/:slug(grains-rice|grains-and-rice|grains|rice|organic-rice)", destination: "/shop/grains-rice", permanent: true },
      { source: "/collections/:slug(spices|spice|organic-spices)", destination: "/shop/spices", permanent: true },
      { source: "/collections/:slug(nuts-snacks|nuts-and-snacks|nuts|snacks|dry-fruits|makhana)", destination: "/shop/nuts-snacks", permanent: true },
      { source: "/collections/:slug(honey-ghee|honey-and-ghee|honey|ghee)", destination: "/shop/honey-ghee", permanent: true },
      { source: "/collections/:slug", destination: "/shop", permanent: true },
      { source: "/pages/faq", destination: "/faq", permanent: true },
      { source: "/pages/about-xiphias-superfoods", destination: "/about", permanent: true },
      { source: "/pages/b2b-solution", destination: "/b2b", permanent: true },
      { source: "/pages/contact", destination: "/contact", permanent: true },
      { source: "/blogs/news", destination: "/blog", permanent: true },
      // Tag listings have no equivalent; these two must stay above the :slug rule or "tagged" is read as a post slug.
      { source: "/blogs/news/tagged", destination: "/blog", permanent: true },
      { source: "/blogs/news/tagged/:tag", destination: "/blog", permanent: true },
      { source: "/blogs/news/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/policies/shipping-policy", destination: "/policies/shipping", permanent: true },
      { source: "/policies/refund-policy", destination: "/policies/returns", permanent: true },
      { source: "/policies/terms-of-service", destination: "/policies/terms", permanent: true },
      { source: "/policies/privacy-policy", destination: "/policies/privacy", permanent: true },
      // Older Shopify product addresses that the blog articles still link to.
      { source: "/products/aromatic-joha-rice", destination: "/products/premium-aromatic-joha-rice", permanent: true },
      { source: "/products/black-pepper", destination: "/products/premium-12mm-bold-black-pepper", permanent: true },
      { source: "/products/black-rice-natural-diabetic-friendly-1kg", destination: "/products/organic-black-rice", permanent: true },
      { source: "/products/buckwheat-gluten-free-superfood", destination: "/products/premium-organic-buckwheat", permanent: true },
      { source: "/products/foxnuts-makhana-superfood", destination: "/products/premium-makhana-fox-nuts", permanent: true },
      { source: "/products/green-tea-leaves", destination: "/products/premium-green-tea-leaves", permanent: true },
      { source: "/products/makhana-fox-nuts", destination: "/products/premium-makhana-fox-nuts", permanent: true },
      { source: "/products/masala-tea-natural-spices-100g", destination: "/products/masala-tea-indian-spiced", permanent: true },
      { source: "/products/organic-blue-pea-tea", destination: "/products/premium-organic-blue-pea-tea", permanent: true },
      { source: "/products/organic-ginger-powder", destination: "/products/premium-organic-ginger-powder", permanent: true },
      { source: "/products/premium-ginger-powder-100g", destination: "/products/premium-organic-ginger-powder", permanent: true },
      { source: "/product/organic-cinnamon-powder-100-grams", destination: "/shop/spices", permanent: true },
    ];
  },
};

export default nextConfig;
