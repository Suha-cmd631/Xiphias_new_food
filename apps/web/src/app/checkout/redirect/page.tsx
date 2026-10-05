import { Suspense } from "react";
import { JioPayRedirect } from "./form";
export const metadata = { robots: { index: false } };
export default function RedirectPage() {
  return <Suspense><JioPayRedirect /></Suspense>;
}
