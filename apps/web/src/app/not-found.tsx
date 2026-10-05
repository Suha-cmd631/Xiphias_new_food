import { ButtonLink } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="wrap py-24 text-center">
      <span className="kick">404</span>
      <h1 className="text-[clamp(36px,5vw,60px)]">This shelf is empty.</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">The page you're looking for moved or never existed. The shop, however, is fully stocked.</p>
      <div className="mt-8 flex justify-center gap-3"><ButtonLink href="/" variant="dark">Home</ButtonLink><ButtonLink href="/shop">Shop</ButtonLink></div>
    </div>
  );
}
