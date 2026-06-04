import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { PRODUCTS, SYSTEMS } from "@/lib/catalog";

// Home + the products and systems surfaces. Add more interior routes
// (colors, industries, resources, about, contact, legal, …) here as those
// pages land in later batches.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/products`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/systems`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE.url}/colors`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/industries`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/resources`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/configurator`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/legal`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    ...PRODUCTS.map((p) => ({
      url: `${SITE.url}/products/${p.sku.toLowerCase()}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...SYSTEMS.map((s) => ({
      url: `${SITE.url}/systems/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
