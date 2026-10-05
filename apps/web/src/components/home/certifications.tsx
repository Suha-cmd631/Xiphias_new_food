import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";

/** Certification logos from the current site (ISO / FSSAI / organic). Replace the image when new certificates arrive. */
export function Certifications() {
  return (
    <section className="py-8" aria-label="Certifications">
      <div className="wrap">
        <Reveal className="rounded-card border border-line bg-white px-6 py-6 sm:px-10">
          <p className="kick !mb-4 text-center">Certified &amp; audited</p>
          <Image src="/img/certifications.webp" alt="ISO, FSSAI and organic certification logos" width={1540} height={300} className="mx-auto h-auto w-full max-w-[1100px]" sizes="(max-width: 1200px) 100vw, 1100px" />
        </Reveal>
      </div>
    </section>
  );
}
