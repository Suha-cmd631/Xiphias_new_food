/**
 * Search copy for each shelf (category) page: the title and description Google shows,
 * a short intro above the products and a few common questions below them.
 * Written US-first, no medical claims, and no "organic" until the USDA certificate is confirmed.
 */
export type Shelf = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  guides: { href: string; label: string }[];
  faqs: { q: string; a: string }[];
};

export const SHELVES: Shelf[] = [
  {
    slug: "teas",
    title: "Loose-Leaf Teas: Silver Needle, Green, Masala & Blue Pea",
    description: "Single-origin loose-leaf teas: Silver Needle white tea, Assam green tea, masala chai, butterfly pea flower and stevia leaf. Shipped worldwide from Bengaluru.",
    h1: "Loose-leaf teas, single-origin and whole",
    intro: "From hand-plucked Silver Needle buds to a warming masala chai blend and the colour-changing butterfly pea flower, every tea on this shelf comes from a named growing region and ships in resealable packs. Each one has its own brewing temperature, so we print it on the pack and on the product page.",
    guides: [
      { href: "/learn/how-to-brew-white-tea", label: "How to brew white tea" },
      { href: "/learn/masala-chai-recipe", label: "Masala chai recipe" },
      { href: "/learn/butterfly-pea-flower-tea", label: "Butterfly pea flower tea" },
    ],
    faqs: [
      { q: "Which tea should I start with?", a: "If you like delicate, naturally sweet tea, start with Silver Needle white tea. If you want something bold that takes milk, choose the masala tea. Butterfly pea flower is caffeine-free and turns from blue to violet with a squeeze of lemon." },
      { q: "Are these teas loose leaf or tea bags?", a: "All of our teas are loose leaf or whole flower. Use a strainer, an infuser basket or a teapot with a built-in filter." },
      { q: "Do the teas contain caffeine?", a: "White, green and masala tea contain caffeine from the tea leaf. Butterfly pea flower tea and stevia leaf tea are made from other plants and are naturally caffeine-free." },
      { q: "How should I store loose-leaf tea?", a: "Keep it sealed, away from light, heat, moisture and strong smells. Stored this way, most teas keep their flavour for 12 to 18 months." },
    ],
  },
  {
    slug: "grains-rice",
    title: "Heirloom Rice & Grains: Black Rice, Joha Rice, Buckwheat",
    description: "Heirloom grains from India: black (forbidden) rice, aromatic Joha rice, buckwheat and Korai guri roasted rice powder. Unpolished, from Bengaluru.",
    h1: "Heirloom rice and whole grains",
    intro: "These are the grains Indian farming families have kept growing for generations: deep-purple black rice, small-grained aromatic Joha rice from Assam, buckwheat groats and Korai guri, Assam's roasted rice powder. The rice is sold whole and unpolished, so it keeps its bran, its colour and its nutty flavour.",
    guides: [{ href: "/learn/how-to-cook-black-rice", label: "How to cook black rice" }],
    faqs: [
      { q: "How do I cook black rice?", a: "Rinse 1 cup of rice, soak it for 30 minutes if you can, then simmer it with 2 cups of water, covered, for about 30 minutes. Rest it for 10 minutes before fluffing. Our full guide has stovetop, rice cooker and Instant Pot timings." },
      { q: "What is Joha rice?", a: "Joha is a short-grained, naturally fragrant rice grown in Assam in northeast India. It cooks soft and is often used for everyday rice and sweet rice dishes." },
      { q: "Is buckwheat a grain?", a: "Buckwheat is a seed that is cooked and eaten like a grain. It is naturally gluten-free, though anyone who is very sensitive should check the pack for cross-contact information." },
      { q: "Why is unpolished rice better for cooking?", a: "Unpolished rice keeps its outer bran layer, which gives it more flavour, more fibre and a firmer bite. It does take a little longer to cook than white rice." },
    ],
  },
  {
    slug: "spices",
    title: "Indian Whole Spices: 12mm Bold Black Pepper & Dried Ginger",
    description: "Whole Indian spices from the Malabar coast and Kerala: 12mm bold black pepper, whole dried ginger and ginger powder. Strong aroma, shipped worldwide.",
    h1: "Whole spices from the Malabar coast",
    intro: "India's spice coast has traded pepper and ginger with the world for more than two thousand years. We buy bold, sorted 12mm black pepper berries, whole sun-dried ginger and finely milled ginger powder, so you get a stronger aroma than most supermarket spices.",
    guides: [{ href: "/learn/masala-chai-recipe", label: "Make masala chai at home" }],
    faqs: [
      { q: "What does 12mm bold black pepper mean?", a: "The berries are graded by size. 12mm bold is one of the largest grades, which usually means fuller, more aromatic peppercorns with more of the oils that give pepper its heat." },
      { q: "Whole spices or ground?", a: "Whole spices keep their flavour for much longer. Grind pepper just before using it. Ginger powder is handy for baking, rubs and drinks when you want it to blend in smoothly." },
      { q: "How do I use dried whole ginger?", a: "Crack or grate it into chai, soups, stocks and braises, or simmer it in water for a ginger infusion. It is stronger than fresh ginger, so start with a small piece." },
      { q: "How long do spices keep?", a: "Whole spices keep their best flavour for 2 to 3 years when sealed and kept away from heat and light. Ground spices are best within about a year." },
    ],
  },
  {
    slug: "nuts-snacks",
    title: "Makhana (Fox Nuts) & Almonds: Healthy Indian Snacks",
    description: "Premium makhana (fox nuts, lotus seeds) from Bihar and hand-picked almonds. A crunchy, light snack you can roast at home in minutes. Shipped from Bengaluru.",
    h1: "Makhana and nuts for everyday snacking",
    intro: "Makhana, also called fox nuts or popped lotus seeds, is one of India's favourite light snacks: crisp, airy and ready for any seasoning in a few minutes in a pan. Next to it you will find hand-picked almonds, sorted for size and freshness.",
    guides: [{ href: "/learn/what-is-makhana", label: "What is makhana? (and how to roast it)" }],
    faqs: [
      { q: "What is makhana?", a: "Makhana are the seeds of the prickly water lily (Euryale ferox), harvested from ponds, mainly in Bihar, then roasted and popped. They are crunchy and mild, a bit like a light popcorn." },
      { q: "How do I roast makhana?", a: "Warm a teaspoon of ghee or oil in a pan, add 2 cups of makhana and stir on low heat for 6 to 8 minutes until they snap when pressed. Season with salt, pepper or any spice mix while warm." },
      { q: "Is makhana the same as lotus seeds?", a: "They are often called lotus seeds, but makhana comes from a different water plant. Both are eaten in India; makhana is the puffed, white snack you see here." },
      { q: "How do I keep makhana crunchy?", a: "Keep the pack tightly sealed. If they soften, a few minutes in a dry pan or a low oven brings the crunch back." },
    ],
  },
  {
    slug: "honey-ghee",
    title: "Raw Honey & Gir Cow Ghee from India",
    description: "Raw, unfiltered honey and traditional Gir cow ghee made by the bilona method in Gujarat. Rich flavour for cooking, baking and your morning tea. Ships worldwide.",
    h1: "Raw honey and Gir cow ghee",
    intro: "Two staples of the Indian kitchen. Our honey is raw and unfiltered, so it may crystallise naturally over time. Our ghee is made from the milk of Gir cows in Gujarat by the traditional bilona method: curd is churned into butter, then slowly simmered until golden and nutty.",
    guides: [{ href: "/learn/gir-cow-ghee-guide", label: "Gir cow ghee: what it is and how to use it" }],
    faqs: [
      { q: "Why has my honey crystallised?", a: "Crystallising is natural for raw honey and does not mean it has spoiled. Stand the jar in warm (not hot) water and stir until it turns liquid again." },
      { q: "What is bilona ghee?", a: "Bilona is the traditional method: whole milk is set as curd, hand-churned into butter, and the butter is slowly simmered into ghee. It takes longer than making ghee from cream, and gives a deeper, nutty flavour." },
      { q: "Does ghee need to be refrigerated?", a: "No. Kept sealed and away from water, ghee keeps at room temperature for months. Always use a clean, dry spoon." },
      { q: "What can I cook with ghee?", a: "Use it anywhere you would use butter or oil: tempering spices, roasting vegetables, frying eggs, on rice or toast, or a spoonful in dal. It has a high smoke point, so it suits high-heat cooking." },
    ],
  },
];

export const shelfBySlug = (slug: string) => SHELVES.find((s) => s.slug === slug);
