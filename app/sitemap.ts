import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Batch 1 ships only the home route. Add interior routes (products,
// systems, colors, industries, resources, about, contact, legal, …)
// here as those pages land in later batches.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.url, changeFrequency: "monthly", priority: 1 }];
}
