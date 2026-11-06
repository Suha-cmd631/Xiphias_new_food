/**
 * Learn: brewing and cooking guides written for the searches people actually make ("how to brew white tea",
 * "how to cook black rice", "what is makhana"). Each guide links to the product it is about.
 * Rules for this copy: practical and factual; no medical, cure or weight-loss claims; no "organic" claim
 * (these pages are read in the US, where that word needs a USDA certificate).
 */
export type Guide = {
  slug: string;
  /** <title> (layout adds " | Xiphias Superfoods" when it fits) */
  title: string;
  description: string;
  h1: string;
  kicker: string;
  image: string;
  imageAlt: string;
  minutes: number;
  intro: string;
  /** Products this guide is about (product slugs) */
  products: string[];
  /** Quick facts shown as a card at the top */
  facts: { label: string; value: string }[];
  sections: { heading: string; html: string }[];
  faqs: { q: string; a: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "how-to-brew-white-tea",
    title: "How to Brew Silver Needle White Tea: Temperature & Time",
    description: "Brew Silver Needle white tea at 167–185 °F (75–85 °C), 2–3 g per cup, 3–5 minutes. Hot, re-steeped and cold-brew methods, plus storage tips.",
    h1: "How to brew Silver Needle white tea",
    kicker: "White tea guide",
    image: "/img/white.webp",
    imageAlt: "Silver Needle white tea buds in a wooden bowl beside a cup of pale golden tea",
    minutes: 5,
    intro:
      "Silver Needle is made only from the unopened buds of the tea plant, picked by hand and dried slowly. That makes it the gentlest tea there is to brew: water that is too hot or a steep that is too long is the only real way to get it wrong. Here is the method we use in Bengaluru, in US and metric units.",
    products: ["silver-needle-white-tea"],
    facts: [
      { label: "Water", value: "167–185 °F · 75–85 °C" },
      { label: "Tea", value: "2–3 g per 8 oz (≈2 tsp of buds)" },
      { label: "Steep", value: "3–5 minutes" },
      { label: "Re-steeps", value: "2–3, add a minute each time" },
    ],
    sections: [
      {
        heading: "What you need",
        html: "<ul><li>2–3 g of Silver Needle (about two heaped teaspoons; the buds are fluffy, so a scale is easier)</li><li>8 oz (240 ml) of fresh, filtered water</li><li>A cup, a small teapot or a gaiwan, and a strainer</li></ul>",
      },
      {
        heading: "Hot brew, step by step",
        html: "<ol><li><strong>Heat the water to 167–185 °F (75–85 °C).</strong> No thermometer? Bring it to a boil and let it stand for 3–4 minutes with the lid off.</li><li><strong>Warm the cup or pot</strong> with a splash of hot water and pour it away.</li><li><strong>Add the buds and pour.</strong> Pour gently down the side so the buds are not scalded.</li><li><strong>Steep 3–5 minutes.</strong> Start tasting at 3. The liquor should be pale gold with a soft, honeyed, slightly floral taste.</li><li><strong>Strain and drink plain.</strong> Milk and sugar hide what makes this tea special.</li></ol>",
      },
      {
        heading: "Re-steeping",
        html: "<p>Keep the wet buds and brew them again two or three times, adding about a minute to each steep. Many people find the second cup the best: fuller and sweeter than the first.</p>",
      },
      {
        heading: "Cold brew (iced white tea)",
        html: "<p>Put 5 g of buds in 1 litre (about 34 oz) of cold filtered water, cover and leave in the fridge for 8–12 hours. Strain and keep chilled; drink within two days. Cold brewing gives a smooth, sweet tea with no bitterness at all.</p>",
      },
      {
        heading: "Common mistakes",
        html: "<ul><li><strong>Boiling water</strong> straight on the buds: makes the tea flat and slightly bitter.</li><li><strong>Too little tea:</strong> the buds are light, so measure by weight, not by spoon size.</li><li><strong>Storing near spices or coffee:</strong> white tea picks up smells easily.</li></ul>",
      },
      {
        heading: "Storage",
        html: "<p>Keep the pouch sealed, or move the tea to an airtight, opaque tin, away from heat, light and strong smells. Use it within the best-before date printed on the pack.</p>",
      },
    ],
    faqs: [
      { q: "Does Silver Needle white tea have caffeine?", a: "Yes. All true teas, including white tea, contain caffeine. The amount in a cup varies with how much tea you use, the water temperature and the steep time. If you want none at all, try our butterfly pea flower tea, which is naturally caffeine-free." },
      { q: "Why does my white tea taste weak?", a: "Usually too little tea or water that is too cool. Silver Needle buds are light and bulky, so weigh 2–3 g per cup and steep a full 4–5 minutes at around 180 °F (82 °C)." },
      { q: "Can I add milk or sugar?", a: "You can, but most people drink Silver Needle plain. A little honey is the gentlest addition if you want some sweetness." },
      { q: "How many times can I re-steep it?", a: "Two or three times, adding about a minute each time." },
    ],
  },
  {
    slug: "how-to-cook-black-rice",
    title: "How to Cook Black Rice: Stovetop, Instant Pot & Ratios",
    description: "Cook black rice perfectly: rinse, soak 4 hours, use a 1:2 rice-to-water ratio and simmer 30–35 minutes. Instant Pot timing, uses and storage.",
    h1: "How to cook black rice",
    kicker: "Black rice guide",
    image: "/img/rice.webp",
    imageAlt: "Uncooked black rice in a wooden bowl with a wooden spoon",
    minutes: 6,
    intro:
      "Black rice is a whole-grain rice with its bran left on, which is where its deep purple-black colour comes from. Because the bran is intact it needs more water and more time than white rice, and a short soak makes a real difference. Cooked well, it is nutty, slightly sweet and pleasantly chewy, and every grain stays separate.",
    products: ["organic-black-rice"],
    facts: [
      { label: "Soak", value: "4 hours (or overnight)" },
      { label: "Ratio", value: "1 cup rice : 2 cups water" },
      { label: "Simmer", value: "30–35 min (45 unsoaked)" },
      { label: "Yield", value: "1 cup dry ≈ 3 cups cooked" },
    ],
    sections: [
      {
        heading: "Stovetop method",
        html: "<ol><li><strong>Rinse</strong> 1 cup of black rice in cold water two or three times. The water will turn purple: that is the natural pigment in the bran, not dye.</li><li><strong>Soak</strong> for 4 hours or overnight, then drain. (Short on time? Skip it and add 10 minutes of cooking and ¼ cup more water.)</li><li><strong>Combine</strong> the rice with 2 cups of water and a pinch of salt in a heavy pot. Bring to a boil.</li><li><strong>Cover and simmer</strong> on the lowest heat for 30–35 minutes, until the water is absorbed.</li><li><strong>Rest</strong> off the heat, lid on, for 10 minutes, then fluff with a fork.</li></ol>",
      },
      {
        heading: "Instant Pot or pressure cooker",
        html: "<p><strong>Instant Pot:</strong> rinsed (unsoaked) rice with water at 1 : 1¾, high pressure for 22 minutes, then let the pressure release naturally for 10 minutes.</p><p><strong>Indian pressure cooker:</strong> soaked rice with water at 1 : 2, cook on medium heat for 4–5 whistles, then let the pressure drop on its own.</p>",
      },
      {
        heading: "Ways to use it",
        html: "<ul><li><strong>Grain bowls:</strong> with roasted vegetables, a soft egg and a sesame dressing.</li><li><strong>Salads:</strong> cooled black rice holds its shape and colour; try it with mango, cucumber and lime.</li><li><strong>Black rice pudding:</strong> simmer cooked rice with milk or coconut milk, a little jaggery and cardamom, as it is made in north-east India.</li><li><strong>Half and half:</strong> mix with white or brown rice for colour on any plate.</li></ul>",
      },
      {
        heading: "Storage",
        html: "<p>Keep uncooked rice in an airtight container in a cool, dry cupboard. Cooked rice keeps for 3–4 days in the fridge; cool it quickly and reheat until steaming hot.</p>",
      },
    ],
    faqs: [
      { q: "Do I have to soak black rice?", a: "No, but soaking for 4 hours makes the texture more even and cuts the cooking time to about 30–35 minutes. Unsoaked rice needs around 45 minutes and a little more water." },
      { q: "Why is the cooking water purple?", a: "The colour comes from natural pigments (anthocyanins) in the bran. It is normal and washes off pans and hands." },
      { q: "Is black rice the same as wild rice?", a: "No. Wild rice is the seed of a different, aquatic grass. Black rice is a true rice (Oryza sativa) with a dark bran layer." },
      { q: "Is black rice gluten-free?", a: "Rice is naturally gluten-free. If you need to avoid gluten strictly, check the pack for allergen information on the facility where it was packed." },
    ],
  },
  {
    slug: "what-is-makhana",
    title: "What Is Makhana (Fox Nuts)? How to Roast & Eat Them",
    description: "Makhana are the popped seeds of a water lily grown in Bihar's ponds. What they taste like, how to roast them in 5 minutes, seasoning ideas and storage.",
    h1: "What is makhana, and how do you eat it?",
    kicker: "Makhana guide",
    image: "/img/makhana.webp",
    imageAlt: "White popped makhana fox nuts in a wooden bowl",
    minutes: 5,
    intro:
      "Makhana, also sold as fox nuts or lotus seeds, are the seeds of the prickly water lily (Euryale ferox). Farmers gather them from the bottom of shallow ponds, dry them, then roast and pop them by hand. Most of India's makhana comes from the Mithila region of Bihar. The result is a light, airy snack that tastes mild and slightly nutty, a blank canvas for any seasoning.",
    products: ["premium-makhana-fox-nuts"],
    facts: [
      { label: "Also called", value: "Fox nuts, lotus seeds, phool makhana" },
      { label: "From", value: "Ponds of Bihar, India" },
      { label: "Roast", value: "5–8 min on low heat" },
      { label: "Taste", value: "Mild, nutty, very crunchy" },
    ],
    sections: [
      {
        heading: "How makhana is made",
        html: "<p>The seeds ripen underwater in late summer. Farmers wade into the ponds to collect them, wash and sun-dry them, then roast them in hot iron pans and strike them so the hard shell cracks and the white kernel pops out. It is skilled, slow handwork, which is why good makhana is never the cheapest snack on the shelf.</p>",
      },
      {
        heading: "How to roast makhana (5 minutes)",
        html: "<ol><li>Warm 1 teaspoon of ghee or oil in a wide pan on low heat.</li><li>Add 2 cups of makhana and stir every 30 seconds for 5–8 minutes.</li><li>Test one: it should crush with a crisp snap, not stick to your teeth.</li><li>Take off the heat and toss with seasoning while warm.</li></ol>",
      },
      {
        heading: "Seasoning ideas",
        html: "<ul><li><strong>Classic:</strong> salt, black pepper and a pinch of turmeric.</li><li><strong>Peri-peri:</strong> chilli flakes, garlic powder, a squeeze of lime.</li><li><strong>Sweet:</strong> melted jaggery or honey with cinnamon, cooled until it sets.</li><li><strong>Cheesy:</strong> nutritional yeast or parmesan with smoked paprika.</li></ul>",
      },
      {
        heading: "Other ways to use makhana",
        html: "<p>Simmer them in milk with cardamom for makhana kheer, add them to curries where they soak up the sauce, or grind roasted makhana into a coarse flour for coating.</p>",
      },
      {
        heading: "Storage",
        html: "<p>Keep makhana in an airtight jar; it softens quickly in humid air. If it loses its crunch, dry-roast it for 2–3 minutes and it will crisp up again.</p>",
      },
    ],
    faqs: [
      { q: "Are makhana and lotus seeds the same?", a: "They are often sold under both names, but makhana comes from the prickly water lily (Euryale ferox), not the sacred lotus. 'Fox nuts' is the usual English name." },
      { q: "Can I eat makhana without roasting?", a: "Yes, they are already popped and edible from the pack, but a quick roast makes them much crunchier." },
      { q: "Is makhana gluten-free?", a: "Makhana are seeds, not grains, so they contain no gluten. Check the pack for packing-facility allergen information if you need to be strict." },
      { q: "How do I keep makhana crunchy?", a: "Store it airtight and away from humidity; re-crisp soft makhana in a dry pan for 2–3 minutes." },
    ],
  },
  {
    slug: "butterfly-pea-flower-tea",
    title: "Butterfly Pea Flower Tea: How to Brew the Blue Tea",
    description: "How to brew butterfly pea flower tea: 5 flowers per cup, near-boiling water, 5 minutes. Why it turns purple with lemon, iced and latte recipes. Caffeine-free.",
    h1: "Butterfly pea flower tea: how to brew the blue tea",
    kicker: "Blue tea guide",
    image: "/img/bluepea.webp",
    imageAlt: "Dried butterfly pea flowers beside a cup of deep blue tea",
    minutes: 4,
    intro:
      "Butterfly pea (Clitoria ternatea) is a climbing vine whose deep blue flowers are dried and brewed into a naturally caffeine-free herbal tea. The cup is a vivid sapphire blue with a mild, woody, slightly earthy taste, and it changes colour when you add something acidic. It is a favourite for evening tea, iced drinks and colourful cooking.",
    products: ["premium-organic-blue-pea-tea"],
    facts: [
      { label: "Flowers", value: "5–6 per cup (≈1 tsp)" },
      { label: "Water", value: "195–212 °F · 90–100 °C" },
      { label: "Steep", value: "5 minutes" },
      { label: "Caffeine", value: "None (herbal)" },
    ],
    sections: [
      {
        heading: "Hot brew",
        html: "<ol><li>Put 5–6 dried flowers (about a teaspoon) in a cup.</li><li>Pour over 8 oz (240 ml) of just-boiled water.</li><li>Steep 5 minutes, until the colour is deep blue, then strain.</li><li>Sweeten with honey if you like, and add lemon at the table to watch it turn purple.</li></ol>",
      },
      {
        heading: "Why it changes colour",
        html: "<p>The blue comes from natural plant pigments that react to acidity. Add lemon or lime juice and the tea shifts from blue to violet and pink; add more and it goes magenta. Nothing is added to the tea to make this happen.</p>",
      },
      {
        heading: "Iced blue lemonade",
        html: "<p>Brew a strong concentrate (10 flowers in 1 cup of hot water, 10 minutes), cool it, and pour it slowly over a glass of ice and lemonade so it layers blue on yellow before you stir.</p>",
      },
      {
        heading: "Blue latte",
        html: "<p>Steep 6 flowers in ½ cup of hot water for 5 minutes, strain, and top with ½ cup of steamed milk or oat milk and a little honey.</p>",
      },
      {
        heading: "Storage",
        html: "<p>Keep the flowers sealed, dry and out of direct sunlight, which fades the colour. Use within the best-before date on the pack.</p>",
      },
    ],
    faqs: [
      { q: "Does butterfly pea tea have caffeine?", a: "No. It is a herbal tea made from flowers, not from the tea plant, so it is naturally caffeine-free." },
      { q: "What does butterfly pea tea taste like?", a: "Mild, woody and slightly earthy, a little like a light green tea without the bitterness. Most people add honey, lemon, ginger or lemongrass." },
      { q: "Why did my tea turn purple?", a: "Something acidic touched it, usually lemon or lime. The pigments in the flower change colour with acidity." },
      { q: "Is it safe for everyone?", a: "It is widely drunk as a herbal tea. If you are pregnant, breastfeeding or taking medication, check with your doctor before adding any new herbal tea to your routine." },
    ],
  },
  {
    slug: "masala-chai-recipe",
    title: "Authentic Masala Chai Recipe (Stovetop, 10 Minutes)",
    description: "Make real Indian masala chai at home in 10 minutes: tea, water, milk and spices simmered on the stove. Ratios for 1 or 4 cups, dairy-free option.",
    h1: "How to make masala chai at home",
    kicker: "Masala chai recipe",
    image: "/img/masala.webp",
    imageAlt: "Masala chai tea leaves with cinnamon, cardamom and cloves in a wooden bowl",
    minutes: 4,
    intro:
      "In India, chai is not steeped, it is cooked. Black tea and whole spices simmer in water, milk goes in, and the pot is brought up to a foaming boil a couple of times before it is strained into cups. Our Masala Tea already blends strong Assam leaf with cardamom, cinnamon and clove, so all you add is milk and sweetener.",
    products: ["masala-tea-indian-spiced"],
    facts: [
      { label: "Per cup", value: "2 tsp masala tea" },
      { label: "Liquid", value: "½ cup water + ½ cup milk" },
      { label: "Time", value: "8–10 minutes" },
      { label: "Serves", value: "1 (multiply freely)" },
    ],
    sections: [
      {
        heading: "Ingredients (1 large cup)",
        html: "<ul><li>½ cup (120 ml) water</li><li>2 teaspoons Masala Tea</li><li>½ cup (120 ml) whole milk, or oat milk</li><li>1–2 teaspoons sugar or jaggery, to taste</li><li>Optional: 2 thin slices of fresh ginger</li></ul>",
      },
      {
        heading: "Method",
        html: "<ol><li><strong>Boil the water</strong> in a small saucepan with the ginger, if using.</li><li><strong>Add the tea</strong> and simmer for 2 minutes until the water is dark and fragrant.</li><li><strong>Add milk and sugar.</strong> Bring back to a boil; when it foams up, lower the heat.</li><li><strong>Let it rise twice more</strong> over 3–4 minutes. This is what gives chai its body.</li><li><strong>Strain</strong> into cups and serve hot.</li></ol>",
      },
      {
        heading: "For four cups",
        html: "<p>2 cups water, 8 teaspoons Masala Tea, 2 cups milk, sugar to taste. Same method, simmering a minute or two longer.</p>",
      },
      {
        heading: "Make it your way",
        html: "<ul><li><strong>Stronger:</strong> add another teaspoon of tea rather than steeping longer, which makes it bitter.</li><li><strong>Dairy-free:</strong> oat milk foams and thickens best; add it at the end and heat without a hard boil.</li><li><strong>Iced chai:</strong> make it double-strength, cool, and pour over ice.</li></ul>",
      },
    ],
    faqs: [
      { q: "Does masala chai have caffeine?", a: "Yes. It is made with black tea, so it contains caffeine, roughly in the range of a cup of black tea." },
      { q: "Can I make chai without a stove?", a: "You can steep 2 teaspoons in 8 oz of boiling water for 4–5 minutes and add hot milk, but simmering on the stove gives the fuller, creamier taste chai is known for." },
      { q: "Do I need to add extra spices?", a: "No. Cardamom, cinnamon and clove are already in the blend. Fresh ginger is a popular extra in winter." },
    ],
  },
  {
    slug: "gir-cow-ghee-guide",
    title: "Gir Cow Ghee: What Bilona Ghee Is & How to Use It",
    description: "What A2 Gir cow ghee is, how the bilona method makes it from cultured butter, how to cook with it and how to store it. A practical guide.",
    h1: "Gir cow ghee: what bilona ghee is and how to use it",
    kicker: "Ghee guide",
    image: "/img/ghee.webp",
    imageAlt: "A glass jar of golden Gir cow ghee",
    minutes: 5,
    intro:
      "Ghee is butter that has been slowly heated until the water cooks off and the milk solids toast and are strained away, leaving a golden fat with a nutty, caramel aroma. Ours is made from the milk of Gir cows, an indigenous breed from Gujarat, by the traditional bilona method: milk is set into curd, the curd is churned into butter, and the butter is simmered into ghee.",
    products: ["premium-gir-cow-ghee"],
    facts: [
      { label: "Breed", value: "Gir, Gujarat (indigenous)" },
      { label: "Method", value: "Curd → hand-churned butter → ghee" },
      { label: "Best for", value: "Tempering, roasting, sautéing" },
      { label: "Storage", value: "Room temperature, sealed" },
    ],
    sections: [
      {
        heading: "What the bilona method means",
        html: "<ol><li>Whole milk is boiled and cooled, then set overnight into curd.</li><li>The curd is churned with a wooden churner (the bilona) until the butter separates from the buttermilk.</li><li>The butter is simmered slowly until the water evaporates and the milk solids turn golden.</li><li>The clear ghee is filtered and packed.</li></ol><p>It takes far more milk per jar than making ghee straight from cream, which is why bilona ghee costs more and tastes deeper.</p>",
      },
      {
        heading: "What \"A2\" means",
        html: "<p>Milk contains proteins called beta-casein, which come in A1 and A2 types depending on the cow's genetics. Milk from Gir and other indigenous Indian breeds is commonly sold as A2. Because ghee is almost pure fat, it contains only traces of milk protein either way.</p>",
      },
      {
        heading: "How to cook with ghee",
        html: "<ul><li><strong>Tadka (tempering):</strong> heat a spoonful, add cumin, mustard seeds and curry leaves, and pour over dal.</li><li><strong>Roasting:</strong> toss vegetables or makhana in melted ghee before roasting.</li><li><strong>Sautéing:</strong> ghee handles medium-high heat well because the milk solids that burn in butter have been removed.</li><li><strong>Finishing:</strong> a little on warm rice, rotis or popcorn.</li></ul>",
      },
      {
        heading: "Why it is grainy, and other normal things",
        html: "<p>Good ghee often sets with a grainy texture, and it can be liquid in summer and solid in winter. Both are natural and do not affect quality.</p>",
      },
      {
        heading: "Storage",
        html: "<p>Keep the jar closed, in a cool cupboard away from sunlight, and always use a clean, dry spoon; water is what spoils ghee. No fridge needed. Use within the best-before date on the jar.</p>",
      },
    ],
    faqs: [
      { q: "Is ghee the same as clarified butter?", a: "Close. Clarified butter is heated just until the water evaporates; ghee is cooked a little longer so the milk solids toast, which gives it its nutty aroma." },
      { q: "Does ghee need to be refrigerated?", a: "No. Kept sealed and away from moisture, ghee stays good at room temperature until its best-before date." },
      { q: "Is ghee lactose-free?", a: "Ghee contains only traces of lactose and milk protein because almost all of the milk solids are removed. If you have a dairy allergy, ask your doctor before using it." },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
/** Guides that mention a product, for "Learn more" links on product pages. */
export const guidesForProduct = (productSlug: string) => GUIDES.filter((g) => g.products.includes(productSlug));
