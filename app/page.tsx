import Link from "next/link";
import { homeSystems, bestSellers } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { SystemCard } from "@/components/site/SystemCard";
import { SurveyButton } from "@/components/site/SurveyButton";

const CHEMISTRY = [
  { chem: "epoxy", ct: "Epo-Guard", label: "Epoxy", img: "/images/prod-flake.jpg" },
  { chem: "polyaspartic", ct: "Poly-Guard", label: "Polyaspartic", img: "/images/prod-1day.jpg" },
  { chem: "polyurea", ct: "Poly-Bond", label: "Polyurea", img: "/images/cat-pig.jpg" },
  { chem: "urethane", ct: "Ure-Guard", label: "Urethane", img: "/images/cat-metal.jpg" },
] as const;

export default function Home() {
  const systems = homeSystems(6);
  const products = bestSellers(4);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="grid">
          <div className="left">
            <span className="eyebrow">Made in the USA · contractor-grade</span>
            <h1>
              Garage floors
              <br />
              built to <span className="red">last.</span>
            </h1>
            <p className="sub">
              Manufacturer-direct epoxy, polyaspartic and urethane systems for the contractors who
              install them. Full technical data, public pricing, and freight-inclusive checkout for
              approved pros.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/products">
                Shop the Catalog <span className="ar" aria-hidden>→</span>
              </Link>
              <Link className="btn btn-out" href="/systems">
                Explore Systems
              </Link>
            </div>
            <div className="micro">
              <span>Residential garage</span>
              <span>Commercial &amp; industrial</span>
              <span>Live LTL freight</span>
              <span>TDS &amp; SDS</span>
            </div>
          </div>
          <div className="right">
            <div className="photo" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
            <div className="floatcard">
              <div className="fk">Flagship system</div>
              <div className="fv">
                Flake Broadcast <b>· EG</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE BAR */}
      <div className="valbar">
        <h2 className="sr-only">Why contractors choose Liberty Pro Coatings</h2>
        <div className="wrap">
          <div className="val">
            <div className="vi">🏠</div>
            <div>
              <h3>Garage-First</h3>
              <p>Hot-tire, abrasion &amp; moisture-ready systems</p>
            </div>
          </div>
          <div className="val">
            <div className="vi">⤓</div>
            <div>
              <h3>Live Freight</h3>
              <p>Hazmat LTL priced before you pay</p>
            </div>
          </div>
          <div className="val">
            <div className="vi">▤</div>
            <div>
              <h3>Full Data</h3>
              <p>Complete TDS &amp; SDS on every product</p>
            </div>
          </div>
          <div className="val">
            <div className="vi">⚙</div>
            <div>
              <h3>Build-a-Kit</h3>
              <p>Configure a system to a real SKU</p>
            </div>
          </div>
        </div>
      </div>

      {/* SHOP BY SYSTEM */}
      <section id="systems">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Shop by system</span>
              <h2>Nine systems. One source.</h2>
              <p className="lede">
                From a one-day flake garage floor to a metallic showpiece — each system is a
                complete, spec&apos;d build-up linking to the Liberty Pro products it uses.
              </p>
            </div>
            <Link className="seeall" href="/systems">
              All 9 systems <span className="ar" aria-hidden>→</span>
            </Link>
          </div>
          <div className="cats bento">
            {systems.map((s) => (
              <SystemCard key={s.slug} s={s} cleanName />
            ))}
          </div>
        </div>
      </section>

      {/* BY CHEMISTRY */}
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
              <span className="eyebrow">Shop by chemistry</span>
              <h2>Find the right resin.</h2>
            </div>
            <Link className="seeall" href="/products">
              All products <span className="ar" aria-hidden>→</span>
            </Link>
          </div>
          <div className="cats cols-4">
            {CHEMISTRY.map((c) => (
              <Link key={c.chem} className="cat reveal" href={`/products?chem=${c.chem}`}>
                <div
                  className="bg"
                  style={{ background: `url('${c.img}') center/cover no-repeat` }}
                />
                <span className="ct">{c.ct}</span>
                <h3>{c.label}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section id="shop">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="l">
              <span className="eyebrow">Top of the catalog</span>
              <h2>Best sellers.</h2>
              <p className="lede">
                Browse free with full specs and public pricing. Build a cart anytime — checkout
                unlocks once you&apos;re an approved contractor.
              </p>
            </div>
            <Link className="seeall" href="/products">
              Shop all <span className="ar" aria-hidden>→</span>
            </Link>
          </div>
          <div className="pgrid">
            {products.map((p) => (
              <ProductCard key={p.sku} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRY: RESIDENTIAL GARAGE FLAGSHIP */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="twocol reveal">
            <div className="visual" style={{ backgroundImage: "url('/images/cat-1day.jpg')" }} />
            <div>
              <span className="eyebrow">Flagship use · Residential garage</span>
              <h2 style={{ fontSize: "clamp(28px,3.8vw,46px)", margin: "12px 0 14px" }}>
                The garage floor, solved.
              </h2>
              <p className="lede" style={{ marginBottom: 18 }}>
                Hot-tire pickup, abrasion, moisture and looks — our flake broadcast, 1-day flake and
                polyaspartic systems handle all of it, and install in a day when you need them to.
              </p>
              <Link className="btn btn-primary" href="/industries">
                Residential Garage Systems <span className="ar" aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA pill */}
      <section className="cta" id="apply">
        <div className="wrap">
          <div className="cta-panel reveal">
            <div className="bg" />
            <div className="grid-tex" />
            <div className="inner">
              <span className="eyebrow">For professional installers</span>
              <h2>Become an approved contractor.</h2>
              <p>
                Apply once to unlock freight-inclusive checkout, fast reorders, and account pricing
                across the full catalog.
              </p>
              <div className="cta-row">
                <SurveyButton className="btn btn-primary">Become a Contractor <span className="ar" aria-hidden>→</span></SurveyButton>
                <Link className="btn btn-out" href="/contact">
                  Talk to Our Team
                </Link>
              </div>
              <p className="micro">
                Already approved?{" "}
                <SurveyButton className="signin-link">Sign in to check out <span className="ar" aria-hidden>→</span></SurveyButton>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
