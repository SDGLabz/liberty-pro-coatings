"use client";

import { useState } from "react";
import { SurveyButton } from "./SurveyButton";

export interface KitLine {
  sku: string;
  name: string;
  price: number;
}
export interface BaseOption {
  label: string;
  slug: string;
  kitName: string;
  baseItems: KitLine[];
}
export interface FinishOption {
  label: string;
  sku: string;
  name: string;
  price: number;
}
export interface SwatchOption {
  n: string;
  c: string;
  s: string;
}

const SQFT_STEP = 50;
const SQFT_MIN = 50;

// Interactive build-a-kit. Resolves the chosen base + finish to REAL
// catalog SKUs and a material subtotal from real catalog prices. Square
// footage is captured for the quote; per-kit coverage math is deferred
// until real coverage/packaging data lands (checkout is gated off anyway).
export function Configurator({
  bases,
  finishes,
  colors,
}: {
  bases: BaseOption[];
  finishes: FinishOption[];
  colors: SwatchOption[];
}) {
  const [baseIdx, setBaseIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [finishIdx, setFinishIdx] = useState(0);
  const [sqft, setSqft] = useState(500);

  const base = bases[baseIdx];
  const finish = finishes[finishIdx];
  const color = colors[colorIdx];

  const subtotal = base.baseItems.reduce((sum, i) => sum + i.price, 0) + finish.price;

  const setSqftSafe = (n: number) => setSqft(Number.isFinite(n) ? Math.max(SQFT_MIN, n) : SQFT_MIN);

  return (
    <div className="layout">
      <div>
        <div className="opt-row">
          <div className="lbl">1 · Base system</div>
          <div className="opt-pills">
            {bases.map((b, i) => (
              <button
                key={b.slug}
                type="button"
                className={`opt-pill${i === baseIdx ? " active" : ""}`}
                aria-pressed={i === baseIdx}
                onClick={() => setBaseIdx(i)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="opt-row" style={{ marginTop: 22 }}>
          <div className="lbl">2 · Color / flake blend</div>
          <div className="opt-sw">
            {colors.map((c, i) => (
              <button
                key={c.n}
                type="button"
                className={`sw${i === colorIdx ? " active" : ""}`}
                style={{ background: c.c }}
                aria-label={`${c.s} — ${c.n}`}
                aria-pressed={i === colorIdx}
                title={`${c.s} — ${c.n}`}
                onClick={() => setColorIdx(i)}
              />
            ))}
          </div>
        </div>

        <div className="opt-row" style={{ marginTop: 22 }}>
          <div className="lbl">3 · Topcoat finish</div>
          <div className="opt-pills">
            {finishes.map((f, i) => (
              <button
                key={f.sku}
                type="button"
                className={`opt-pill${i === finishIdx ? " active" : ""}`}
                aria-pressed={i === finishIdx}
                onClick={() => setFinishIdx(i)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="opt-row" style={{ marginTop: 22 }}>
          <div className="lbl">4 · Square footage</div>
          <div className="qty">
            <button
              type="button"
              aria-label="Decrease square footage"
              onClick={() => setSqftSafe(sqft - SQFT_STEP)}
            >
              −
            </button>
            <input
              inputMode="numeric"
              value={sqft}
              aria-label="Square footage"
              onChange={(e) => setSqftSafe(parseInt(e.target.value, 10))}
            />
            <button
              type="button"
              aria-label="Increase square footage"
              onClick={() => setSqftSafe(sqft + SQFT_STEP)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <aside className="aside">
        <div className="pd-buy">
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "var(--txt-3)",
            }}
          >
            Resolves to
          </div>
          <div aria-live="polite" aria-atomic="true">
            <h3 style={{ fontSize: 19, margin: "6px 0 14px" }}>{base.kitName}</h3>
            <div className="stack" style={{ gap: 8, marginBottom: 16 }}>
              {base.baseItems.map((i) => (
                <LineItem key={i.sku} label={`${i.sku} ${shortRole(i.name)}`} price={`$${i.price}`} />
              ))}
              <LineItem label={`${color.s} — ${color.n}`} price="incl." />
              <LineItem label={`${finish.sku} Topcoat`} price={`$${finish.price}`} />
            </div>
            <div className="priceline" style={{ border: "none", padding: 0, marginBottom: 14 }}>
              <span className="price">${subtotal}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>
                est · {sqft.toLocaleString()} sq.ft · before freight
              </span>
            </div>
          </div>
          <button
            className="btn btn-cart btn-block"
            disabled
            style={{ opacity: 0.55, cursor: "not-allowed" }}
          >
            Coming soon — not yet available
          </button>
          <p className="gate-note">
            Configurator resolves to real SKUs with freight attributes.{" "}
            <SurveyButton className="gate-link">Become a contractor</SurveyButton> to check out.
          </p>
        </div>
      </aside>
    </div>
  );
}

function LineItem({ label, price }: { label: string; price: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 12,
        color: "var(--txt-2)",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span>{label}</span>
      <span>{price}</span>
    </div>
  );
}

// Tighten a long product name into a short role label for the kit list.
function shortRole(name: string): string {
  if (/primer|vapor/i.test(name)) return "Primer";
  if (/polyurea|basecoat/i.test(name)) return "Basecoat";
  return "Base";
}
