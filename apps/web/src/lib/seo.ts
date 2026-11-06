/** Titles that already carry the brand skip the "| Xiphias Superfoods" suffix the layout adds. */
/** Adds " | Xiphias Superfoods" only when the full title still fits in ~60 characters (what Google shows); otherwise the title stands alone. */
export const brandTitle = (t: string) => (/xiphias/i.test(t) || t.length + 21 > 60 ? { absolute: t } : t);
