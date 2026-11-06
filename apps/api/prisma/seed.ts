import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { REGIONS, COUNTRIES, FX_FROM_INR, LANDED_FACTOR, SHIPPING_RULES } from "./regions.js";
import { PAGES, REDIRECTS, BANNERS, PRODUCT_SECTIONS } from "./content.js";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const here = dirname(fileURLToPath(import.meta.url));
const load = <T>(f: string): T => JSON.parse(readFileSync(join(here, "data", f), "utf8")) as T;

/** Written product copy (Nov 2026): SEO title/description, lead paragraph, sections, FAQs, image alt text. Keyed by slug. */
type ProductCopy = { name: string; subtitle: string; seoTitle: string; seoDescription: string; description: string; sections: { heading: string; html: string }[]; faqs: { q: string; a: string }[]; alts: string[] };
const COPY = load<Record<string, ProductCopy>>("product-content.json");
/** FAQs ride along in bodySections as one entry with a `faq` list; the API splits them back out. */
const copySections = (c: ProductCopy) => [...c.sections, { heading: "Questions", html: "", faq: c.faqs }];

type SeedProduct = {
  k: string; slug: string; name: string; sub: string; cat: string; origin: string; tag: string | null; was: number | null;
  variants: [string, number][]; alt: string | null; blurb: string; diet: string[]; color: string; price: number;
};
type SeedPost = { s: string; t: string; e: string; d: string; w: number; c: string; i: string | null; v: string | null };
type Site = { categories: { name: string; image: string; desc: string }[]; reviews: [string, string, string][] };

const CAT_SLUG: Record<string, string> = {
  Teas: "teas", "Grains & Rice": "grains-rice", Spices: "spices", "Nuts & Snacks": "nuts-snacks", "Honey & Ghee": "honey-ghee",
};
const HS: Record<string, string> = { Teas: "0902", "Grains & Rice": "1006", Spices: "0904", "Nuts & Snacks": "0802", "Honey & Ghee": "0409" };

function weightGrams(title: string): number {
  const m = title.match(/([\d.]+)\s*(kg|g|ml|L)/i);
  if (!m) return 500;
  const n = parseFloat(m[1]!);
  const u = m[2]!.toLowerCase();
  return Math.round(u === "kg" || u === "l" ? n * 1000 : n);
}

// Round regional prices to a "retail" ending (x.90)
function regionalPrice(inr: number, currency: string): number {
  if (currency === "INR") return inr;
  const raw = inr * FX_FROM_INR[currency]! * LANDED_FACTOR;
  return Math.max(1.9, Math.floor(raw) + 0.9);
}

async function main() {
  const products = load<SeedProduct[]>("products.json");
  const posts = load<SeedPost[]>("posts.json");
  const site = load<Site>("site.json");

  console.log("→ price lists & regions");
  const priceLists = new Map<string, string>();
  for (const r of REGIONS) {
    const pl = await prisma.priceList.upsert({
      where: { code: r.priceList },
      update: { currency: r.currency, taxInclusive: r.taxMode === "inclusive" },
      create: { code: r.priceList, currency: r.currency, taxInclusive: r.taxMode === "inclusive" },
    });
    priceLists.set(r.currency + ":" + r.code, pl.id);
    await prisma.region.upsert({
      where: { code: r.code },
      update: { name: r.name, currency: r.currency, gateway: r.gateway, taxMode: r.taxMode, freeShippingAbove: r.freeShippingAbove, defaultCountry: r.defaultCountry, priceListId: pl.id },
      create: { code: r.code, name: r.name, currency: r.currency, gateway: r.gateway, taxMode: r.taxMode, freeShippingAbove: r.freeShippingAbove, defaultCountry: r.defaultCountry, priceListId: pl.id, sortOrder: REGIONS.indexOf(r) },
    });
  }
  for (const [cc, [name, region]] of Object.entries(COUNTRIES)) {
    await prisma.regionCountry.upsert({ where: { countryCode: cc }, update: { name, regionCode: region }, create: { countryCode: cc, name, regionCode: region } });
  }
  await prisma.shippingRule.deleteMany({});
  for (const s of SHIPPING_RULES) {
    await prisma.shippingRule.create({
      data: { regionCode: s.region, name: s.name, carrier: s.carrier, baseAmount: s.base, perKg: s.perKg, etaMinDays: s.eta[0]!, etaMaxDays: s.eta[1]!, freeAbove: s.freeAbove, sortOrder: s.sort },
    });
  }

  console.log("→ categories");
  const catIds = new Map<string, string>();
  for (const [i, c] of site.categories.entries()) {
    const slug = CAT_SLUG[c.name]!;
    const row = await prisma.category.upsert({
      where: { slug },
      update: { name: c.name, description: c.desc, image: `/img/${c.image}.webp`, sortOrder: i },
      create: { slug, name: c.name, description: c.desc, image: `/img/${c.image}.webp`, sortOrder: i },
    });
    catIds.set(c.name, row.id);
  }

  console.log("→ products, variants, prices, inventory");
  for (const [i, p] of products.entries()) {
    const badge = p.tag && !p.tag.startsWith("-") ? p.tag : null;
    const copy = COPY[p.slug];
    const copyFields = copy
      ? { name: copy.name, subtitle: copy.subtitle, description: copy.description, bodySections: copySections(copy), seoTitle: copy.seoTitle, seoDescription: copy.seoDescription }
      : {};
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: copyFields,
      create: {
        slug: p.slug, name: p.name, subtitle: p.sub, description: p.blurb, bodySections: PRODUCT_SECTIONS(p.name, p.blurb, p.cat, p.origin),
        categoryId: catIds.get(p.cat)!, originDistrict: p.origin, hsCode: HS[p.cat] ?? null, shelfLifeDays: p.cat === "Honey & Ghee" ? 365 : 270,
        tags: [p.cat.toLowerCase(), ...p.diet], diet: p.diet, badge, isBestseller: p.tag === "Bestseller" || ["rice", "white", "makhana", "masala"].includes(p.k),
        isNew: ["korai", "gingerpowder"].includes(p.k), sortOrder: i,
        seoTitle: `${p.name} | Buy Online | Xiphias Superfoods`, seoDescription: p.blurb.slice(0, 155),
        ...copyFields,
        images: { create: [{ url: `/img/${p.k}.webp`, alt: copy?.name ?? p.name, sortOrder: 0 }, ...(p.alt ? [{ url: `/img/${p.alt}.webp`, alt: `${copy?.name ?? p.name} – detail`, sortOrder: 1 }] : [])] },
      },
    });
    if (copy) {
      // Descriptive alt text for the main photo and the pack shot (sortOrder 0 and 1).
      for (const [i, alt] of copy.alts.entries()) await prisma.productImage.updateMany({ where: { productId: prod.id, sortOrder: i }, data: { alt } });
    }
    for (const [vi, [title, inr]] of p.variants.entries()) {
      const sku = `XS-${p.k.toUpperCase()}-${title.replace(/\s+/g, "").toUpperCase()}`;
      const variant = await prisma.variant.upsert({
        where: { sku },
        update: { title, weightGrams: weightGrams(title), position: vi },
        create: { productId: prod.id, sku, title, weightGrams: weightGrams(title), position: vi },
      });
      await prisma.inventory.upsert({ where: { variantId: variant.id }, update: {}, create: { variantId: variant.id, onHand: 120, reserved: 0 } });
      const wasInr = vi === 0 && p.was && p.was > inr ? p.was : null;
      for (const r of REGIONS) {
        const amount = regionalPrice(inr, r.currency);
        const compareAt = wasInr ? regionalPrice(wasInr, r.currency) : null;
        await prisma.price.upsert({
          where: { variantId_priceListId: { variantId: variant.id, priceListId: priceLists.get(r.currency + ":" + r.code)! } },
          update: { amount, compareAt },
          create: { variantId: variant.id, priceListId: priceLists.get(r.currency + ":" + r.code)!, amount, compareAt },
        });
      }
    }
  }

  console.log("→ coupons");
  for (const c of [
    { code: "BULKSAVE", type: "percent" as const, value: 20, minQty: 3, description: "20% off when you buy 3 or more packs" },
    { code: "WELCOME10", type: "percent" as const, value: 10, minQty: null, description: "10% off your first order" },
  ]) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: { value: c.value, minQty: c.minQty, description: c.description, active: true }, create: c });
  }

  console.log("→ blog posts (79)");
  const bodies = load<Record<string, string>>("post-bodies.json");
  for (const post of posts) {
    // Full article bodies were copied from the live Shopify blog on 6 Oct 2026 (data/post-bodies.json, already
    // cleaned: only plain text tags, links rewritten to the new URLs). A post without a body shows its summary only.
    const bodyHtml = bodies[post.s] ?? `<p class="lead">${post.e}</p>`;
    await prisma.blogPost.upsert({
      where: { slug: post.s },
      update: { title: post.t, excerpt: post.e, bodyHtml, category: post.c, coverImage: `/img/blog/${post.s}.webp`, wordCount: post.w, publishedAt: new Date(post.d) },
      create: {
        slug: post.s, title: post.t, excerpt: post.e, bodyHtml, coverImage: `/img/blog/${post.s}.webp`, category: post.c, wordCount: post.w,
        publishedAt: new Date(post.d), shopifyId: post.v, tags: post.c.toLowerCase().split(" & "), seoTitle: post.t, seoDescription: post.e.slice(0, 155),
      },
    });
  }

  console.log("→ pages, redirects, banners, settings");
  for (const pg of PAGES) {
    await prisma.page.upsert({ where: { slug: pg.slug }, update: { title: pg.title, bodyHtml: pg.bodyHtml }, create: { slug: pg.slug, title: pg.title, bodyHtml: pg.bodyHtml } });
  }
  for (const [from, to] of REDIRECTS) {
    await prisma.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } });
  }
  await prisma.banner.deleteMany({});
  for (const b of BANNERS) {
    await prisma.banner.create({ data: { placement: b.placement, image: b.image, title: b.title, subtitle: b.subtitle, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, sortOrder: b.sort } });
  }
  const settings: Record<string, Prisma.InputJsonValue> = {
    announcement: { text: "Save 20% on bulk packs — use code", code: "BULKSAVE", suffix: "at checkout", href: "/shop" },
    deal: { title: "Healthy deals of the week", endsAt: null, weekly: true },
    store_hours: { tz: "Asia/Kolkata", weekdays: [9, 17], saturday: [10, 13] },
    reviews: site.reviews.map(([name, meta, text]) => ({ name, meta, text })),
    maintenance: false,
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // Demo login (demo@xiphias.in / Demo1234! — a publicly documented password): local/dev databases only.
  // In production it is created only with SEED_DEMO=true; otherwise an existing demo login is disabled.
  const argon2 = await import("argon2");
  const seedDemo = process.env.NODE_ENV !== "production" || /^(1|true|yes)$/i.test(process.env.SEED_DEMO ?? "");
  if (seedDemo) {
    console.log("→ demo customer (demo@xiphias.in / Demo1234!)");
    await prisma.customer.upsert({
      where: { email: "demo@xiphias.in" },
      update: {},
      create: { email: "demo@xiphias.in", firstName: "Demo", lastName: "Customer", passwordHash: await argon2.default.hash("Demo1234!"), emailVerifiedAt: new Date(), defaultRegion: "IN" },
    });
  } else {
    const demo = await prisma.customer.findUnique({ where: { email: "demo@xiphias.in" } });
    if (demo?.passwordHash && (await argon2.default.verify(demo.passwordHash, "Demo1234!").catch(() => false))) {
      await prisma.session.deleteMany({ where: { customerId: demo.id } });
      await prisma.customer.update({ where: { id: demo.id }, data: { passwordHash: null } });
      console.log("→ demo customer: login DISABLED (production; it still had the public demo password)");
    } else {
      console.log("→ demo customer skipped (production; set SEED_DEMO=true to create it)");
    }
  }

  const counts = { products: await prisma.product.count(), variants: await prisma.variant.count(), prices: await prisma.price.count(), posts: await prisma.blogPost.count(), countries: await prisma.regionCountry.count() };
  console.log("✓ seeded", counts, createHash("md5").update(JSON.stringify(counts)).digest("hex").slice(0, 6));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
