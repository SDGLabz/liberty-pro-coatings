import Link from "next/link";

// 404 boundary — also catches every unmatched URL for the whole app.
// Server Component. Renders between the site Header and Footer (inside
// #a11y-root), so headings inherit the site's Oswald / navy treatment and the
// existing .wrap / .eyebrow / .btn utility classes apply. No context-dependent
// components are used, so it is safe even when rendered standalone.
export default function NotFound() {
  return (
    <section
      style={{
        background: "var(--bg-2)",
        borderBottom: "1px solid var(--line)",
        display: "grid",
        placeItems: "center",
        minHeight: "min(72vh, 760px)",
      }}
    >
      <div className="wrap" style={{ maxWidth: 760, textAlign: "center" }}>
        <div
          aria-hidden
          style={{
            fontFamily: "var(--head)",
            fontWeight: 700,
            fontSize: "clamp(96px, 20vw, 220px)",
            lineHeight: 0.86,
            letterSpacing: "-.02em",
            color: "var(--navy)",
          }}
        >
          4<span style={{ color: "var(--red)" }}>0</span>4
        </div>

        <span
          className="eyebrow"
          style={{ color: "var(--red-ink)", justifyContent: "center", marginTop: 14 }}
        >
          Page not found
        </span>

        <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", margin: "12px 0 14px" }}>
          This page took a wrong turn.
        </h1>

        <p className="lede" style={{ margin: "0 auto 30px" }}>
          The page you&rsquo;re looking for moved, changed address, or never existed. Let&rsquo;s
          get you back to something solid.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link className="btn btn-primary" href="/">
            Back to Home <span className="ar" aria-hidden>&rarr;</span>
          </Link>
          <Link className="btn btn-out" href="/products">
            Shop the Catalog
          </Link>
          <Link className="btn btn-out" href="/contact">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
