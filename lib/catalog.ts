// ============================================================
// Liberty Pro Coatings — catalog data (single source of truth).
// Ported from the approved prototype (assets/catalog.js), source:
// BUILD_PLAN_LPC.md product tables + LPC TDS files.
//
// ⚠️ Placeholder prices ($78–$215) are RANDOM stand-ins per design
//    review — replace with real pricing (build-plan open item #7)
//    before launch.
// Status values: every product ships OFF / non-purchasable at launch
//    (visible, specced, priced, NOT buyable).
//
// TODO (content batch): split into content/products/*.json +
//    content/systems/*.mdx, add zod build-time validation + freight
//    attrs + tdsUrl/sdsUrl, and run the §9 "PN"/"Polymer Nation"
//    scrub on the .docx TDS source files.
// ============================================================

export type Chem = "epoxy" | "polyaspartic" | "polyurea" | "urethane";
export type ProductStatus = "active-off" | "rnd-hold" | "mto";

/** [label, value] */
export type TdsSpecRow = [string, string];
/** [property, method, value] */
export type TdsPhysicalRow = [string, string, string];

export interface Tds {
  overview: string;
  uses: string;
  limitations: string;
  prep: string;
  mixing: string;
  application: string;
  technical: TdsSpecRow[];
  physical: TdsPhysicalRow[];
}

export interface Glance {
  coverage: string;
  recoat: string;
  cure: string;
}

export interface Product {
  sku: string;
  name: string;
  chem: Chem;
  role: string;
  family: string;
  desc: string;
  pkg: string[];
  price: number;
  status: ProductStatus;
  img: string;
  finish: string[];
  featured?: boolean;
  glance?: Glance;
  tds?: Tds;
}

/** [layer, products, note] */
export type SystemLayer = [string, string, string];

export interface System {
  slug: string;
  name: string;
  tag: string;
  img: string;
  featured?: boolean;
  blurb: string;
  uses: string;
  layers: SystemLayer[];
}

export interface Color {
  /** name */
  n: string;
  /** source/series */
  s: string;
  /** hex swatch */
  c: string;
}

export const CHEM_LABELS: Record<Chem, string> = {
  epoxy: "Epoxy",
  polyaspartic: "Polyaspartic",
  polyurea: "Polyurea",
  urethane: "Urethane",
};

/** Commerce status → [badge label, css class]. */
export const STATUS_LABELS: Record<ProductStatus, [string, string]> = {
  "active-off": ["Coming Soon", "status-soon"],
  "rnd-hold": ["In Development", "status-rnd"],
  mto: ["Made to Order", "status-mto"],
};

export const PRODUCTS: Product[] = [
  // ---- Epoxy "Epo-Guard" ----
  {
    sku: "EG-WB03",
    name: "Epo-Guard Waterbased Epoxy",
    chem: "epoxy",
    role: "primer",
    family: "Epo-Guard",
    desc: "2K waterborne clear epoxy primer/sealer, low VOC, 48% solids.",
    pkg: ["2.5 Gal"],
    price: 96,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Clear"],
  },
  {
    sku: "EG-MPE01",
    name: "Epo-Guard Multi-Purpose 100% Solids Epoxy",
    chem: "epoxy",
    role: "resin",
    family: "Epo-Guard",
    desc: "Workhorse clear 100% solids epoxy, standard speed. Primer, broadcast resin, or topcoat.",
    pkg: ["3 Gal", "15 Gal", "165 Gal"],
    price: 189,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Clear", "Color Packs (1339)"],
    featured: true,
    glance: { coverage: "80–200 sq.ft./gal.", recoat: "Within 24 hours", cure: "7 days" },
    tds: {
      overview:
        "EG-MPE01 is our workhorse, clear, 100% solids epoxy. It can be ordered with 3 different speed hardeners — Standard, Medium and Fast — allowing easy transition between cold and warm weather applications and cure times. It works with our full line of colorants (Liberty Pro Coatings 1339) for extreme color flexibility. Ease of use, good flow and leveling, toughness and flexibility characterize this high quality epoxy. The cured material has good, broad-range chemical resistance plus good abrasion and impact resistance.",
      uses: "Most often used as a primer, broadcast resin and topcoat for resinous concrete flooring projects. It can also be used as a patching or trowel material when combined with Liberty Pro Coatings 1170 or 1324 aggregate.",
      limitations:
        "Designed to be applied at 8–12 mils as a primer, 12–20 mils as a body coat and 10–16 mils as a topcoat. Ideal application temperatures 60–85°F. Cooler temperatures increase cure times; warmer temperatures decrease working and cure times. Verify substrate temperature is above 5° of dew point during application and cure to avoid amine blush.",
      prep: "The preparation method for each project depends on the substrate, the coating chemistry, system thickness and other factors. The installer should fully read and understand ICRI Guideline No. 310.2R-2013 and OSHA 29 CFR 1926.1153 before starting. The aim is to roughen the surface, remove weak layers and contaminants, and present a solid, clean, dry substrate. If unsure of the preparation needed contact Liberty Pro Coatings at info@libertyprocoatings.com.",
      mixing:
        "Always mix the entire kit when possible to avoid off-ratio mixtures. Mix ratio is 2 parts Resin (Part A) to 1 part Hardener (Part B). Combine all of Part A and B into a single container large enough for the entire kit. Mix using a 350 RPM mixer with an appropriate blade for 1.5–2.5 minutes, avoiding excessive air.",
      application:
        'Pour the entire mixed content onto the floor in ribbons. Spread using a flat blade or notched squeegee. Back-roll using a 3/8" nap roller cover to maintain an even mil thickness. For an epoxy patching material, mix only what can be applied within the gel time and add aggregate to the desired thickness. Recoat within 24 hours. Clean tools with a solvent similar to Xylene or Acetone.',
      technical: [
        ["Packaging", "3, 15 & 165 Gal Kits"],
        ["Mix Ratio by Volume", "2:1 (A:B)"],
        ["Mixed Viscosity", "500–600 cP @ 25°C/77°F"],
        ["Gel Time", "45 minutes"],
        ["Dry to Touch", "8 hours"],
        ["Through Dry", "10 hours"],
        ["Dry to Walk", "12 hours"],
        ["Dry to Light Use", "24 hours"],
        ["Recoat Window", "Within 24 hours"],
        ["Full Cure", "7 days"],
        ["Shore D Hardness", "D65 @ 24 hrs / D78 @ 7 days"],
        ["Gloss @ 60°", "90+"],
        ["VOC (Mixed)", "<50 g/L (EPA Method 24)"],
        ["Color Scale", "0.5–1.0 per ASTM D1500"],
        ["Solids by Volume", "100%"],
        ["Application Thickness", "8–20 mils"],
        ["Coverage Rate", "80–200 sq.ft./gal."],
        ["Available Colors", "Clear & Color Packs (1339)"],
      ],
      physical: [
        ["Tensile Strength", "ASTM C307", "2,870 psi"],
        ["Moisture Absorption", "ASTM C413", "<0.2% weight increase"],
        ["Coeff. Thermal Lineal Expansion", "ASTM C531", "15–17 × 10⁻⁶ / 27–30 × 10⁻⁶"],
        ["Compressive Strength", "ASTM C579", "13,000 psi"],
        ["Flexural Strength", "ASTM C580", "5,750 psi"],
        ["Impact Resistance", "ASTM D2794", ">160 in-lb"],
        ["Adhesion", "ASTM D3359", "5A"],
        ["Abrasion (CS17, 1000g, 1000cy)", "ASTM D4060", "0.053 g loss"],
        ["Adhesion to Steel", "ASTM D4541", ">1,000 psi"],
        ["Flammability (on concrete)", "ASTM D635", "Self-Extinguishing"],
        ["Adhesion to Concrete", "ASTM D7234", ">450 psi — substrate failure"],
        ["COF — Dry", "NFSI B101.0", "0.75"],
        ["COF — Wet", "NFSI B101.1", "0.70"],
        ["Accelerated Weathering", "ASTM G154", "Moderate yellowing"],
      ],
    },
  },
  {
    sku: "EG-MPE01-F",
    name: "Epo-Guard Multi-Purpose 100% Solids Epoxy — Fast",
    chem: "epoxy",
    role: "resin",
    family: "Epo-Guard",
    desc: "Same workhorse 100% solids epoxy with fast hardener for cooler weather and quicker turnarounds.",
    pkg: ["3 Gal", "15 Gal", "165 Gal"],
    price: 194,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Clear", "Color Packs (1339)"],
  },
  {
    sku: "EG-UVE41",
    name: "Epo-Guard UV Resistant 100% Solids Epoxy",
    chem: "epoxy",
    role: "topcoat",
    family: "Epo-Guard",
    desc: "Clear UV-resistant 100% solids epoxy topcoat for improved color/gloss retention.",
    pkg: ["3 Gal", "15 Gal", "165 Gal"],
    price: 205,
    status: "active-off",
    img: "/images/prod-metal.jpg",
    finish: ["Clear"],
  },
  {
    sku: "EG-MVS99",
    name: "Epo-Guard Moisture Vapor Suppression Epoxy",
    chem: "epoxy",
    role: "primer",
    family: "Epo-Guard",
    desc: "Bis-F MVS primer, Class 1 vapor retarder for slabs with elevated moisture.",
    pkg: ["3 Gal", "15 Gal"],
    price: 198,
    status: "active-off",
    img: "/images/prod-quartz.jpg",
    finish: ["Clear"],
  },
  {
    sku: "EG-11TDK",
    name: "Epo-Guard Epoxy Mortar Patch Kit",
    chem: "epoxy",
    role: "patch",
    family: "Epo-Guard",
    desc: "2:1 clear epoxy + 1324 aggregate trowel kit — easy-troweling mortar, walkable in hours.",
    pkg: ["1 mix kit"],
    price: 142,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Natural"],
    glance: { coverage: '23 sq.ft. @ 1/4" / kit', recoat: "Within 24 hours", cure: "7 days" },
    tds: {
      overview:
        "EG-11TDK combines our clear, nonylphenol-free epoxy resin, a blended cycloaliphatic curing agent, and Liberty Pro Coatings 1324 Trowel Aggregate to create one of the easiest troweling materials available. The combination produces an easily closed, natural epoxy mortar walkable within a few hours. The cured material has high compressive strength (three times that of concrete), great impact resistance and broad chemical resistance. It is virtually odor-free.",
      uses: "Primarily used as an economical, natural-colored, fast-setting epoxy overlay to protect and/or repair concrete. As a mortar it is ideal for sloping floors and creating ramps and transitions, and for filling deep pits, cracks and voids in concrete floors and walls.",
      limitations:
        'Each kit covers 23 sq.ft. at 1/4" theoretical coverage; estimate a 10–15% waste factor. Ideal application temperatures 60–90°F. Cooler temperatures increase cure times; warmer temperatures decrease working and cure times. Verify substrate temperature is above 5° of dew point to avoid amine blush.',
      prep: "Read and understand ICRI Guideline No. 310.2R-2013 and OSHA 29 CFR 1926.1153 before starting. Roughen the surface, remove weak layers and contaminants, and present a solid, clean, dry substrate. If unsure of preparation needed contact Liberty Pro Coatings at info@libertyprocoatings.com.",
      mixing:
        "A kit consists of 0.5 gal Part A, 0.25 gal Part B and 45 lb of Part C (Liberty Pro Coatings 1324). Combine Part A and B in a container large enough to accept the entire mix (one mix equals 3.7 gallons with Part C added). Premix liquids at 350 RPM for 1 minute, then add Part C and mix to a homogenous mortar (usually 2–3 minutes).",
      application:
        "Pour material on the floor and spread to desired thickness using a screed rake, or pour into a screed box. Finish with good hand or power trowel techniques. Recoat within 24 hours. Clean tools with a solvent similar to Xylene or Acetone.",
      technical: [
        ["Packaging", "3 qt liquid kit + 1× 45 lb aggregate"],
        ["Mix Ratio by Kit", "0.5 gal A, 0.25 gal B, 45 lb C"],
        ["Mixed Viscosity (A&B)", "350–450 cP @ 25°C/77°F"],
        ["Gel Time", "15 minutes"],
        ["Dry to Touch", "1 hour"],
        ["Through Dry", "3 hours"],
        ["Dry to Walk", "4 hours"],
        ["Dry to Light Use", "12 hours"],
        ["Recoat Window", "Within 24 hours"],
        ["Full Cure", "7 days"],
        ["Shore D Hardness", "D65 @ 24 hrs / D78 @ 7 days"],
        ["Gloss @ 60°", "25–30"],
        ["VOC (Mixed)", "<50 g/L (EPA Method 24)"],
        ["Solids by Volume", "100%"],
        ["Application Thickness", '1/4" (23 sq.ft./kit)'],
        ["Available Colors", "Clear & Color Packs"],
      ],
      physical: [
        ["Compressive Strength", "ASTM C579", "~3× concrete"],
        ["Impact Resistance", "ASTM D2794", ">160 in-lb"],
        ["Adhesion to Concrete", "ASTM D7234", ">450 psi — substrate failure"],
      ],
    },
  },
  {
    sku: "EG-31CV",
    name: "Epo-Guard Cove Gel Kit",
    chem: "epoxy",
    role: "cove",
    family: "Epo-Guard",
    desc: "Epoxy cove gel (liquids + aggregate) for sanitary integral cove bases.",
    pkg: ["0.75 Gal + Ag"],
    price: 128,
    status: "active-off",
    img: "/images/prod-quartz.jpg",
    finish: ["Natural"],
  },

  // ---- Polyurea / Polyaspartic "Poly-Guard" ----
  {
    sku: "PG-61",
    name: "Poly-Guard 85% Polyaspartic — Slow",
    chem: "polyaspartic",
    role: "topcoat",
    family: "Poly-Guard",
    desc: "83% solids clear slow-speed polyaspartic, 1:1, for larger working windows.",
    pkg: ["2.5 Gal", "5 Gal", "10 Gal"],
    price: 168,
    status: "active-off",
    img: "/images/prod-metal.jpg",
    finish: ["Clear", "Color Packs"],
  },
  {
    sku: "PG-71",
    name: "Poly-Guard 85% Polyaspartic — Medium",
    chem: "polyaspartic",
    role: "topcoat",
    family: "Poly-Guard",
    desc: "Medium-speed clear polyaspartic, 1:1 — balanced working and return-to-service time.",
    pkg: ["2.5 Gal", "5 Gal", "10 Gal"],
    price: 172,
    status: "active-off",
    img: "/images/prod-metal.jpg",
    finish: ["Clear", "Color Packs"],
  },
  {
    sku: "PG-81",
    name: "Poly-Guard 85% Polyaspartic — Fast",
    chem: "polyaspartic",
    role: "topcoat",
    family: "Poly-Guard",
    desc: "Fast-speed clear polyaspartic — the engine of the 1-day floor system, 1:1.",
    pkg: ["2.5 Gal", "5 Gal", "10 Gal"],
    price: 178,
    status: "active-off",
    img: "/images/prod-1day.jpg",
    finish: ["Clear", "Color Packs"],
    featured: true,
    glance: { coverage: "110–300 sq.ft./gal.", recoat: "Within 2–24 hours", cure: "7 days" },
    tds: {
      overview:
        "PG-81 combines our fast polyaspartic resin with a proprietary aliphatic hardener blend to create a fast-speed, clear polyaspartic. It is an 83% solids, low-odor, low-viscosity polyaspartic that gives the skilled installer a short working time and fast dry time, allowing multiple steps to be completed in one day.",
      uses: "Primarily used as a 1-day floor system. It can go direct to concrete as a primer and broadcast resin and be ready for recoat within 2 hours. It has excellent UV, abrasion and hot-tire resistance.",
      limitations:
        "Designed to be applied 6–15 mils as a topcoat for floors and 5–6 mils as a topcoat on walls. Ideal application temperatures 40–80°F at 60% RH or less. Cooler temperatures increase cure times; warmer temperatures decrease working and cure times.",
      prep: "Read and understand ICRI Guideline No. 310.2R-2013 and OSHA 29 CFR 1926.1153 before starting. Roughen the surface, remove weak layers and contaminants, and present a solid, clean, dry substrate. If unsure of preparation needed contact Liberty Pro Coatings at info@libertyprocoatings.com.",
      mixing:
        "Always mix the entire kit when possible. Mix ratio is 1 part Part A to 1 part Part B. Combine into a single container large enough for the entire kit. Mix using a 350 RPM mixer for 1–2 minutes, avoiding excessive air.",
      application:
        'Pour a ribbon of mixed material onto the floor and spread using a flat blade or notched squeegee. Back-roll immediately using a 3/8" nap roller to maintain even mil thickness and a wet edge. Pour the next ribbon onto the wet material and repeat. Recoat within 2–24 hours. Clean tools with a solvent similar to Xylene or Acetone.',
      technical: [
        ["Packaging", "2.5, 5, 10 Gal Kits"],
        ["Mix Ratio by Volume", "1:1 (A:B)"],
        ["Mixed Viscosity", "250–350 cP @ 25°C/77°F"],
        ["Working Time", "5–10 minutes"],
        ["Dry to Touch", "0.5–1 hours"],
        ["Through Dry", "1–2 hours"],
        ["Dry to Walk", "2.5–5 hours"],
        ["Dry to Light Use", "10–12 hours"],
        ["Recoat Window", "Within 2–24 hours"],
        ["Full Cure", "7 days"],
        ["Pendulum (König) Hardness", "20 @ 24 hrs / 50 @ 7 days"],
        ["Gloss @ 60°", ">90"],
        ["VOC (Mixed)", "165 g/L (calculated)"],
        ["Solids by Volume", "83%"],
        ["Application Thickness", "5–15 mils"],
        ["Coverage Rate", "110–300 sq.ft./gal."],
        ["Available Colors", "Clear & Color Packs"],
      ],
      physical: [
        ["Tensile Strength", "ASTM C307", "3,270 psi"],
        ["Moisture Absorption", "ASTM C413", "<0.2% weight increase"],
        ["Compressive Strength", "ASTM C579", "12,500 psi"],
        ["Flexural Strength", "ASTM C580", "5,550 psi"],
        ["Impact Resistance", "ASTM D2794", ">160 in-lb"],
        ["Adhesion", "ASTM D3359", "5A"],
        ["Abrasion (CS17, 1000g, 1000cy)", "ASTM D4060", "0.022 g loss"],
        ["Adhesion to Concrete", "ASTM D7234", ">450 psi — substrate failure"],
        ["COF — Dry", "NFSI B101.0", "0.75"],
        ["COF — Wet", "NFSI B101.1", "0.70"],
        ["Accelerated Weathering", "ASTM G154", "Non-yellowing"],
      ],
    },
  },
  {
    sku: "PS-91",
    name: "Poly-Guard 100% Solids Polyscapes Resin",
    chem: "polyaspartic",
    role: "resin",
    family: "Poly-Guard",
    desc: "Aggregate-binder polyaspartic for the Polyscapes decorative system.",
    pkg: ["3 Gal"],
    price: 184,
    status: "active-off",
    img: "/images/cat-quartz.jpg",
    finish: ["Clear"],
  },
  {
    sku: "PU-20",
    name: "Poly-Bond 100% Solids Polyurea (Pigmented)",
    chem: "polyurea",
    role: "basecoat",
    family: "Poly-Guard",
    desc: "Pigmented polyurea basecoat/primer, 2:1.",
    pkg: ["3 Gal"],
    price: 158,
    status: "active-off",
    img: "/images/cat-pig.jpg",
    finish: ["Pigmented"],
  },
  {
    sku: "PU-21",
    name: "Poly-Bond 100% Solids Polyurea (Clear)",
    chem: "polyurea",
    role: "basecoat",
    family: "Poly-Guard",
    desc: "Clear polyurea basecoat/primer, 2:1.",
    pkg: ["3 Gal"],
    price: 154,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Clear"],
  },

  // ---- Urethane "Ure-Guard" ----
  {
    sku: "UG-21",
    name: "Ure-Guard Waterbased Urethane — Gloss",
    chem: "urethane",
    role: "topcoat",
    family: "Ure-Guard",
    desc: "Zero-VOC WB urethane/acrylic hybrid topcoat, gloss.",
    pkg: ["2 Gal"],
    price: 112,
    status: "rnd-hold",
    img: "/images/prod-metal.jpg",
    finish: ["Gloss"],
  },
  {
    sku: "UG-31",
    name: "Ure-Guard Waterbased Urethane — Satin",
    chem: "urethane",
    role: "topcoat",
    family: "Ure-Guard",
    desc: "Zero-VOC WB urethane/acrylic hybrid topcoat, satin.",
    pkg: ["2 Gal"],
    price: 112,
    status: "rnd-hold",
    img: "/images/prod-metal.jpg",
    finish: ["Satin"],
  },
  {
    sku: "UG-51",
    name: "Ure-Guard High Wear Urethane — Gloss",
    chem: "urethane",
    role: "topcoat",
    family: "Ure-Guard",
    desc: "1K 99% solids aliphatic MCU, gloss — maximum wear and chemical resistance.",
    pkg: ["1 Gal"],
    price: 148,
    status: "active-off",
    img: "/images/prod-quartz.jpg",
    finish: ["Gloss"],
  },
  {
    sku: "UG-55",
    name: "Ure-Guard High Wear Urethane — Matte",
    chem: "urethane",
    role: "topcoat",
    family: "Ure-Guard",
    desc: "1K 99% solids aliphatic MCU, low sheen.",
    pkg: ["1 Gal"],
    price: 148,
    status: "rnd-hold",
    img: "/images/cat-quartz.jpg",
    finish: ["Matte"],
  },
  {
    sku: "U-91",
    name: "Ure-Shield 100% Solids Urescapes Resin",
    chem: "urethane",
    role: "resin",
    family: "Ure-Guard",
    desc: "Flexible aliphatic urethane binder for the Urescapes system.",
    pkg: ["3 Gal"],
    price: 188,
    status: "active-off",
    img: "/images/cat-metal.jpg",
    finish: ["Clear"],
  },

  // ---- Patching / Joint / Cove ----
  {
    sku: "EP-15",
    name: "Epo-Patch 100% Solids Epoxy Paste",
    chem: "epoxy",
    role: "patch",
    family: "Epo-Guard",
    desc: "Non-shrink epoxy patching paste for pits, joints and spalls.",
    pkg: ["0.5 Gal kit"],
    price: 88,
    status: "active-off",
    img: "/images/prod-flake.jpg",
    finish: ["Natural"],
  },
  {
    sku: "PP-16",
    name: "Poly-Patch Fast Set Poly-Patch",
    chem: "polyaspartic",
    role: "patch",
    family: "Poly-Guard",
    desc: "Fast-set aromatic polyaspartic pour-and-patch for rapid repairs.",
    pkg: ["2 Gal kit"],
    price: 124,
    status: "active-off",
    img: "/images/prod-1day.jpg",
    finish: ["Natural"],
  },
];

export const SYSTEMS: System[] = [
  {
    slug: "pigmented-epoxy-floor",
    name: "Pigmented Epoxy Floor System",
    tag: "PG · Solid Color",
    img: "/images/cat-pig.jpg",
    blurb:
      "A solid-color, high-build epoxy floor — the clean, durable baseline for garages, shops and light industrial space.",
    uses: "Residential garages, workshops, light commercial and industrial floors where a clean solid color and chemical/abrasion resistance matter.",
    layers: [
      ["Primer", "EG-MPE01 / EG-MVS99", "Penetrating epoxy primer (MVS where moisture is a concern)"],
      ["Basecoat", "PU-20", "Pigmented polyurea/epoxy color basecoat"],
      ["Topcoat", "EG-UVE41 / UG-51", "UV-resistant epoxy or high-wear urethane topcoat"],
    ],
  },
  {
    slug: "solid-slurry",
    name: "Solid Slurry System",
    tag: "Slurry",
    img: "/images/cat-slurry.jpg",
    blurb:
      "A trowel-applied epoxy slurry mortar for impact, abrasion and a seamless, sealed monolithic surface.",
    uses: "Heavy-traffic industrial floors, kitchens and processing areas needing impact and chemical resistance.",
    layers: [
      ["Primer", "EG-MPE01", "100% solids epoxy primer"],
      ["Slurry", "EG-MPE01 + Quartz 1321", "Trowel-applied epoxy/aggregate slurry"],
      ["Topcoat", "EG-UVE41", "UV-resistant epoxy seal coat"],
    ],
  },
  {
    slug: "flake-broadcast",
    name: "Flake Broadcast System",
    tag: "EG · Flagship",
    img: "/images/cat-flake.jpg",
    featured: true,
    blurb:
      "Full decorative flake broadcast over a high-build epoxy base — the everyday workhorse garage and showroom floor.",
    uses: "Residential garages (flagship), showrooms, retail and commercial floors wanting a decorative, durable, easy-to-clean finish.",
    layers: [
      ["Primer / Base", "EG-MPE01", "100% solids epoxy base coat"],
      ["Broadcast", "Flake Blend 1375", "Decorative vinyl flake broadcast to refusal"],
      ["Topcoat", "EG-UVE41 / UG-51", "UV-resistant epoxy or high-wear urethane sealer"],
    ],
  },
  {
    slug: "1-day-flake-broadcast",
    name: "1-Day Flake Broadcast System",
    tag: "EG · 1-Day",
    img: "/images/cat-1day.jpg",
    blurb:
      "The flake broadcast look, installed and back in service the next morning, powered by fast polyaspartic.",
    uses: "Residential garages and commercial floors that can't afford multi-day downtime — return to service in ~24 hours.",
    layers: [
      ["Primer / Base", "PG-81", "Fast polyaspartic base, recoat in ~2 hrs"],
      ["Broadcast", "Flake Blend 1375", "Decorative flake broadcast to refusal"],
      ["Topcoat", "PG-81", "Fast polyaspartic sealer"],
    ],
  },
  {
    slug: "microquartz-floor",
    name: "MicroQuartz Floor System",
    tag: "Quartz",
    img: "/images/cat-quartz.jpg",
    blurb:
      "A double-broadcast colored quartz floor for slip resistance and durability in heavy-traffic, wet environments.",
    uses: "Commercial kitchens, restrooms, locker rooms, food & beverage and institutional floors needing slip resistance.",
    layers: [
      ["Primer", "EG-MPE01", "100% solids epoxy primer"],
      ["Broadcast", "Quartz 1321 M", "Double broadcast colored quartz"],
      ["Topcoat", "EG-UVE41 / UG-51", "Epoxy or urethane seal coat"],
    ],
  },
  {
    slug: "metallic-epoxy",
    name: "Metallic Epoxy System",
    tag: "Metallic",
    img: "/images/cat-metal.jpg",
    featured: true,
    blurb:
      "Pigmented metallic media in a clear epoxy for a seamless, marbled, high-gloss showpiece floor.",
    uses: "Showrooms, retail, hospitality and residential feature floors wanting a one-of-a-kind decorative look.",
    layers: [
      ["Primer", "EG-MPE01", "100% solids epoxy primer"],
      ["Metallic Coat", "EG-MPE01 + Metallic 1338", "Clear epoxy with metallic pigment, worked for effect"],
      ["Topcoat", "EG-UVE41", "UV-resistant clear epoxy topcoat"],
    ],
  },
  {
    slug: "epoxyscapes-flooring",
    name: "EpoxyScapes Flooring System",
    tag: "EP · Designer",
    img: "/images/cat-flake.jpg",
    blurb: "A designer decorative epoxy broadcast system for retail and hospitality interiors.",
    uses: "Retail, hospitality and commercial interiors wanting a refined decorative aggregate finish.",
    layers: [
      ["Primer", "EG-MPE01", "100% solids epoxy primer"],
      ["Scapes Coat", "EG-MPE01 + Scapes 1440", "Epoxy aggregate broadcast"],
      ["Topcoat", "EG-UVE41", "UV-resistant epoxy topcoat"],
    ],
  },
  {
    slug: "polyscapes-flooring",
    name: "PolyScapes Flooring System",
    tag: "PS · Fast-Cure",
    img: "/images/cat-quartz.jpg",
    blurb: "The Scapes decorative look with a fast-cure polyaspartic binder for quicker installs.",
    uses: "Retail, hospitality and commercial floors needing a decorative finish with faster return to service.",
    layers: [
      ["Primer", "PG-81", "Fast polyaspartic primer"],
      ["Scapes Coat", "PS-91 + Poly-T 1441", "Polyaspartic aggregate broadcast"],
      ["Topcoat", "PG-61 / PG-71", "Polyaspartic seal coat"],
    ],
  },
  {
    slug: "urescapes-flooring",
    name: "Urescapes Flooring System",
    tag: "UG · Urethane",
    img: "/images/cat-metal.jpg",
    blurb:
      "A flexible aliphatic urethane decorative system with elevated UV stability and crack tolerance.",
    uses: "Exterior-exposed and UV-critical decorative floors, and substrates where flexibility matters.",
    layers: [
      ["Primer", "EG-MPE01", "100% solids epoxy primer"],
      ["Urescapes Coat", "U-91 + aggregate", "Flexible urethane aggregate broadcast"],
      ["Topcoat", "UG-51", "High-wear aliphatic urethane topcoat"],
    ],
  },
];

export const COLORS: Color[] = [
  { n: "Slate", s: "1375 Flake", c: "#3a4756" },
  { n: "Terra", s: "1375 Flake", c: "#7a3b2e" },
  { n: "Sahara", s: "1375 Flake", c: "#cdb98a" },
  { n: "Pewter", s: "1375 Flake", c: "#9aa7ad" },
  { n: "Storm", s: "1375 Flake", c: "#374a5c" },
  { n: "Pine", s: "1375 Flake", c: "#2c5545" },
  { n: "Copper", s: "1338 Metallic", c: "#b5852c" },
  { n: "Graphite", s: "1338 Metallic", c: "#33383d" },
  { n: "Silver", s: "1338 Metallic", c: "#9aa3a8" },
  { n: "Quartz Tan", s: "1321 Quartz", c: "#d9d4c8" },
  { n: "Quartz Grey", s: "1321 Quartz", c: "#b7bcbe" },
  { n: "Liberty Red", s: "1339 Color Pack", c: "#c8102e" },
  { n: "Safety Yellow", s: "1339 Color Pack", c: "#d7a017" },
  { n: "Tile Red", s: "1339 Color Pack", c: "#8a3324" },
  { n: "Dove", s: "1339 Color Pack", c: "#c9cdd2" },
  { n: "Charcoal", s: "1339 Color Pack", c: "#2f3438" },
];

// ---- selectors ----------------------------------------------------

/** Featured systems first, capped. */
export function homeSystems(limit = 6): System[] {
  return [...SYSTEMS]
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, limit);
}

/** Featured products first, then the rest, capped — the home "best sellers". */
export function bestSellers(limit = 4): Product[] {
  return [
    ...PRODUCTS.filter((p) => p.featured),
    ...PRODUCTS.filter((p) => !p.featured),
  ].slice(0, limit);
}
