import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { SearchBox } from "./search-box";
import { CartButton } from "./cart-button";
import { AccountButton } from "./account-button";
import { WishlistButton } from "./wishlist-button";
import { Nav } from "./nav";
import { RegionPicker } from "./region-picker";
import { StorePill } from "./store-pill";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white md:border-b-0">
      <div className="anim-dropin relative z-20 [animation-delay:80ms]">
        <div className="wrap flex flex-wrap items-center gap-x-3 gap-y-3 py-3 sm:flex-nowrap sm:gap-7 sm:py-4">
          <Link href="/" aria-label="Xiphias Superfoods home" className="shrink-0">
            <Image src="/img/logo_big.webp" alt="Xiphias Superfoods" width={112} height={98} className="h-[64px] w-auto sm:h-[72px]" priority />
          </Link>
          <div className="order-last w-full min-w-0 basis-full sm:order-none sm:w-auto sm:basis-auto sm:flex-1">
            <SearchBox />
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <RegionPicker />
            <span className="hidden sm:block"><AccountButton /></span>
            <WishlistButton />
            <CartButton />
            <MobileMenu />
          </div>
        </div>
      </div>
      <div className="anim-dropin relative z-10 hidden border-y border-line md:block [animation-delay:160ms]">
        <div className="wrap flex items-center py-2">
          <Nav />
          <div className="ml-auto flex items-center gap-3">
            <StorePill />
          </div>
        </div>
      </div>
    </header>
  );
}

export { SITE };
