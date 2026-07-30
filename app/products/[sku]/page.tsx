import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProduct,
  getLiveProduct,
  systemsUsing,
  relatedProducts,
  colorsForProduct,
  primaryPackShot,
  CHEM_LABELS,
} from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { BuyBox } from "@/components/site/BuyBox";
import { SpecTables } from "@/components/site/SpecTables";
import { SITE } from "@/lib/site";

// Force-dynamic: each product page overlays the live SDG-portal CMS edits (TDS
// prose + the portal-generated TDS url) onto the static catalog at request time,
// so a portal publish appears here within seconds. (No generateStaticParams —
// invalid SKUs fall through to notFound().)
export const dynamic = "force-dynamic";

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
  const p = await getLiveProduct(sku);
  if (!p) notFound();

  const usedIn = systemsUsing(p.sku);
  const related = relatedProducts(p.sku, p.chem);
  // The LPC-labelled pail, where one has been rendered — used for the cart
  // line-item thumbnail and the schema.org/Product image, both of which should
  // show the thing being bought rather than a finished floor. Products without
  // a render fall back to their job photography.
  const pack = primaryPackShot(p);

  // Decorative finishes this product can be ordered in (data-driven) — rendered
  // as a swatch picker inside the buy box.
  const productColors = colorsForProduct(p.sku);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE.url}/products` },
      { "@type": "ListItem", position: 3, name: p.sku, item: `${SITE.url}/products/${p.sku.toLowerCase()}` },
    ],
  };

  // Product + Offer JSON-LD (schema.org/Product). Availability is derived
  // HONESTLY from the catalog status (no product is purchasable at launch):
  //   purchasable → InStock · active-off ("Coming Soon") → PreOrder ·
  //   mto ("Made to Order") → BackOrder · rnd-hold ("In Development") → OutOfStock.
  // The Offer is emitted only when a real list price exists. No aggregateRating
  // or review is included — there are no real reviews, and inventing them is a
  // Google policy violation.
  const availability = p.purchasable
    ? "https://schema.org/InStock"
    : p.status === "mto"
      ? "https://schema.org/BackOrder"
      : p.status === "rnd-hold"
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/PreOrder";
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.desc,
    sku: p.sku,
    category: `${p.family} · ${CHEM_LABELS[p.chem]}`,
    brand: { "@type": "Brand", name: SITE.name },
    manufacturer: { "@type": "Organization", name: SITE.name },
    image: [
      ...(pack ? [`${SITE.url}${pack.src}`] : []),
      `${SITE.url}${p.img}`,
    ],
    ...(p.price && p.price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITE.url}/products/${p.sku.toLowerCase()}`,
            price: p.price,
            priceCurrency: "USD",
            availability,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
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
              <ProductGallery
                img={p.img}
                imgAlt={`${p.name} — ${CHEM_LABELS[p.chem]} floor coating`}
                packShots={p.packShots}
              />
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
                pkgPrices={p.pkgPrices}
                pkg={p.pkg}
                finish={p.finish}
                img={pack?.src ?? p.img}
                status={p.status}
                colors={productColors}
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
              <div className="sec-head">
                <div className="l">
                  <span className="eyebrow">Technical Data Sheet</span>
                  <h2>Specs &amp; application.</h2>
                </div>
              </div>
              <div className="tds-acc">
                {(
                  [
                    ["Product Overview", p.tds.overview],
                    ["Uses & Benefits", p.tds.uses],
                    ["Limitations", p.tds.limitations],
                    ["Surface Preparation", p.tds.prep],
                    ["Mixing", p.tds.mixing],
                    ["Application", p.tds.application],
                  ] as const
                ).map(([title, body], i) => (
                  <details key={title} className="tds-acc-item" open={i === 0}>
                    <summary>{title}</summary>
                    <div className="tds-acc-body">
                      <p>{body}</p>
                    </div>
                  </details>
                ))}
              </div>
              <SpecTables
                technical={p.tds.technical}
                physical={p.tds.physical}
                tdsHref={p.tdsUrl ?? `/tds/${p.sku.toLowerCase()}`}
              />
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
      <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}>
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
              href={p.tdsUrl ?? `/tds/${p.sku.toLowerCase()}`}
              target="_blank"
              rel="noopener"
            >
              <span className="ic">TDS</span>
              <div className="meta">
                <h4>{p.sku} Technical Data Sheet</h4>
                <p>PDF · LPC_TDS_{p.sku}</p>
              </div>
              <span className="dl">Download <span className="ar" aria-hidden>→</span></span>
            </a>
            <a className="docrow" href="/contact">
              <span className="ic">SDS</span>
              <div className="meta">
                <h4>{p.sku} Safety Data Sheet</h4>
                <p>Available on request</p>
              </div>
              <span className="dl">Request <span className="ar" aria-hidden>→</span></span>
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
                  <span className="lsku">View <span className="ar" aria-hidden>→</span></span>
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
                All products <span className="ar" aria-hidden>→</span>
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
