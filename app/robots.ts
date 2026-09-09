import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE } from "@/lib/site";
import { isPreLaunchOrigin, originForHost } from "@/lib/indexing";

// Reading a request header opts this route out of static generation, which is
// the point: the answer has to depend on which hostname was asked, not on which
// hostname happened to be configured at build time.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host");

  // Pre-launch origins refuse the whole crawl and advertise no sitemap, so the
  // staging copy of the store stops offering 40 indexable URLs under a hostname
  // that is not the client's. The real domain is unaffected and needs no change
  // at cutover.
  if (isPreLaunchOrigin(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const origin = originForHost(host, h.get("x-forwarded-proto")) || SITE.url;
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
