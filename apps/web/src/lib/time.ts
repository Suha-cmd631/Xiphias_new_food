// All dates come from the API as ISO-8601 UTC. Render in the store's timezone unless told otherwise.
const TZ = "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(new Date(iso));
}

/** Next Sunday 23:59:59 IST — the weekly "Healthy deals" countdown target. */
export function nextSundayIst(): number {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  const d = new Date(ist);
  d.setDate(ist.getDate() + ((7 - ist.getDay()) % 7 || 7));
  d.setHours(23, 59, 59, 0);
  return d.getTime() - (330 + now.getTimezoneOffset()) * 60_000;
}

/** Store open/closed for the header pill (Mon–Fri 9–17, Sat 10–13 IST). */
export function storeOpenNow(): boolean {
  const now = new Date();
  const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60_000);
  const d = ist.getDay();
  const h = ist.getHours() + ist.getMinutes() / 60;
  return (d >= 1 && d <= 5 && h >= 9 && h < 17) || (d === 6 && h >= 10 && h < 13);
}
