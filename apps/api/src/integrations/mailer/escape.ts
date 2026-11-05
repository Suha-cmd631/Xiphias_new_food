/** Escape a value for use in HTML text or a double/single-quoted attribute. Every user-supplied value in an email goes through this. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped text with line breaks kept (free-text messages shown to staff). */
export const escMultiline = (value: unknown): string => esc(value).replace(/\r?\n/g, "<br>");

/** Subjects are plain text, not HTML: strip control characters / line breaks (header injection) and cap the length. */
export const subjectText = (value: unknown, max = 120): string =>
  String(value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
