// Reusable BreadcrumbList JSON-LD builder. Pass crumbs as { name, url } where
// `url` is a site-relative path ("/" for Home, "/about", …) or an absolute URL.
// Relative paths are resolved to absolute via SITE.url, matching how the
// product (app/products/[sku]) and system (app/systems/[slug]) pages build
// theirs. Stringify the result into a <script type="application/ld+json">.

import { SITE } from "@/lib/site";

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE.url}${item.url === "/" ? "" : item.url}`,
    })),
  };
}
