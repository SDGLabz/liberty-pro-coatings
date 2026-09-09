import { SITE } from "@/lib/site";

/**
 * Which origins are pre-launch, and therefore must not be indexed.
 *
 * The build has always answered on `liberty-pro-coatings.vercel.app`, and that
 * origin has been serving `Allow: /` plus a 40-URL sitemap while the real
 * domain still points somewhere else — so a full crawlable copy of the store
 * has been sitting in the index queue under the wrong hostname. Every preview
 * deployment lands on a `*.vercel.app` hostname too.
 *
 * This is deliberately a DENY-list on `.vercel.app` rather than an allow-list
 * of real domains, because the two fail in opposite directions. An allow-list
 * that is missing a hostname serves `noindex` to Google on the launched site,
 * silently, and nobody notices for weeks. A deny-list that is missing a
 * hostname leaves a staging URL indexable, which is the problem we already
 * have and can see. Unknown hosts therefore stay indexable on purpose.
 *
 * Gating on the REQUEST host rather than an environment flag also means there
 * is nothing to undo at DNS cutover: the apex starts serving the indexable
 * robots.txt the moment it starts resolving here.
 */
export function isPreLaunchOrigin(host: string | null | undefined): boolean {
  if (!host) return false;
  const name = host.split(",")[0].trim().split(":")[0].toLowerCase();
  return name === "vercel.app" || name.endsWith(".vercel.app");
}

/**
 * Absolute origin for the host actually being served, so generated URLs name
 * the domain the visitor arrived on instead of a build-time constant. The
 * sitemap uses this: the apex advertises apex URLs the moment DNS lands,
 * without waiting on anyone remembering to set NEXT_PUBLIC_SITE_URL.
 *
 * Falls back to SITE.url when there is no request host to read.
 */
export function originForHost(
  host: string | null | undefined,
  proto?: string | null,
): string {
  if (!host) return SITE.url;
  const name = host.split(",")[0].trim();
  const isLocal =
    name.startsWith("localhost") ||
    name.startsWith("127.0.0.1") ||
    name.startsWith("[::1]");

  // Real hostnames are always https. The forwarded-proto header reflects however
  // the request reached this process, which is plain http behind a local
  // `next start` — and a published sitemap or robots `Sitemap:` line must never
  // inherit that. Only the loopback hosts are allowed to honour the header.
  const scheme = isLocal ? proto?.split(",")[0].trim() || "http" : "https";
  return `${scheme}://${name}`;
}
