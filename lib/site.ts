// Single source of truth for site-wide constants (NAP, brand, canonical URL).
// SITE.url flips to the real domain at DNS cutover.

export const SITE = {
  name: "Liberty Pro Coatings",
  shortName: "LPC",
  // Canonical site origin. Set NEXT_PUBLIC_SITE_URL in the Vercel production
  // environment to the real domain (e.g. https://libertyprocoatings.com) at
  // DNS cutover; falls back to the Vercel placeholder until then.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://liberty-pro-coatings.vercel.app",
  description:
    "Manufacturer-direct epoxy, polyaspartic and urethane concrete floor coating systems for professional contractors. Full technical data, public pricing, and freight-inclusive checkout for approved pros.",
  phone: "(224) 733-1919",
  email: "info@libertyprocoatings.com",
  address: "405 Oakwood Ave, Waukegan, IL 60085",
  parent: "American Polymer Group",
} as const;
