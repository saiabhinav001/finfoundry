/**
 * JSON-LD structured data helpers for SEO.
 * Used by page.tsx files to embed BreadcrumbList schemas.
 */

const SITE_URL = "https://cbitfinfoundry.vercel.app";
const SITE_NAME = "CBIT FinFoundry";

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    ],
  };
}
