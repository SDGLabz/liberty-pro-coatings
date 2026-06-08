import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, SYSTEMS } from "@/lib/catalog";
import {
  CoverageCalculator,
  type CoverageProduct,
} from "@/components/site/CoverageCalculator";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Liberty Pro Coatings resources — a coverage calculator and the technical data (TDS) and safety data (SDS) sheets for every product.",
  alternates: { canonical: "/resources" },
};

// Products that publish a per-gallon coverage rate → calculator presets.
const COVERAGE: CoverageProduct[] = PRODUCTS.flatMap((p) => {
  if (!p.glance || !/sq\.?\s?ft\.?\s?\/\s?gal/i.test(p.glance.coverage)) return [];
  const m = p.glance.coverage.match(/\d+/);
  if (!m) return [];
  return [
    {
      sku: p.sku,
      name: p.name,
      rate: parseInt(m[0], 10),
      price: p.price,
      img: p.img,
      pkg: p.pkg,
    },
  ];
});

// Group products by family for the document library.
const FAMILIES: { family: string; products: typeof PRODUCTS }[] = [];
for (const p of PRODUCTS) {
  let g = FAMILIES.find((x) => x.family === p.family);
  if (!g) {
    g = { family: p.family, products: [] };
    FAMILIES.push(g);
  }
  g.products.push(p);
}

export default function ResourcesPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Resources</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Calculator · TDS · SDS</span>
          <h1>Resources &amp; data.</h1>
          <p className="lede">
            Estimate the material a job needs, then pull the full technical and safety data for every
            Liberty Pro product. Every product page carries its complete TDS and SDS.
          </p>
        </div>
      </section>

      <section id="calculator">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Coverage calculator</span>
              <h2>How much will the job take?</h2>
              <p className="lede">
                Enter your square footage and a coverage rate — or pick a product to prefill its
                rate — for a conservative single-coat material estimate.
              </p>
            </div>
          </div>
          <CoverageCalculator products={COVERAGE} />
        </div>
      </section>

      <section
        style={{
          background: "var(--bg-2)",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Documents</span>
              <h2>Technical &amp; safety data.</h2>
              <p className="lede">
                TDS and SDS for every product. Open a product to download its sheets.
              </p>
            </div>
          </div>
          {FAMILIES.map((g) => (
            <div key={g.family} style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: "var(--txt-2)",
                  margin: "0 0 12px",
                }}
              >
                {g.family}
              </h3>
              <div style={{ display: "grid", gap: 8 }}>
                {g.products.map((p) => (
                  <Link
                    key={p.sku}
                    className="docrow"
                    href={`/products/${p.sku.toLowerCase()}`}
                    style={{ background: "#fff" }}
                  >
                    <span className="ic">TDS</span>
                    <div className="meta">
                      <h4>{p.name}</h4>
                      <p>
                        {p.sku} · TDS &amp; SDS
                      </p>
                    </div>
                    <span className="dl">Open →</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">System guides</span>
              <h2>Full system guides.</h2>
              <p className="lede">
                Downloadable build-up guides for all nine Liberty Pro flooring systems — layers,
                products, coverage and installation.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {SYSTEMS.map((s) => (
              <a
                key={s.slug}
                className="docrow"
                href={`/system-guides/${s.slug}.pdf`}
                target="_blank"
                rel="noopener"
              >
                <span className="ic">PDF</span>
                <div className="meta">
                  <h4>{s.name}</h4>
                  <p>{s.tag} · System guide</p>
                </div>
                <span className="dl">Download →</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
