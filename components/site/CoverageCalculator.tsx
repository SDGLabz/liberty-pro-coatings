"use client";

import { useState } from "react";
import { useSite } from "./SiteProvider";

export interface CoverageProduct {
  sku: string;
  name: string;
  /** conservative (low-end) coverage in sq.ft. per gallon */
  rate: number;
  price: number;
  img: string;
  /** packaging labels, e.g. ["3 Gal", "15 Gal"] — first is used for cart math */
  pkg: string[];
}

const DEFAULT_RATE = 150;

// Coverage calculator: square footage ÷ coverage rate → gallons needed
// (rounded up, conservative). Picking a product pre-fills its low-end
// rate; when a real product is picked we also convert the gallons estimate
// into whole packages and let the user add them to the cart.
export function CoverageCalculator({ products }: { products: CoverageProduct[] }) {
  const { addToCart } = useSite();
  const [sku, setSku] = useState("");
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [sqft, setSqft] = useState(500);
  const [added, setAdded] = useState(false);

  const gallons = rate > 0 && sqft > 0 ? Math.ceil(sqft / rate) : 0;
  const picked = products.find((x) => x.sku === sku);

  // Convert gallons → whole packages using the first packaging size
  // (e.g. "3 Gal" → 3 gal/pkg). Falls back to 1 if it can't be parsed.
  const gallonsPerPkg = picked ? parseFloat(picked.pkg[0]) : 0;
  const packages =
    picked && gallonsPerPkg > 0 ? Math.max(1, Math.ceil(gallons / gallonsPerPkg)) : 1;

  const onPickProduct = (value: string) => {
    setSku(value);
    setAdded(false);
    const p = products.find((x) => x.sku === value);
    if (p) setRate(p.rate);
  };

  const num = (v: string, fallback = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const handleAdd = () => {
    if (!picked) return;
    addToCart({
      sku: picked.sku,
      name: picked.name,
      price: picked.price,
      img: picked.img,
      pkg: picked.pkg[0] ?? "",
      finish: "",
      qty: packages,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
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
        {picked && gallons > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 16, width: "100%" }}
            onClick={handleAdd}
          >
            {added
              ? "Added to cart ✓"
              : `Add ${packages} × ${picked.pkg[0]} to cart →`}
          </button>
        )}
      </div>
    </div>
  );
}
