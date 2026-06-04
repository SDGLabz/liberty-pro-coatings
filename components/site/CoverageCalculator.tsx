"use client";

import { useState } from "react";

export interface CoverageProduct {
  sku: string;
  name: string;
  /** conservative (low-end) coverage in sq.ft. per gallon */
  rate: number;
}

const DEFAULT_RATE = 150;

// Coverage calculator: square footage ÷ coverage rate → gallons needed
// (rounded up, conservative). Picking a product pre-fills its low-end
// rate; the rate stays editable for other products/thicknesses.
export function CoverageCalculator({ products }: { products: CoverageProduct[] }) {
  const [sku, setSku] = useState("");
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [sqft, setSqft] = useState(500);

  const gallons = rate > 0 && sqft > 0 ? Math.ceil(sqft / rate) : 0;

  const onPickProduct = (value: string) => {
    setSku(value);
    const p = products.find((x) => x.sku === value);
    if (p) setRate(p.rate);
  };

  const num = (v: string, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  return (
    <div className="calc">
      <div className="form">
        <div className="frow">
          <label htmlFor="calc-product">Product (optional — prefills the rate)</label>
          <select id="calc-product" value={sku} onChange={(e) => onPickProduct(e.target.value)}>
            <option value="">Custom rate…</option>
            {products.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku} — {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="frow two">
          <div className="frow">
            <label htmlFor="calc-rate">Coverage rate (sq.ft./gal)</label>
            <input
              id="calc-rate"
              inputMode="numeric"
              value={rate}
              onChange={(e) => setRate(num(e.target.value, DEFAULT_RATE))}
            />
          </div>
          <div className="frow">
            <label htmlFor="calc-sqft">Square footage</label>
            <input
              id="calc-sqft"
              inputMode="numeric"
              value={sqft}
              onChange={(e) => setSqft(num(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="out" aria-live="polite" aria-atomic="true">
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "var(--txt-3)",
          }}
        >
          Estimated material (single coat)
        </div>
        <div className="big">
          {gallons} {gallons === 1 ? "gallon" : "gallons"}
        </div>
        <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)", margin: 0 }}>
          Conservative estimate at {rate || 0} sq.ft./gal for {sqft.toLocaleString()} sq.ft. Actual
          coverage varies with surface profile, mil thickness and number of coats — add a waste
          factor and confirm against the product TDS.
        </p>
      </div>
    </div>
  );
}
