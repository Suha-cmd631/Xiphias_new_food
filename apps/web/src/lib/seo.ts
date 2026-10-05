/** Titles that already carry the brand skip the "| Xiphias Superfoods" suffix the layout adds. */
export const brandTitle = (t: string) => (/xiphias/i.test(t) ? { absolute: t } : t);
