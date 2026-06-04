import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/catalog";

// Home + the Batch 2 products surface. Add more interior routes (systems,
// colors, industries, resources, about, contact, legal, …) here as those
// pages land in later batches.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/products`, changeFrequency: "monthly", priority: 0.9 },
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/products/${p.sku.toLowerCase()}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
