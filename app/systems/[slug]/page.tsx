import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SYSTEMS, getSystem, productsInSystem } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { SurveyButton } from "@/components/site/SurveyButton";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) return {};
  return {
    title: s.name,
    description: s.blurb,
    alternates: { canonical: `/systems/${s.slug}` },
  };
}

export default async function SystemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSystem(slug);
  if (!s) notFound();

  const components = productsInSystem(s);

  return (
    <>
      <section className="ihero">
        <div className="photo" style={{ backgroundImage: `url('${s.img}')` }} />
        <div className="wrap">
          <span className="eyebrow">{s.tag} · System</span>
          <h1>{s.name}</h1>
          <p>{s.blurb}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#components">
              View Components →
            </a>
            <Link className="btn btn-out" href="/resources">
              System Guide PDF
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/systems">Systems</Link>
        <span className="sep">/</span>
        <span>{s.name}</span>
      </div>

      {/* Where it's used */}
      <section>
        <div className="wrap">
          <div className="twocol">
            <div>
              <span className="eyebrow">Where it&apos;s used</span>
              <h2 style={{ fontSize: "clamp(26px,3.4vw,40px)", margin: "12px 0 14px" }}>
                Built for the job.
              </h2>
              <p className="lede">{s.uses}</p>
            </div>
            <div className="visual" style={{ backgroundImage: `url('${s.img}')` }} />
          </div>
        </div>
      </section>

      {/* Build-up */}
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
              <span className="eyebrow">The build-up</span>
              <h2>Layer by layer.</h2>
              <p className="lede">
                Primer to topcoat — the exact stack and the Liberty Pro products in each layer.
              </p>
            </div>
          </div>
          <div className="stack">
            {s.layers.map(([layer, products, note], i) => (
              <div key={layer + i} className="layer reveal">
                <span className="ln">{i + 1}</span>
                <div>
                  <div className="lk">{layer}</div>
                  <h4>{products}</h4>
                  <p>{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Components */}
      {components.length > 0 && (
        <section id="components">
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="l">
                <span className="eyebrow">Base components</span>
                <h2>Products in this system.</h2>
              </div>
              <Link className="seeall" href="/products">
                All products →
              </Link>
            </div>
            <div className="pgrid">
              {components.map((p) => (
                <ProductCard key={p.sku} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Spec / order CTA */}
      <section style={{ background: "var(--ink)", color: "#fff", textAlign: "center" }}>
        <div className="wrap">
          <span className="eyebrow" style={{ color: "var(--gold-bright)", justifyContent: "center" }}>
            Estimate &amp; order
          </span>
          <h2
            style={{ color: "#fff", fontSize: "clamp(28px,4vw,48px)", margin: "14px 0 14px" }}
          >
            Spec this system for your job.
          </h2>
          <p style={{ color: "#9fb0c5", maxWidth: "46ch", margin: "0 auto 26px" }}>
            Use the coverage calculator to size the kits, add the components to a cart, and check out
            once you&apos;re an approved contractor.
          </p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary" href="/resources#calculator">
              Coverage Calculator →
            </Link>
            <SurveyButton className="btn btn-out btn-on-dark">Become a Contractor</SurveyButton>
          </div>
        </div>
      </section>
    </>
  );
}
