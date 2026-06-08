import type { Metadata } from "next";
import Link from "next/link";
import { getSystem, getProduct, type System, type Product } from "@/lib/catalog";
import { SystemCard } from "@/components/site/SystemCard";
import { ProductCard } from "@/components/site/ProductCard";
import { SurveyButton } from "@/components/site/SurveyButton";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Residential Garage Floors",
  description:
    "The flagship Liberty Pro use case. Flake broadcast, 1-day flake and polyaspartic systems built for hot-tire pickup, abrasion, slab moisture and a floor the homeowner loves.",
  alternates: { canonical: "/industries/residential-garage" },
  openGraph: {
    type: "website",
    title: "Residential Garage Floors · Liberty Pro Coatings",
    description:
      "Systems built for hot-tire pickup, abrasion, slab moisture and the look homeowners want.",
    url: "/industries/residential-garage",
  },
};

const PROBLEMS: { h: string; p: string }[] = [
  {
    h: "Hot-tire pickup",
    p: "Warm tires soften and lift cheap coatings. A properly primed, fully cured high-build system bonds tight and shrugs it off.",
  },
  {
    h: "Abrasion & wear",
    p: "Floor jacks, dropped tools and daily traffic grind down thin paint-on coatings. Broadcast and polyaspartic builds carry real film thickness and hardness.",
  },
  {
    h: "Slab moisture",
    p: "Vapor driving up through the slab blisters coatings from below. A moisture-vapor-suppression primer is the fix where the slab calls for it.",
  },
  {
    h: "Oil & chemical staining",
    p: "Brake fluid, gas, road salt and degreasers attack the surface. Cured epoxy and urethane topcoats give broad chemical resistance and wipe clean.",
  },
  {
    h: "Slip resistance",
    p: "A wet garage floor is a hazard. Flake texture or a broadcast aggregate plus the right topcoat tunes traction without killing the look.",
  },
  {
    h: "The look",
    p: "Homeowners want it to look great, not just last. Decorative flake and metallic finishes turn a garage into the nicest room of the house.",
  },
];

const SYSTEM_SLUGS = [
  "flake-broadcast",
  "1-day-flake-broadcast",
  "pigmented-epoxy-floor",
  "metallic-epoxy",
];
const PRODUCT_SKUS = ["EG-MPE01", "PG-81", "EG-UVE41", "UG-51"];

export default function ResidentialGaragePage() {
  const systems = SYSTEM_SLUGS.map((s) => getSystem(s)).filter(Boolean) as System[];
  const products = PRODUCT_SKUS.map((s) => getProduct(s)).filter(Boolean) as Product[];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Industries", item: `${SITE.url}/industries` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Residential Garage",
        item: `${SITE.url}/industries/residential-garage`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="ihero">
        <div className="photo" style={{ backgroundImage: "url('/images/cat-1day.jpg')" }} />
        <div className="wrap">
          <span className="eyebrow">Flagship use case</span>
          <h1>Residential garage floors.</h1>
          <p>
            The garage is where Liberty Pro earns its keep. The problems are specific — hot-tire
            pickup, abrasion, slab moisture and a homeowner who wants it to look great — and our
            flake broadcast, 1-day flake and polyaspartic systems are built for exactly this.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/systems/flake-broadcast">
              The flagship system →
            </Link>
            <Link className="btn btn-out" href="/resources#calculator">
              Coverage Calculator
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/industries">Industries</Link>
        <span className="sep">/</span>
        <span>Residential Garage</span>
      </div>

      {/* The problem */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">What a garage floor is up against</span>
              <h2>The problem, specifically.</h2>
              <p className="lede">
                A garage floor fails in predictable ways. Each one has a system answer.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {PROBLEMS.map((x) => (
              <div key={x.h} className="featurecard reveal">
                <strong style={{ fontSize: 16 }}>{x.h}</strong>
                <p style={{ color: "var(--txt-2)", marginTop: 6, fontSize: 14 }}>{x.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended systems */}
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Recommended systems</span>
              <h2>Built for the garage.</h2>
              <p className="lede">
                Decorative, durable and — with the 1-day build — back in service the next morning.
              </p>
            </div>
            <Link className="seeall" href="/systems">
              All systems →
            </Link>
          </div>
          <div className="cats cols-3">
            {systems.map((s) => (
              <SystemCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Products behind them */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">The products behind them</span>
              <h2>The materials that do the work.</h2>
            </div>
            <Link className="seeall" href="/products">
              All products →
            </Link>
          </div>
          <div className="pgrid">
            {products.map((p) => (
              <ProductCard key={p.sku} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="wrap">
          <div className="cta-panel reveal">
            <div className="bg" />
            <div className="grid-tex" />
            <div className="inner">
              <span className="eyebrow">For garage-floor installers</span>
              <h2>Buy the garage systems direct.</h2>
              <p>Get approved to order with freight-inclusive pricing and same-day-system stock.</p>
              <div className="cta-row">
                <SurveyButton className="btn btn-primary">Become a Contractor →</SurveyButton>
                <Link className="btn btn-out" href="/systems/1-day-flake-broadcast">
                  See the 1-day system
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
