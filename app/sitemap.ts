import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE } from "@/lib/site";
import { PRODUCTS, SYSTEMS } from "@/lib/catalog";
import { isPreLaunchOrigin, originForHost } from "@/lib/indexing";

// Home + the products and systems surfaces. Add more interior routes
// (colors, industries, resources, about, contact, legal, …) here as those
// pages land in later batches.
//
// Reading a request header opts this route out of static generation on purpose.
// The URLs have to name the hostname that was actually asked: that is what stops
// the pre-launch origin advertising 40 crawlable URLs today, and it is also what
// makes the real domain advertise its own URLs the moment DNS lands, without a
// redeploy and without depending on anyone remembering NEXT_PUBLIC_SITE_URL.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host");

  // A pre-launch origin publishes nothing. robots.txt already refuses the crawl
  // there; an empty sitemap means a crawler that fetches this anyway is handed
  // no URLs to queue.
  if (isPreLaunchOrigin(host)) return [];

  const base = originForHost(host, h.get("x-forwarded-proto")) || SITE.url;
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/products`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/systems`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/colors`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/industries`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/industries/residential-garage`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/resources`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/configurator`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    ...PRODUCTS.map((p) => ({
      url: `${base}/products/${p.sku.toLowerCase()}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...SYSTEMS.map((s) => ({
      url: `${base}/systems/${s.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
