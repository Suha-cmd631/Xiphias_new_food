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
      { source: "/pages/about-xiphias-superfoods", destination: "/about", permanent: true },
      { source: "/pages/b2b-solution", destination: "/b2b", permanent: true },
      { source: "/pages/contact", destination: "/contact", permanent: true },
      { source: "/blogs/news", destination: "/blog", permanent: true },
      { source: "/blogs/news/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/policies/shipping-policy", destination: "/policies/shipping", permanent: true },
      { source: "/policies/refund-policy", destination: "/policies/returns", permanent: true },
      { source: "/policies/terms-of-service", destination: "/policies/terms", permanent: true },
      { source: "/policies/privacy-policy", destination: "/policies/privacy", permanent: true },
      { source: "/product/organic-cinnamon-powder-100-grams", destination: "/shop/spices", permanent: true },
    ];
  },
};

export default nextConfig;
