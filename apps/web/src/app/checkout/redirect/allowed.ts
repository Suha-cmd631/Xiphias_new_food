/**
 * Where /checkout/redirect may send the shopper. The page auto-POSTs a form to the `action` URL from its query
 * string, so that URL must be pinned to the payment provider — otherwise any link to our site could bounce
 * (and POST) a visitor to an attacker's page.
 *
 * Allowed origins come from the server-side env PAYMENT_REDIRECT_ORIGINS (comma-separated, e.g. the origin of the
 * API's JIOPAY_BASE_URL). Nothing configured = nothing allowed.
 */
export function allowedPaymentOrigins(raw: string | undefined = process.env.PAYMENT_REDIRECT_ORIGINS): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => {
      try {
        return [new URL(s).origin];
      } catch {
        return [];
      }
    });
}

/** Returns the normalised action URL when its origin is allow-listed (http/https only), otherwise null. */
export function safePaymentAction(action: string | undefined, origins: string[]): string | null {
  if (!action) return null;
  let url: URL;
  try {
    url = new URL(action); // absolute URLs only — a relative or scheme-less value throws
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  return origins.includes(url.origin) ? url.toString() : null;
}
