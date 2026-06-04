import type { Metadata } from "next";
import Link from "next/link";
import { SurveyButton } from "@/components/site/SurveyButton";

export const metadata: Metadata = {
  title: "About",
  description:
    "Liberty Pro Coatings is a concrete floor coating manufacturer and a brand of American Polymer Group — professional epoxy, polyaspartic and urethane systems, manufacturer-direct to approved contractors.",
  alternates: { canonical: "/about" },
};

const FEATURES = [
  { tag: "Made in USA", title: "American-made" },
  { tag: "Independently tested", title: "Real ASTM data" },
  { tag: "Contractor-grade", title: "Built for the trade" },
];

export default function AboutPage() {
  return (
    <>
      <section className="ihero">
        <div className="photo" style={{ backgroundImage: "url('/images/featured-fin.jpg')" }} />
        <div className="wrap">
          <span className="eyebrow">The brand</span>
          <h1>Liberty Pro Coatings.</h1>
          <p>
            A concrete coatings manufacturer and a sister brand under American Polymer Group, built
            to put professional-grade epoxy, polyaspartic and urethane systems directly in the hands
            of the contractors who install them.
          </p>
        </div>
      </section>

      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>About</span>
      </div>

      <section>
        <div className="wrap">
          <div className="twocol reveal">
            <div>
              <span className="eyebrow">Who we are</span>
              <h2 style={{ fontSize: "clamp(26px,3.4vw,42px)", margin: "12px 0 14px" }}>
                Manufacturer direct.
              </h2>
              <p className="lede" style={{ marginBottom: 14 }}>
                Liberty Pro Coatings manufactures a focused line of concrete floor coatings — the
                Epo-Guard, Poly-Guard and Ure-Guard families — sold to the US market with a primary
                focus on residential garage flooring and full coverage of commercial, industrial and
                specialty concrete.
              </p>
              <p className="lede">
                As a brand under American Polymer Group, we own the formulation and the supply chain,
                which means consistent quality, real documentation, and direct pricing for approved
                installers.
              </p>
            </div>
            <div className="visual" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
          </div>
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
          <div className="cats cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="featurecard reveal">
                <span className="ct">{f.tag}</span>
                <h3>{f.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div className="cta-panel reveal">
            <div className="bg" />
            <div className="grid-tex" />
            <div className="inner">
              <span className="eyebrow">Join the network</span>
              <h2>Buy direct from the manufacturer.</h2>
              <p>Get approved to check out with freight-inclusive pricing.</p>
              <div className="cta-row">
                <SurveyButton className="btn btn-primary">Become a Contractor →</SurveyButton>
                <Link className="btn btn-out" href="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
