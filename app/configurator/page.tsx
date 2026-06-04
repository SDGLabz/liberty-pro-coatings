import type { Metadata } from "next";
import Link from "next/link";
import { getSystem, getProduct, baseLayerProducts, productsInSystem, COLORS } from "@/lib/catalog";
import {
  Configurator,
  type BaseOption,
  type FinishOption,
} from "@/components/site/Configurator";

export const metadata: Metadata = {
  title: "Build a Kit",
  description:
    "Configure a Liberty Pro floor system — pick a base, color, flake blend and finish, and the configurator resolves your choices to real product SKUs with an estimated material subtotal.",
  alternates: { canonical: "/configurator" },
};

const BASE_DEFS = [
  { label: "Flake Broadcast", slug: "flake-broadcast" },
  { label: "1-Day Flake", slug: "1-day-flake-broadcast" },
  { label: "Metallic", slug: "metallic-epoxy" },
  { label: "MicroQuartz", slug: "microquartz-floor" },
  { label: "Solid Color", slug: "pigmented-epoxy-floor" },
];

const FINISH_DEFS = [
  { label: "Gloss (UG-51)", sku: "UG-51" },
  { label: "UV Epoxy (EG-UVE41)", sku: "EG-UVE41" },
  { label: "Matte (UG-55)", sku: "UG-55" },
];

// Resolve the option defs to real catalog products at build time, so the
// client island ships only the small precomputed shape (not the catalog).
const BASES: BaseOption[] = BASE_DEFS.flatMap((d) => {
  const sys = getSystem(d.slug);
  if (!sys) return [];
  // Base/primer/broadcast products (topcoat layer excluded; the finish
  // selector supplies the topcoat). Fall back to the full system so a base
  // is never empty.
  const resolved = baseLayerProducts(sys);
  const items = resolved.length ? resolved : productsInSystem(sys);
  const baseItems = items.map((p) => ({ sku: p.sku, name: p.name, price: p.price }));
  return [
    {
      label: d.label,
      slug: d.slug,
      kitName: `${sys.name.replace(" System", "").replace(" Floor", "")} Kit`,
      baseItems,
    },
  ];
});

const FINISHES: FinishOption[] = FINISH_DEFS.flatMap((f) => {
  const p = getProduct(f.sku);
  if (!p) return [];
  return [{ label: f.label, sku: p.sku, name: p.name, price: p.price }];
});

const SWATCHES = COLORS.slice(0, 6).map((c) => ({ n: c.n, c: c.c, s: c.s }));

export default function ConfiguratorPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Build a Kit</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Build-your-own-kit</span>
          <h1>Configure a system.</h1>
          <p className="lede">
            Pick a base, color, flake blend and finish — the configurator resolves your choices to
            real Liberty Pro SKUs with shippable freight attributes, then drops them in your cart.
          </p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <Configurator bases={BASES} finishes={FINISHES} colors={SWATCHES} />
        </div>
      </section>
    </>
  );
}
