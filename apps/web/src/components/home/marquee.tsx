const PHRASES = ["100% Organic Ingredients", "Boost Immunity Naturally", "Rich in Antioxidants", "No Added Preservatives", "Loved by Wellness Enthusiasts", "Ancient Grains for Modern Living", "Superfoods You Can Trust", "Nourishment in Every Bite"];

/** The original site's scrolling promise strip, toned down: one line, brand type, soft gradient. */
export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <section aria-label="Our promises" className="py-6">
      <div className="wrap">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-leaf-soft via-sand to-leaf-soft py-4">
          <div className="anim-marquee flex w-max items-center gap-12 whitespace-nowrap font-head text-[20px] font-medium text-ink sm:text-[24px]">
            {items.map((t, i) => <span key={i} className="flex items-center gap-12">{t}<i aria-hidden className="h-2 w-2 rounded-full bg-leaf-dark" /></span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
