/**
 * Pulls the ORIGINAL high-resolution images from the current Shopify store so the new site is crisp
 * on large / retina screens. Overwrites the small placeholders in public/img with the same filenames.
 * Run from the repo root:  pnpm images:fetch   (needs internet; ~40 files, ~1 minute)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, "..", "public", "img");
const CDN = "https://cdn.shopify.com/s/files/1/0734/1231/3318/files/";
const SITE = "https://www.xiphiassuperfoods.com/cdn/shop/files/";

// [output name, source url, max width]
const FILES = [
  ["banner_offer", SITE + "xiphias-superfoods-offer.png?width=2100", 2100],
  ["banner_2", SITE + "xipghias_superfoods.png?width=2100", 2100],
  // product packshots (1200px originals)
  ["rice", CDN + "xfs-black-rice.png", 1200], ["white", CDN + "xiphias-sf-silver-needle-white-tea.png", 1200],
  ["masala", CDN + "xiphias-sf-masala-tea.png", 1200], ["bluepea", CDN + "xsf-organic-blue-pea-tea.png", 1200],
  ["makhana", CDN + "xfs-makhana-premium.png", 1200], ["honey", CDN + "xsf-premium-organic-honey.png", 1200],
  ["ghee", CDN + "pure-gir-ghee.png", 1200], ["joha", CDN + "xsf-aromatic-joha-rice.png", 1200],
  ["buckwheat", CDN + "xsf-buckwheat.png", 1200], ["pepper", CDN + "xsf-black-pepper.png", 1200],
  ["green", CDN + "xsf-organic-green-tea-leaves.png", 1200], ["almonds", CDN + "xsf-premium-almonds.png", 1200],
  ["stevia", CDN + "xsf-organic-stevia-tea.png", 1200], ["ginger", CDN + "dried-ginger_16a4dcc7-0eb8-48df-86c6-ec4ee0798d52.png", 1200],
  ["gingerpowder", CDN + "xsf-ginger-powder_jpg.png", 1200], ["korai", CDN + "xiphias-sf-korai-guri.png", 1200],
  // lifestyle second shots (used on hover / gallery)
  ["alt_rice", CDN + "black-rice-xiphias-superfoods.png", 1088], ["alt_white", CDN + "white-tea-xiphias-superfood.png", 1088],
  ["alt_masala", CDN + "masala-tea-xiphias-superfoods.png", 1088], ["alt_bluepea", CDN + "blue-pea-tea-xiphias-superfoods.png", 1088],
  ["alt_makhana", CDN + "makhana-xsf.png", 1088], ["alt_honey", CDN + "honey-xiphias-superfoods.png", 1088],
  ["alt_ghee", CDN + "gir-cow-ghee-xiphias-superfoods.png", 1088], ["alt_joha", CDN + "joha-rice-xiphias-superfoods.png", 1088],
  ["alt_buckwheat", CDN + "buck-wheat-xiphias-superfoods.png", 1088], ["alt_pepper", CDN + "black-pepper-xiphias-superfoods.png", 1088],
  ["alt_green", CDN + "green-tea-leaves-xiphias-superfoods.png", 1088], ["alt_almonds", CDN + "almonds-xiphias-superfoods.png", 1088],
  ["alt_stevia", CDN + "stevia-tea-xiphias-superfoods.png", 1088], ["alt_ginger", CDN + "dried-whole-ginger-xiphias-superfoods.png", 1088],
  ["alt_gingerpowder", CDN + "ginger-powder-xiphias.png", 1088], ["alt_korai", CDN + "korai-guri-xiphias-superfoods.png", 1088],
  ["picks_white_tea", SITE + "white_tea_ac6fd21b-a258-4ee1-a4aa-a5ec8beb2a40.png?width=1024", 1024],
  ["picks_masala_tea", SITE + "masala_tea_xiphias.png?width=1024", 1024],
  ["picks_ginger_powder", SITE + "ginger-powder_1.png?width=1024", 1024],
  ["picks_black_rice", SITE + "organic_black_rice.png?width=1024", 1024],
  ["picks_buckwheat", SITE + "buck-wheat.png?width=1024", 1024],
  ["picks_joha_rice", SITE + "joha_rice.png?width=1024", 1024],
  ["picks_makhana", SITE + "makhana-xfs.png?width=1024", 1024],
  ["certifications", SITE + "cetifications-shopify.png?width=1540", 1540],
];

await mkdir(OUT, { recursive: true });
let ok = 0;
for (const [name, url, width] of FILES) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const webp = await sharp(buf).flatten({ background: "#ffffff" }).resize({ width, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
    await writeFile(join(OUT, `${name}.webp`), webp);
    ok++;
    console.log(`✓ ${name}.webp  (${Math.round(webp.length / 1024)} KB)`);
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
  }
}
console.log(`\nDone: ${ok}/${FILES.length} images. Restart "pnpm dev" if images look cached.`);
