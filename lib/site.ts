// Single source of truth for site-wide constants (NAP, brand, canonical URL).
// SITE.url flips to the real domain at DNS cutover.

export const SITE = {
  name: "Liberty Pro Coatings",
  shortName: "LPC",
  // Placeholder Vercel URL until the real domain is connected.
  url: "https://liberty-pro-coatings.vercel.app",
  description:
    "Manufacturer-direct epoxy, polyaspartic and urethane concrete floor coating systems for professional contractors. Full technical data, public pricing, and freight-inclusive checkout for approved pros.",
  phone: "(224) 733-1919",
  email: "info@libertyprocoatings.com",
  address: "405 Oakwood Ave, Waukegan, IL 60085",
  parent: "American Polymer Group",
} as const;
