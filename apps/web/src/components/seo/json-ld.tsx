export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" is escaped so text from the catalogue can never close the script tag early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
