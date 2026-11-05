import type { MarketCode } from "@/lib/market";

/**
 * Search landing pages for the United States (/us/<slug>) and Canada (/ca/<slug>). One entry = one page in each market.
 *
 * COPY RULES (legal, see lib/market.ts): no "organic" wording, no health or disease claims, nothing invented —
 * product facts here (origin, ingredients, diet tags, brewing figures) are the ones stored on the product in the API.
 * Pack sizes and prices are never written here; the page reads them live from the API.
 */
export type Topic = {
  /** URL segment: /us/<slug> and /ca/<slug>. */
  slug: string;
  /** Product slug(s) in the catalogue API. */
  productSlugs: string[];
  /** Short name for cards, breadcrumbs and "related" links. */
  label: string;
  /** One line for the hub cards. */
  teaser: string;
  /** Closest page on the global site (x-default hreflang target). */
  globalHref: string;
  /** Local photo used for hub cards, the hero fallback and social sharing. */
  image: string;
  meta: Record<MarketCode, { title: string; description: string }>;
  h1: string;
  intro: string;
  body: { heading: string; text: string }[];
  guide: { title: string; rows: { label: string; value: string }[]; steps: string[] };
  faqs: { q: string; a: string }[];
  /** Sibling topic slugs to link to. */
  related: string[];
};

export const TOPICS: Topic[] = [
  {
    slug: "white-tea",
    productSlugs: ["silver-needle-white-tea"],
    label: "Silver needle white tea",
    teaser: "Loose leaf white tea made from unopened buds. Pale, soft and naturally low in caffeine.",
    globalHref: "/products/silver-needle-white-tea",
    image: "/img/white.webp",
    meta: {
      us: { title: "Buy Silver Needle White Tea Online | Xiphias Superfoods", description: "Loose leaf silver needle white tea: pale, soft and naturally low in caffeine. Live US dollar price, a brewing guide in °F and shipping from India." },
      ca: { title: "Silver Needle White Tea in Canada | Xiphias Superfoods", description: "Silver needle white tea, loose leaf: what it is and how to brew it. We do not deliver to Canada yet, so leave your email and we will tell you when." },
    },
    h1: "Silver Needle White Tea, Loose Leaf",
    intro: "The white tea made only from unopened leaf buds: pale gold in the cup, soft, lightly sweet and naturally low in caffeine.",
    body: [
      { heading: "What silver needle is", text: "Silver needle is the style of white tea people usually mean when they talk about the top grade. It is made from the unopened leaf buds of the tea plant, picked before they unfurl and then simply withered and dried. The buds keep a fine silvery down, which is where the name comes from. In the cup it is pale gold, soft and lightly sweet, without the bitterness of a strong black tea." },
      { heading: "Where the style comes from", text: "Silver needle is a white tea style that began in China's Fujian province, where it is made only from unopened leaf buds. Xiphias is a tea and food company based in Bengaluru, India. It is tagged vegan and sugar-free in our catalog, because the only ingredient is tea. Write to us if you would like to know the growing region of the current lot." },
      { heading: "Why temperature matters", text: "White tea is delicate, so water temperature matters more than with other teas. Keep it well below boiling, between 160 and 185°F, and give the buds a few minutes to open. The same leaves can be steeped again, up to three times, which makes a small pack of loose leaf go further than it looks." },
    ],
    guide: {
      title: "How to brew it",
      rows: [
        { label: "Tea", value: "2 g (0.07 oz), about 1 teaspoon, per cup" },
        { label: "Water", value: "1 cup (8 fl oz / 240 ml) at 160–185°F (71–85°C)" },
        { label: "Time", value: "3–4 minutes" },
        { label: "Re-steep", value: "Up to 3 times" },
      ],
      steps: ["Boil fresh water, then let it stand for a couple of minutes so it drops into the 160–185°F range.", "Add one teaspoon of buds for each cup and pour the water over them.", "Steep for 3–4 minutes and strain. Keep the leaves for a second and third cup."],
    },
    faqs: [
      { q: "What does silver needle white tea taste like?", a: "Light, soft and slightly sweet, with a gentle floral and hay-like aroma. Brewed below boiling it has no bitterness, which is why it is usually drunk plain, without milk or sugar." },
      { q: "How much caffeine is in silver needle white tea?", a: "It is naturally low in caffeine. We do not publish a milligram figure, because the amount in your cup changes with the water temperature and how long you steep." },
      { q: "Where is this white tea grown?", a: "Silver needle as a style comes from China's Fujian province. Xiphias is based in Bengaluru, India; contact us for the growing region of the current lot." },
      { q: "How should I store loose leaf white tea?", a: "Keep it sealed in a cool, dry place away from sunlight and strong smells, and use it within the shelf life printed on the pack." },
    ],
    related: ["butterfly-pea-tea", "masala-chai", "makhana"],
  },
  {
    slug: "black-rice",
    productSlugs: ["organic-black-rice"],
    label: "Black rice (forbidden rice)",
    teaser: "Whole grain black rice, also sold as forbidden rice. Nutty, chewy and deep purple once cooked.",
    globalHref: "/products/organic-black-rice",
    image: "/img/rice.webp",
    meta: {
      us: { title: "Buy Black Rice (Forbidden Rice) Online | Xiphias Superfoods", description: "Black rice, also called forbidden rice: nutty, chewy and deep purple when cooked. Live US dollar price, a cooking guide in cups and shipping from India." },
      ca: { title: "Black Rice (Forbidden Rice) in Canada | Xiphias Superfoods", description: "Black rice, also called forbidden rice: what it is and how to cook it. We do not deliver to Canada yet, so leave your email and we will tell you when." },
    },
    h1: "Black Rice (Forbidden Rice)",
    intro: "A whole grain rice with a black bran layer that cooks to a glossy dark purple, with a nutty taste and a pleasant chew.",
    body: [
      { heading: "One rice, several names", text: "Black rice goes by a few names in American kitchens: forbidden rice, emperor's rice, purple rice. The story behind the first two is that it was once reserved for the emperor and the aristocracy. Whatever you call it, it is a whole grain rice with a deep black bran layer that turns a glossy dark purple when cooked." },
      { heading: "Color and flavor", text: "The color comes from anthocyanins, the same family of pigments that makes blueberries and purple cabbage dark. The flavor is nutty and faintly sweet, and the texture stays chewy, closer to brown rice than to white. It holds its shape well, which makes it a good base for grain bowls, salads and stir-fries, and it makes a striking rice pudding with coconut milk." },
      { heading: "What to expect in the kitchen", text: "Our black rice is sourced from India and is tagged vegan and gluten-free in our catalog. Because the bran is left on, it needs more water and more time than white rice: plan on about half an hour on the stove, or use the brown rice setting on a rice cooker. The cooking water turns purple, which is normal, and it will tint anything cooked alongside it." },
    ],
    guide: {
      title: "How to cook it",
      rows: [
        { label: "Rice", value: "1 cup (about 7 oz / 200 g), rinsed" },
        { label: "Water", value: "1¾–2 cups (14–16 fl oz / 415–475 ml)" },
        { label: "Simmer", value: "30–35 minutes, covered, on low heat" },
        { label: "Rest", value: "10 minutes off the heat, lid on" },
      ],
      steps: ["Rinse the rice under cold water until the water runs mostly clear.", "Bring the rice and water to a boil with a pinch of salt, then cover and turn the heat to low.", "Simmer for 30–35 minutes until the water is absorbed, rest for 10 minutes and fluff with a fork."],
    },
    faqs: [
      { q: "Is forbidden rice the same as black rice?", a: "Yes. Forbidden rice and emperor's rice are traditional names for black rice. Some stores also label it purple rice because of the color it turns when cooked." },
      { q: "What does black rice taste like?", a: "Nutty and slightly sweet, with a chewy texture similar to brown rice. It works in both savory dishes and desserts." },
      { q: "Do I need to soak black rice before cooking?", a: "No. Soaking for 30–60 minutes is optional and shortens the cooking time by a few minutes; a rinse is enough for everyday cooking." },
      { q: "Is black rice gluten-free?", a: "Rice is a naturally gluten-free grain, and this product is tagged gluten-free and vegan in our catalog. The only ingredient is rice." },
    ],
    related: ["makhana", "black-pepper", "ghee"],
  },
  {
    slug: "makhana",
    productSlugs: ["premium-makhana-fox-nuts"],
    label: "Makhana (fox nuts)",
    teaser: "Popped water lily seeds from Bihar, also sold as fox nuts or popped lotus seeds. Light and crunchy.",
    globalHref: "/products/premium-makhana-fox-nuts",
    image: "/img/makhana.webp",
    meta: {
      us: { title: "Buy Makhana (Fox Nuts) Online | Xiphias Superfoods", description: "Makhana from Bihar, also sold as fox nuts or popped lotus seeds: a light, crunchy snack. Live US dollar price, a roasting guide and shipping from India." },
      ca: { title: "Makhana (Fox Nuts) in Canada | Xiphias Superfoods", description: "Makhana, also sold as fox nuts or popped lotus seeds: what it is and how to roast it. We do not deliver to Canada yet, so leave your email for an update." },
    },
    h1: "Makhana (Fox Nuts)",
    intro: "Popped water lily seeds from the ponds of Bihar: light, mild, crunchy once roasted, and ready for any seasoning you like.",
    body: [
      { heading: "Makhana, fox nuts, popped lotus seeds", text: "Makhana is the Hindi name for the popped seeds of a water lily that grows in still ponds. In the US the same snack is sold as fox nuts, popped lotus seeds or water lily seeds. The seeds are gathered from the pond, dried, then roasted and popped, a little like popcorn, into light off-white puffs with a mild, neutral taste." },
      { heading: "Where ours comes from", text: "Ours comes from the ponds of Bihar, the state in eastern India that is best known for makhana. It is tagged vegan and gluten-free in our catalog and has no additives, preservatives or artificial flavors, so the seasoning is up to you." },
      { heading: "How people eat it", text: "A few minutes in a dry skillet makes makhana properly crunchy, and from there it takes on whatever you toss it with: ghee and sea salt, black pepper, chili and lime, or cinnamon and a little sugar. Indian cooks also simmer it in curries and in kheer, a milk pudding, where it soaks up the sauce. Keep the bag tightly sealed after opening, because the puffs pick up moisture from the air and lose their snap." },
    ],
    guide: {
      title: "How to roast it",
      rows: [
        { label: "Makhana", value: "1 oz (28 g) per person, a generous handful" },
        { label: "Fat", value: "1 teaspoon of ghee or oil, optional" },
        { label: "Heat", value: "Medium-low, in a wide skillet" },
        { label: "Time", value: "5–7 minutes, stirring often" },
      ],
      steps: ["Warm a wide skillet over medium-low heat and add the makhana in a single layer.", "Stir for 5–7 minutes. Test one: it should snap cleanly instead of squashing.", "Turn off the heat, add the ghee or oil, salt and spices, and toss while the pan is still warm."],
    },
    faqs: [
      { q: "Are fox nuts and makhana the same thing?", a: "Yes. Makhana is the Hindi name, and fox nuts is the name most often used in English. You will also see it called phool makhana." },
      { q: "Is makhana the same as lotus seeds?", a: "It is often sold as popped lotus seeds, but it comes from the prickly water lily (Euryale ferox), a relative of the lotus and not the lotus itself." },
      { q: "What does makhana taste like?", a: "Very mild and slightly nutty, with a texture between popcorn and a rice cake. Most of the flavor comes from what you season it with." },
      { q: "How do I keep makhana crunchy?", a: "Store it in a sealed bag or airtight jar in a cool, dry place. If it softens, a few minutes in a dry skillet brings the crunch back." },
    ],
    related: ["ghee", "black-rice", "masala-chai"],
  },
  {
    slug: "ghee",
    productSlugs: ["premium-gir-cow-ghee"],
    label: "Gir cow ghee (bilona)",
    teaser: "Clarified butter from the milk of Gir cows, made by the traditional bilona method. Labeled A2.",
    globalHref: "/products/premium-gir-cow-ghee",
    image: "/img/ghee.webp",
    meta: {
      us: { title: "Buy Gir Cow Ghee (Bilona) Online | Xiphias Superfoods", description: "Gir cow ghee made by the traditional bilona method and labeled A2. See the live US dollar price, how bilona ghee is made, and shipping from India." },
      ca: { title: "Gir Cow Ghee (Bilona) in Canada | Xiphias Superfoods", description: "Gir cow ghee made by the traditional bilona method and labeled A2. We do not deliver to Canada yet, so leave your email and we will tell you when." },
    },
    h1: "Gir Cow Ghee, Bilona Method",
    intro: "Traditional clarified butter from the milk of indigenous Gir cows of Gujarat, made by the bilona method and labeled A2.",
    body: [
      { heading: "What ghee is", text: "Ghee is butter that has been simmered until the water cooks off and the milk solids brown and are strained out, leaving a clear golden cooking fat with a nutty aroma. This one is made from the milk of Gir cows, a breed native to the Gir region of Gujarat in western India." },
      { heading: "What bilona means", text: "Bilona is the traditional way of making ghee. The milk is first set into curd, the curd is churned to separate cultured butter (a bilona is the wooden churner), and that butter is slowly heated into ghee. It is slower and more labor-intensive than making ghee from cream, which is why bilona ghee usually costs more than regular ghee." },
      { heading: "A2 and how to use it", text: "In our catalog this ghee carries the A2 label, a term used for the milk of native Indian cattle breeds such as Gir. Use it wherever you would use butter or oil: for searing, frying eggs, roasting vegetables, tempering spices for dal, or stirring into hot rice. Ghee is solid or grainy when cool and liquid when warm. Both are normal and do not change how it cooks." },
    ],
    guide: {
      title: "Cooking with ghee",
      rows: [
        { label: "Measure", value: "1 tablespoon = ½ fl oz (15 ml)" },
        { label: "Swap", value: "Use the same amount as the butter or oil in a recipe" },
        { label: "Spoon", value: "Always clean and dry; water shortens its life" },
        { label: "Store", value: "Cool, dry place away from sunlight" },
      ],
      steps: ["For eggs or vegetables, melt 1–2 teaspoons in the pan before adding the food.", "For dal, heat 1 tablespoon, add cumin or mustard seeds until they crackle, and pour it over the pot.", "For rice or flatbread, stir or brush on about ½ teaspoon per serving while hot."],
    },
    faqs: [
      { q: "What is bilona ghee?", a: "Ghee made the traditional way: milk is set into curd, the curd is churned into butter with a wooden churner called a bilona, and the butter is slowly heated into ghee." },
      { q: "What does A2 ghee mean?", a: "A2 is a label used for the milk of native Indian cattle breeds such as Gir. This ghee is made from Gir cow milk and is labeled A2 in our catalog." },
      { q: "Is ghee the same as clarified butter?", a: "Very close. Ghee is cooked a little longer, until the milk solids toast before they are strained out, which gives it a deeper, nuttier flavor." },
      { q: "How should I store ghee?", a: "The storage guidance for this product is a cool, dry place away from sunlight. Use a clean, dry spoon every time and finish it within the shelf life printed on the pack." },
    ],
    related: ["makhana", "black-pepper", "black-rice"],
  },
  {
    slug: "butterfly-pea-tea",
    productSlugs: ["premium-organic-blue-pea-tea"],
    label: "Butterfly pea flower tea",
    teaser: "The caffeine-free blue tea that turns purple with a squeeze of lemon.",
    globalHref: "/products/premium-organic-blue-pea-tea",
    image: "/img/bluepea.webp",
    meta: {
      us: { title: "Buy Butterfly Pea Flower Tea Online | Xiphias Superfoods", description: "Butterfly pea flower tea, the caffeine-free blue tea that turns purple with lemon. Live US dollar price, brewing guide in °F and shipping from India." },
      ca: { title: "Butterfly Pea Flower Tea in Canada | Xiphias Superfoods", description: "Butterfly pea flower tea, the caffeine-free blue tea that turns purple with lemon. We do not deliver to Canada yet, so leave your email for an update." },
    },
    h1: "Butterfly Pea Flower Tea (Blue Tea)",
    intro: "A caffeine-free herbal tea that brews a vivid indigo blue and shifts to purple when you add lemon or lime.",
    body: [
      { heading: "What blue tea is", text: "Butterfly pea flower tea is an herbal tea made from the blue blossoms of the butterfly pea vine (Clitoria ternatea). Steeped in hot water it turns the cup a vivid indigo, which is why it is also sold as blue tea or blue pea tea. There are no tea leaves in it, so it is naturally caffeine-free." },
      { heading: "The color change", text: "The taste is mild and earthy, so most of the fun is in the color. Add a squeeze of lemon or lime and the blue shifts to purple and then pink as the drink becomes more acidic. That makes it a favorite for iced teas, lemonades, layered mocktails and cocktails, and for tinting rice, noodles or frosting without artificial coloring." },
      { heading: "About this tea", text: "Our blue pea tea is sourced from India and is tagged caffeine-free, vegan and sugar-free in our catalog. Brew it hot the way you would any herbal tea, or make a stronger batch and pour it over ice. For the deepest blue, serve it in a clear glass and add the citrus at the table so everyone sees the change." },
    ],
    guide: {
      title: "How to brew it",
      rows: [
        { label: "Tea", value: "2 g (0.07 oz), about 1 teaspoon, per cup" },
        { label: "Water", value: "1 cup (8 fl oz / 240 ml) at 176–194°F (80–90°C)" },
        { label: "Time", value: "3–4 minutes" },
        { label: "Re-steep", value: "Up to 3 times" },
      ],
      steps: ["Heat fresh water until it is steaming but not at a rolling boil, about 176–194°F.", "Add one teaspoon per cup, pour the water over and steep for 3–4 minutes.", "Strain. Drink it blue, or add lemon or lime juice and watch it turn purple. For iced tea, double the tea and pour over ice."],
    },
    faqs: [
      { q: "Does butterfly pea flower tea have caffeine?", a: "No. It is an herbal tea made from flowers, with no tea leaves, and it is tagged caffeine-free in our catalog." },
      { q: "Why does blue tea change color with lemon?", a: "The blue pigments in the flowers react to acidity. Citrus juice lowers the pH of the drink, which shifts the color from blue to purple and pink." },
      { q: "What does butterfly pea tea taste like?", a: "Mild, earthy and slightly woody. It is usually flavored with lemon, honey, mint or ginger, or used mainly for its color." },
      { q: "Can I use it for iced tea and cocktails?", a: "Yes. Brew it at double strength, let it cool and pour it over ice. Add the citrus or tonic last to get the color change in the glass." },
    ],
    related: ["white-tea", "masala-chai", "makhana"],
  },
  {
    slug: "masala-chai",
    productSlugs: ["masala-tea-indian-spiced"],
    label: "Masala chai",
    teaser: "Assam black tea blended with cardamom, cinnamon and clove, for stovetop chai.",
    globalHref: "/products/masala-tea-indian-spiced",
    image: "/img/masala.webp",
    meta: {
      us: { title: "Buy Masala Chai Loose Leaf Tea Online | Xiphias Superfoods", description: "Masala chai loose leaf tea: Assam black tea blended with cardamom, cinnamon and clove. Live US dollar price, a stovetop recipe and shipping from India." },
      ca: { title: "Masala Chai Loose Leaf Tea in Canada | Xiphias Superfoods", description: "Masala chai loose leaf tea: Assam leaf with cardamom, cinnamon and clove. We do not deliver to Canada yet, so leave your email and we will tell you when." },
    },
    h1: "Masala Chai, Loose Leaf",
    intro: "Assam black tea already blended with cardamom, cinnamon and clove, made for simmering on the stove with milk.",
    body: [
      { heading: "What masala chai is", text: "Masala chai simply means spiced tea: strong black tea simmered with whole spices, milk and something sweet. It is what Americans usually order as a chai latte, except that in India it is made on the stove from loose tea and not from a syrup." },
      { heading: "What is in this blend", text: "Our masala tea is an Assam blend with cardamom, cinnamon and clove already mixed in, so you do not need a spice drawer to make a proper cup. Assam black tea is known for a malty, full-bodied character that holds up against milk and sugar, and the three spices bring warmth and a sweet aroma without any chili heat." },
      { heading: "Milk, sweetener and caffeine", text: "It is tagged vegan and sugar-free in our catalog: the blend is tea and spices only, and you choose the milk and the sweetener. Dairy milk gives the classic taste, and oat milk is the plant milk that stands up best to simmering. You can also brew it plain with hot water as a spiced black tea. Like any black tea, it contains caffeine." },
    ],
    guide: {
      title: "Stovetop chai for one mug",
      rows: [
        { label: "Tea", value: "2 teaspoons (about 4 g / 0.14 oz)" },
        { label: "Water", value: "½ cup (4 fl oz / 120 ml)" },
        { label: "Milk", value: "½ cup (4 fl oz / 120 ml)" },
        { label: "Plain brew", value: "1 teaspoon per cup at 176–194°F (80–90°C), 3–4 minutes" },
      ],
      steps: ["Bring the water to a boil in a small saucepan, add the tea and simmer for 2–3 minutes.", "Add the milk and bring it back to a gentle simmer for another 2–3 minutes.", "Strain into a mug and sweeten to taste."],
    },
    faqs: [
      { q: "Is masala chai the same as chai tea?", a: "Chai is the Hindi word for tea, and masala means spice mix. What US coffee shops call chai tea or a chai latte is masala chai." },
      { q: "Which spices are in this masala chai?", a: "Cardamom, cinnamon and clove, blended with Assam black tea leaf." },
      { q: "Does masala chai have caffeine?", a: "Yes. It is made with black tea, so it contains caffeine. We do not publish a milligram figure because it depends on how long you simmer it." },
      { q: "Is the blend sweetened?", a: "No. It is tagged sugar-free in our catalog and contains only tea and spices, so you add the sweetener and milk you prefer." },
    ],
    related: ["white-tea", "butterfly-pea-tea", "black-pepper"],
  },
  {
    slug: "black-pepper",
    productSlugs: ["premium-12mm-bold-black-pepper"],
    label: "Malabar black peppercorns",
    teaser: "Whole black peppercorns from the Malabar coast of Kerala, graded bold, in large packs.",
    globalHref: "/products/premium-12mm-bold-black-pepper",
    image: "/img/pepper.webp",
    meta: {
      us: { title: "Buy Malabar Black Peppercorns Online | Xiphias Superfoods", description: "Whole black peppercorns from the Malabar coast of Kerala, graded bold. See the live US dollar price, how to toast and grind them, and shipping from India." },
      ca: { title: "Malabar Black Peppercorns in Canada | Xiphias Superfoods", description: "Whole black peppercorns from the Malabar coast of Kerala, graded bold. We do not deliver to Canada yet, so leave your email and we will tell you when." },
    },
    h1: "Whole Black Peppercorns from Malabar",
    intro: "Bold-grade whole black peppercorns from the Malabar coast of Kerala, for the grinder, the stockpot and the spice shelf.",
    body: [
      { heading: "Why Malabar", text: "Black pepper is native to the Malabar coast of Kerala in southwest India, and for centuries Malabar was the name spice buyers asked for. These are whole black peppercorns from that coast: the berries of the pepper vine, picked and dried until the outer layer turns dark and wrinkled." },
      { heading: "What bold means", text: "This pepper is graded bold, the trade word for larger, heavier peppercorns. Bigger berries are easy to crack in a mill and give a coarse, aromatic grind that is piney and a little citrusy, with a heat that builds slowly. Whole peppercorns keep their aroma far longer than ground pepper, so the best habit is to fill a grinder and grind as you cook." },
      { heading: "Ways to use whole peppercorns", text: "Beyond the grinder, use them whole in stocks, brines, pickles and biryani, or crack them roughly for steak au poivre and cacio e pepe. Toasting them in a dry pan for a minute before grinding wakes up the aroma. The packs are large, so this pepper suits people who cook a lot, share with family or refill several grinders. It is tagged vegan in our catalog, and the only ingredient is pepper." },
    ],
    guide: {
      title: "Getting the most from whole pepper",
      rows: [
        { label: "Measure", value: "1 tablespoon whole is roughly ¼ oz (7–8 g)" },
        { label: "Toast", value: "1–2 minutes in a dry skillet over medium heat" },
        { label: "Whole", value: "8–10 peppercorns per quart (about 1 liter) of stock or brine" },
        { label: "Store", value: "Airtight, in a cool, dry place away from sunlight" },
      ],
      steps: ["Fill your grinder and reseal the rest of the pack straight away.", "For the fullest aroma, toast the peppercorns until fragrant, cool them, then grind.", "Grind coarse for steaks and salads and fine for sauces and soups, always just before serving."],
    },
    faqs: [
      { q: "What is Malabar black pepper?", a: "Black pepper grown on the Malabar coast of Kerala in southwest India, the region where the pepper vine is native. The origin recorded for this product is Malabar, Kerala." },
      { q: "What does bold mean on black pepper?", a: "Bold is a grade name used in the pepper trade for larger, heavier peppercorns." },
      { q: "Is whole pepper better than ground pepper?", a: "Whole peppercorns hold their aroma much longer. Pre-ground pepper loses it quickly once opened, so grinding fresh gives a noticeably stronger flavor." },
      { q: "How should I store whole peppercorns?", a: "In an airtight container in a cool, dry place away from sunlight. Keep the main pack sealed and refill a small grinder as you go." },
    ],
    related: ["ghee", "black-rice", "masala-chai"],
  },
];

export const topicBySlug = (slug: string) => TOPICS.find((t) => t.slug === slug);
/** Landing-page topic that features a given product, if any (used for hreflang on the product page). */
export const topicForProduct = (productSlug: string) => TOPICS.find((t) => t.productSlugs.includes(productSlug));

/** The one market-specific FAQ appended to every topic. */
export const marketFaq = (market: MarketCode): { q: string; a: string } =>
  market === "us"
    ? { q: "Do you ship to the United States?", a: "Yes. Orders to the United States ship from Bengaluru, India by tracked courier. The delivery cost is shown at checkout. US import duties and taxes are not included in our prices; where they apply, the courier collects them before delivery." }
    : { q: "Do you deliver to Canada?", a: "Not yet. We do not take orders for delivery to Canada at the moment. Leave your email on this page and we will write to you when Canadian delivery opens." };
