import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS, SYSTEMS } from "@/lib/catalog";

// Home + the products and systems surfaces. Add more interior routes
// (colors, industries, resources, about, contact, legal, …) here as those
// pages land in later batches.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/products`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/systems`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/colors`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/industries`, changeFrequency: "monthly", priority: 0.8 },
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/products/${p.sku.toLowerCase()}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...SYSTEMS.map((s) => ({
      url: `${SITE.url}/systems/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
