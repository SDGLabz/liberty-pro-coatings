import type { Metadata } from "next";
import Link from "next/link";
import { COLORS, SUPPORTING_SKUS, type Color, type SupportingSku } from "@/lib/catalog";
import { SwatchGrid } from "@/components/site/SwatchGrid";
import { SurveyButton } from "@/components/site/SurveyButton";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-schema";

const description =
  "Decorative flake (1375), quartz (1321), metallic (1338) and universal color-pack (1339) options for Liberty Pro floor systems. Reference swatches — order chips before committing a job.";

export const metadata: Metadata = {
  title: "Colors",
  description,
  alternates: { canonical: "/colors" },
  openGraph: { type: "website", title: "Colors · Liberty Pro Coatings", description, url: "/colors" },
  twitter: { title: "Colors · Liberty Pro Coatings", description },
};

// Short factual descriptor per decorative series — what the medium IS, so the
// page reads as scannable sections instead of an unlabelled wall of chips.
const SERIES_LEDES: Record<string, string> = {
  "1375 Flake":
    "Vinyl color flake broadcast into the build coat — a seamless, hide-everything finish with built-in texture and slip resistance.",
  "1321 Quartz":
    "Colored quartz aggregate for a heavier, more aggressive texture and high-traffic durability.",
  "1338 Metallic":
    "Metallic pigment suspended in clear resin for a marbled, reflective, one-of-a-kind floor.",
  "1339 Solid Color":
    "Universal color packs that tint clear epoxy and polyaspartic base coats to a clean, uniform solid color.",
};

// Group the catalog colors by series, in first-appearance order.
const GROUPS: { series: string; name: string; colors: Color[]; lede?: string }[] = [];
for (const c of COLORS) {
  let g = GROUPS.find((x) => x.series === c.s);
  if (!g) {
    g = {
      series: c.s,
      name: c.s.replace(/^\d+\s+/, ""),
      colors: [],
      lede: SERIES_LEDES[c.s],
    };
    GROUPS.push(g);
  }
  g.colors.push(c);
}

// Group the supporting SKUs (aggregates, media, supplies) by category.
const SUPPLY_GROUPS: { category: string; items: SupportingSku[] }[] = [];
for (const x of SUPPORTING_SKUS) {
  let g = SUPPLY_GROUPS.find((y) => y.category === x.category);
  if (!g) {
    g = { category: x.category, items: [] };
    SUPPLY_GROUPS.push(g);
  }
  g.items.push(x);
}

export default function ColorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Colors", url: "/colors" },
            ]),
          ),
        }}
      />
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Colors</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Flake · Quartz · Metallic · Color Packs</span>
          <h1>Colors &amp; blends.</h1>
          <p className="lede">
            Decorative options drawn from the Liberty Pro flake (1375), quartz (1321), metallic
            (1338) and universal color-pack (1339) lines. Swatches are reference only — order chips
            before committing a job.
          </p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <SwatchGrid groups={GROUPS} />
          <p style={{ marginTop: 30, fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>
            Swatches are reference images — on-screen color varies by display, so order physical
            chips before committing a job.
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Aggregates · media · supplies</span>
              <h2 style={{ fontSize: "clamp(24px,3vw,38px)" }}>Aggregates &amp; supplies.</h2>
              <p className="lede">
                The decorative media, aggregates, anti-slip additives, fillers and cleaners that
                round out a Liberty Pro system. Made to order — contact us to spec a job.
              </p>
            </div>
          </div>
          {SUPPLY_GROUPS.map((g) => (
            <div key={g.category} style={{ marginTop: 26 }}>
              <h3
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  color: "var(--txt-2)",
                  margin: "0 0 12px",
                }}
              >
                {g.category}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
                  gap: 14,
                }}
              >
                {g.items.map((x) => (
                  <div key={x.sku} className="featurecard" style={{ padding: "20px 18px", gap: 4 }}>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11.5,
                        letterSpacing: ".06em",
                        color: "var(--navy)",
                      }}
                    >
                      {x.sku}
                    </span>
                    <strong style={{ fontSize: 15.5, color: "var(--ink)" }}>{x.name}</strong>
                    <p
                      style={{
                        fontSize: 13.5,
                        color: "var(--txt-2)",
                        margin: "2px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      {x.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div className="cta-panel reveal">
            <div className="bg" />
            <div className="inner">
              <span className="eyebrow">For installers</span>
              <h2>Put these finishes to work.</h2>
              <p>Get approved to buy Liberty Pro direct, with freight-inclusive pricing.</p>
              <div className="cta-row">
                <SurveyButton className="btn btn-primary">
                  Become a Contractor <span className="ar" aria-hidden>→</span>
                </SurveyButton>
                <Link className="btn btn-out" href="/products">
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
