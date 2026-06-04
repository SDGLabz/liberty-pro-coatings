import type { Metadata } from "next";
import Link from "next/link";
import { COLORS, type Color } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Colors",
  description:
    "Decorative flake (1375), quartz (1321), metallic (1338) and universal color-pack (1339) options for Liberty Pro floor systems. Reference swatches — order chips before committing a job.",
  alternates: { canonical: "/colors" },
};

// Group the catalog colors by series, in first-appearance order.
const GROUPS: { series: string; name: string; colors: Color[] }[] = [];
for (const c of COLORS) {
  let g = GROUPS.find((x) => x.series === c.s);
  if (!g) {
    g = { series: c.s, name: c.s.replace(/^\d+\s+/, ""), colors: [] };
    GROUPS.push(g);
  }
  g.colors.push(c);
}

export default function ColorsPage() {
  return (
    <>
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
          {GROUPS.map((g) => (
            <div key={g.series}>
              <div className="sec-head reveal" style={{ marginTop: 36 }}>
                <div className="l">
                  <span className="eyebrow">{g.series}</span>
                  <h2 style={{ fontSize: "clamp(24px,3vw,38px)" }}>{g.name}</h2>
                </div>
              </div>
              <div className="swgrid">
                {g.colors.map((c) => (
                  <div key={c.n} className="swcard reveal">
                    <div className="chip" style={{ background: c.c }} />
                    <div className="nm">
                      <b>{c.n}</b>
                      <span>{c.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p style={{ marginTop: 30, fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>
            Swatch colors shown are representative placeholders — final blend names and values come
            from the LPC color/aggregate SKU list.
          </p>
        </div>
      </section>
    </>
  );
}
