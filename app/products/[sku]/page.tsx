import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PRODUCTS,
  getProduct,
  systemsUsing,
  relatedProducts,
  CHEM_LABELS,
} from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { BuyBox } from "@/components/site/BuyBox";
import { SITE } from "@/lib/site";

const TABLE_HEAD_STYLE = {
  fontSize: 20,
  textTransform: "uppercase" as const,
  marginBottom: 12,
};

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ sku: p.sku.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sku: string }>;
}): Promise<Metadata> {
  const { sku } = await params;
  const p = getProduct(sku);
  if (!p) return {};
  const path = `/products/${p.sku.toLowerCase()}`;
  return {
    title: p.name,
    description: p.desc,
    alternates: { canonical: path },
    openGraph: { type: "website", title: `${p.name} · Liberty Pro Coatings`, description: p.desc, url: path },
    twitter: { title: `${p.name} · Liberty Pro Coatings`, description: p.desc },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const p = getProduct(sku);
  if (!p) notFound();

  const thumbs = [p.img, "/images/cat-flake.jpg", "/images/featured-fin.jpg"];
  const usedIn = systemsUsing(p.sku);
  const related = relatedProducts(p.sku, p.chem);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE.url}/products` },
      { "@type": "ListItem", position: 3, name: p.sku, item: `${SITE.url}/products/${p.sku.toLowerCase()}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <Link href="/products">Products</Link>
        <span className="sep">/</span>
        <span>{p.sku}</span>
      </div>

      {/* TOP: gallery + identity + buy */}
      <section>
        <div className="wrap">
          <div className="pd-top">
            <div>
              <div className="pd-gallery">
                <div className="main" style={{ backgroundImage: `url('${p.img}')` }} />
              </div>
              <div className="pd-thumbs">
                {thumbs.map((t, i) => (
                  <div
                    key={i}
                    className={`pd-thumb${i === 0 ? " active" : ""}`}
                    style={{ backgroundImage: `url('${t}')` }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="pd-id">
                <span className="tag">
                  {p.family} · {CHEM_LABELS[p.chem]}
                </span>
                <span className="sku">{p.sku}</span>
                <h1>{p.name}</h1>
                <p className="descriptor">{p.desc}</p>
              </div>

              {p.glance && (
                <div className="glance">
                  <div className="g">
                    <div className="gk">Coverage</div>
                    <div className="gv">{p.glance.coverage}</div>
                  </div>
                  <div className="g">
                    <div className="gk">Recoat Window</div>
                    <div className="gv">{p.glance.recoat}</div>
                  </div>
                  <div className="g">
                    <div className="gk">Full Cure</div>
                    <div className="gv">{p.glance.cure}</div>
                  </div>
                </div>
              )}

              <BuyBox
                sku={p.sku}
                name={p.name}
                price={p.price}
                pkg={p.pkg}
                finish={p.finish}
                img={p.img}
                status={p.status}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TDS */}
      <section className="tds">
        <div className="wrap">
          {p.tds ? (
            <>
              <div className="tds-sec">
                <span className="eyebrow">Technical Data Sheet</span>
                <h2>Product Overview</h2>
                <p>{p.tds.overview}</p>
              </div>
              <div className="tds-sec">
                <h2>Uses &amp; Benefits</h2>
                <p>{p.tds.uses}</p>
              </div>
              <div className="tds-sec">
                <h2>Limitations</h2>
                <p>{p.tds.limitations}</p>
              </div>
              <div className="tds-sec">
                <h2>Surface Preparation</h2>
                <p>{p.tds.prep}</p>
              </div>
              <div className="tds-sec">
                <h2>Mixing</h2>
                <p>{p.tds.mixing}</p>
              </div>
              <div className="tds-sec">
                <h2>Application</h2>
                <p>{p.tds.application}</p>
              </div>
              <div className="tds-tables">
                <div>
                  <h2 style={TABLE_HEAD_STYLE}>Technical Data</h2>
                  <table className="spec-table">
                    <tbody>
                      {p.tds.technical.map(([k, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h2 style={TABLE_HEAD_STYLE}>Physical Properties</h2>
                  <table className="spec-table">
                    <tbody>
                      {p.tds.physical.map(([k, std, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td className="std">{std}</td>
                          <td>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="tds-sec">
              <span className="eyebrow">Technical Data Sheet</span>
              <h2>Product Overview</h2>
              <p>
                {p.desc} Full technical data sheet — overview, uses &amp; benefits, limitations,
                surface prep, mixing, application, and the complete technical-data and
                physical-properties tables — is sourced from the LPC TDS for {p.sku} and renders
                here.
              </p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--txt-3)" }}>
                TDS content for {p.sku} to be ported from <b>LPC_TDS_{p.sku}.docx</b> (per build plan
                §6 / §9 scrub).
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Documents */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Documents</span>
              <h2>Data &amp; safety sheets.</h2>
            </div>
          </div>
          <div style={{ maxWidth: 560 }}>
            <a
              className="docrow"
              href={`/tds/${p.sku.toLowerCase()}`}
              target="_blank"
              rel="noopener"
            >
              <span className="ic">TDS</span>
              <div className="meta">
                <h4>{p.sku} Technical Data Sheet</h4>
                <p>PDF · LPC_TDS_{p.sku}</p>
              </div>
              <span className="dl">Download →</span>
            </a>
            <a className="docrow" href="#">
              <span className="ic">SDS</span>
              <div className="meta">
                <h4>{p.sku} Safety Data Sheet</h4>
                <p>PDF · Safety &amp; handling</p>
              </div>
              <span className="dl">Download →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Used in systems */}
      {usedIn.length > 0 && (
        <section style={{ borderTop: "1px solid var(--line)" }}>
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="l">
                <span className="eyebrow">Used in systems</span>
                <h2>Where {p.sku} goes to work.</h2>
              </div>
            </div>
            <div className="stack reveal">
              {usedIn.map((s, i) => (
                <Link key={s.slug} className="layer" href={`/systems/${s.slug}`}>
                  <span className="ln">{i + 1}</span>
                  <div>
                    <div className="lk">{s.tag}</div>
                    <h4>{s.name}</h4>
                    <p>{s.blurb}</p>
                  </div>
                  <span className="lsku">View →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
          <div className="wrap">
            <div className="sec-head reveal">
              <div className="l">
                <span className="eyebrow">Related products</span>
                <h2>Same chemistry.</h2>
              </div>
              <Link className="seeall" href="/products">
                All products →
              </Link>
            </div>
            <div className="pgrid">
              {related.map((r) => (
                <ProductCard key={r.sku} p={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
