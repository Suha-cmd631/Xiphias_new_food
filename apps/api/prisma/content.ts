// Static page copy (from the live site, rewritten where the plan requires). Editable later from the admin.
export const PAGES = [
  {
    slug: "shipping",
    title: "Shipping Policy",
    bodyHtml: `
<p>We ship from Bengaluru, India to India, Europe, the United Kingdom, the United States, Canada, the Middle East and most other countries.</p>
<h2>India</h2><p>Orders are dispatched within 1–2 business days via Shiprocket partners and delivered in 3–6 business days. Standard delivery is free above ₹999; express delivery is available at checkout.</p>
<h2>International</h2><p>International orders ship with DHL Express (via Shiprocket X). Typical delivery is 4–9 business days after dispatch. Shipping is calculated at checkout from the destination and parcel weight, and is free above the threshold shown for your region.</p>
<h2>Duties and taxes</h2><p>Unless the checkout states that prices include duties, international shipments are sent DAP: import duties or VAT, where applicable, are collected by the carrier before delivery. We declare the true value of every parcel and attach the organic and phytosanitary certificates required for food products.</p>
<h2>Tracking</h2><p>You will receive a tracking link by email (and WhatsApp if opted in) as soon as the parcel is picked up. You can also track from the <a href="/track">Track order</a> page.</p>
<h2>Store pickup</h2><p>Customers in Bengaluru may collect orders from our Koramangala store during opening hours — choose “Pick up in store” at checkout.</p>`,
  },
  {
    slug: "returns",
    title: "Returns & Refunds",
    bodyHtml: `
<p>We want you to be delighted with every pack. If something is not right, write to <a href="mailto:info@xiphias.in">info@xiphias.in</a> within 30 days of delivery.</p>
<h2>Eligibility</h2><p>Food products can be returned only if unopened and in their original sealed packaging, or if they arrived damaged, defective or incorrect. Please include photos for damaged parcels so we can also claim with the carrier.</p>
<h2>EU and UK customers</h2><p>You have the statutory 14-day right of withdrawal from the day you receive the goods, for unopened sealed food products. Return shipping for a change of mind is at the customer's cost; for faulty or wrong items we cover it.</p>
<h2>Refunds</h2><p>Approved refunds are issued to the original payment method within 5–10 business days of receiving the return (JioPay/UPI/cards in India; Stripe for other regions). Shipping fees are refunded only when the return is due to our error.</p>
<h2>Exchanges</h2><p>We replace damaged or incorrect items free of charge — the fastest route is to place a new order and request a refund for the original.</p>`,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    bodyHtml: `
<p>This website is operated by XIPHIAS SuperFoods, a unit of XIPHIAS Projects Pvt. Ltd., Bengaluru, India. By placing an order you agree to these terms.</p>
<h2>Orders and prices</h2><p>Prices are shown in the currency of your selected region and are fixed per region; they are not live-converted. We may refuse or cancel an order where a product is unavailable or a price is clearly erroneous — any payment taken is refunded in full.</p>
<h2>Payment</h2><p>Payments in India are processed by JioPay; payments from other countries by Stripe. We never store card details on our servers.</p>
<h2>Products</h2><p>Our products are natural foods. Images are representative; natural variation in colour and size is normal. Information on this site is not medical advice — consult a professional for dietary conditions.</p>
<h2>Liability</h2><p>To the extent permitted by law our liability is limited to the value of the order. Nothing in these terms limits statutory consumer rights in your country.</p>
<h2>Governing law</h2><p>These terms are governed by the laws of India; EU and UK consumers also keep the protections of their local law. Courts of Bengaluru have jurisdiction for disputes not resolved amicably.</p>`,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    bodyHtml: `
<p>XIPHIAS SuperFoods (“we”) is the data controller for personal data collected on xiphiassuperfoods.com. Contact: <a href="mailto:info@xiphias.in">info@xiphias.in</a>.</p>
<h2>What we collect</h2><p>Account and order details (name, email, phone, addresses), payment confirmations from JioPay/Stripe (never card numbers), shipping events from our carriers, customer-service messages, and — with your consent — analytics and marketing cookies.</p>
<h2>Why</h2><p>To fulfil orders (contract), to meet tax and customs obligations (legal duty), to prevent fraud (legitimate interest), and to send newsletters you opted into (consent, withdrawable any time).</p>
<h2>Sharing</h2><p>Payment processors, couriers (Shiprocket, DHL), email delivery, and cloud hosting (AWS, Mumbai and EU regions). Data is transferred outside the EU/UK under standard contractual clauses.</p>
<h2>Retention</h2><p>Order records are kept for 8 years for tax law; marketing data until you unsubscribe; accounts until you delete them (anonymised within 30 days of a deletion request).</p>
<h2>Your rights</h2><p>Access, correction, deletion, portability, restriction, objection and the right to complain to your supervisory authority. Email us and we respond within 30 days.</p>`,
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    bodyHtml: `
<p>We use a small number of cookies. Essential cookies (region, cart, session) are always on. Analytics (GA4) and marketing (Meta Pixel) cookies are set only after you accept them in the consent banner, and you can change your choice any time from the footer link “Cookie settings”.</p>
<table><thead><tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr></thead><tbody>
<tr><td>xsf_region</td><td>Remembers your country / currency</td><td>1 year</td></tr>
<tr><td>xsf_cart</td><td>Keeps your cart</td><td>30 days</td></tr>
<tr><td>xsf_session</td><td>Keeps you signed in</td><td>30 days</td></tr>
<tr><td>xsf_consent</td><td>Stores your cookie choice</td><td>1 year</td></tr>
<tr><td>_ga, _fbp</td><td>Analytics / marketing (consent only)</td><td>up to 2 years</td></tr>
</tbody></table>`,
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    bodyHtml: `
<h2>Are your products certified organic?</h2><p>Yes — every product is certified organic and traceable to the district it was grown in. Certificates are listed on each product page.</p>
<h2>Do you ship internationally?</h2><p>Yes. We ship to Europe, the UK, the USA, Canada, the Middle East and most other countries with DHL Express. Prices are shown in your local currency.</p>
<h2>How long does delivery take?</h2><p>India: 3–6 business days (1–3 express). International: 4–9 business days after dispatch.</p>
<h2>Which payment methods do you accept?</h2><p>India: UPI, cards, net-banking and wallets via JioPay. Other countries: cards, Apple Pay, Google Pay and local methods via Stripe.</p>
<h2>What is your return policy?</h2><p>Unopened products can be returned within 30 days (14-day statutory withdrawal in the EU/UK). Damaged or incorrect items are replaced free of charge.</p>
<h2>Do you supply businesses?</h2><p>Yes — bulk supply, private label and export. See <a href="/b2b">B2B Solution</a> or request a quote.</p>`,
  },
  {
    slug: "store",
    title: "Our store",
    bodyHtml: `
<h2>XIPHIAS SuperFoods — Koramangala</h2>
<p>1st Floor, JK Nirmala Arcade, Plot 780, 80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034</p>
<p>Mon–Fri 9:00–17:00 · Sat 10:00–13:00 · Sun closed (IST)</p>
<p>Phone <a href="tel:+919886950101">+91 98869 50101</a> · Email <a href="mailto:info@xiphias.in">info@xiphias.in</a></p>
<p>Store pickup for online orders is available during opening hours — choose “Pick up in store” at checkout.</p>`,
  },
];

export const REDIRECTS: Array<[string, string]> = [
  ["/collections/all", "/shop"],
  ["/collections/b2b-solutions", "/b2b"],
  ["/pages/about-xiphias-superfoods", "/about"],
  ["/pages/b2b-solution", "/b2b"],
  ["/pages/contact", "/contact"],
  ["/blogs/news", "/blog"],
  ["/policies/shipping-policy", "/policies/shipping"],
  ["/policies/refund-policy", "/policies/returns"],
  ["/policies/terms-of-service", "/policies/terms"],
  ["/policies/privacy-policy", "/policies/privacy"],
  ["/product/organic-cinnamon-powder-100-grams/", "/shop/spices"],
];

export const BANNERS = [
  { placement: "hero", image: "/img/banner_offer.webp", title: "The superfoods your body deserves", subtitle: "10% off your first order — use code WELCOME10", ctaLabel: "Order now", ctaHref: "/shop", sort: 0 },
  { placement: "hero", image: "/img/banner_2.webp", title: "Discover our wellness collection", subtitle: "Teas, grains, spices, nuts, honey and ghee", ctaLabel: "Shop the collection", ctaHref: "/shop", sort: 1 },
];

export const PRODUCT_SECTIONS = (name: string, blurb: string, cat: string, origin: string) => [
  { heading: "Heritage & origin", html: `<p>${blurb}</p><p>Sourced from ${origin}, directly from the farmer groups we work with every season — no intermediaries between the field and your kitchen.</p>` },
  { heading: "Why you'll love it", html: `<ul><li>Certified organic and tested per lot</li><li>Traceable to the district it was grown in</li><li>Packed in small batches for freshness</li><li>No additives, preservatives or artificial flavours</li></ul>` },
  { heading: "Simple ways to enjoy", html: cat === "Teas" ? `<p>Use 2 g (one teaspoon) per cup. Brew with water at 80–90 °C for 3–4 minutes; re-steep up to three times.</p>` : `<p>Store in a cool, dry place away from sunlight. Use within the shelf life printed on the pack.</p>` },
  { heading: "Perfect for", html: `<p>Everyday wellness routines, gifting, and anyone who prefers clean-label food with a story behind it.</p>` },
  { heading: "Why choose XIPHIAS", html: `<p>Farm-direct sourcing, certified organic quality, worldwide delivery and a team you can actually talk to in Bengaluru.</p>` },
];
