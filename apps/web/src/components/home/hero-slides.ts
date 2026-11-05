/**
 * Editorial copy for the home hero. Kept out of the client component so the server page can read it,
 * fetch each product's live price and pack size, and hand the merged slides to <Hero>.
 * No prices here — they always come from the catalogue API.
 */
export type HeroSlideCopy = {
  /** Product whose price / pack size is shown. */
  slug: string;
  kick: string;
  /** Headline in two parts: `lead` upright, `accent` in italic. */
  lead: string;
  accent: string;
  text: string;
  /** Pack shot on a white background (blended into the panel). */
  img: string;
  href: string;
  cta: string;
};

export type HeroSlide = HeroSlideCopy & {
  product: { name: string; price: string; compareAt: string | null; pack: string | null } | null;
};

export const HERO_SLIDES: HeroSlideCopy[] = [
  { slug: "organic-black-rice", kick: "Grains & Rice · Bestseller", lead: "Organic black rice,", accent: "the Emperor's grain", text: "An heirloom grain, sourced directly from the farmers who grow it.", img: "/img/pack_rice.webp", href: "/products/organic-black-rice", cta: "Shop black rice" },
  { slug: "silver-needle-white-tea", kick: "Teas · Silver Needle", lead: "White tea picked at dawn,", accent: "one bud at a time", text: "Delicate and low in caffeine. Brew at 80 °C and re-steep three times.", img: "/img/pack_white.webp", href: "/products/silver-needle-white-tea", cta: "Shop white tea" },
  { slug: "premium-organic-honey", kick: "Honey & Ghee · Raw", lead: "Raw, unfiltered honey", accent: "and slow-churned ghee", text: "Pantry staples, made the traditional way.", img: "/img/pack_honey.webp", href: "/shop/honey-ghee", cta: "Shop honey & ghee" },
  { slug: "premium-12mm-bold-black-pepper", kick: "Spices · Malabar, Kerala", lead: "Bold black pepper", accent: "from the Malabar coast", text: "Whole 12 mm peppercorns that add depth to everyday meals.", img: "/img/pack_pepper.webp", href: "/products/premium-12mm-bold-black-pepper", cta: "Shop black pepper" },
];
