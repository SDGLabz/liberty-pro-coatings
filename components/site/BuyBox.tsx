"use client";

import { useState } from "react";
import { useSite } from "./SiteProvider";
import { SurveyButton } from "./SurveyButton";
import type { ProductStatus } from "@/lib/catalog";

// Disabled-CTA copy for products that aren't add-to-cart-able yet.
// "active-off" ("Coming Soon") IS purchasable into a cart (open browsing,
// gated checkout); "rnd-hold" / "mto" stay disabled with these messages.
const DISABLED_CTA: Record<Exclude<ProductStatus, "active-off">, string> = {
  "rnd-hold": "In Development — not yet available",
  mto: "Made to Order — contact us",
};

export interface BuyBoxProps {
  sku: string;
  name: string;
  price: number;
  pkg: string[];
  finish: string[];
  img: string;
  status: ProductStatus;
}

// Interactive product buy box. Packaging / finish / quantity selection plus
// a working "Add to cart" that pushes a real line item into the cart.
export function BuyBox({ sku, name, price, pkg, finish, img, status }: BuyBoxProps) {
  const { addToCart } = useSite();
  const [pkgIdx, setPkgIdx] = useState(0);
  const [finishIdx, setFinishIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const purchasable = status === "active-off";
  const selectedPkg = pkg[pkgIdx] ?? "";
  const selectedFinish = finish[finishIdx] ?? "";

  const bump = (delta: number) => setQty((q) => Math.max(1, q + delta));
  const onQtyInput = (raw: string) => {
    const n = parseInt(raw, 10);
    setQty(Number.isFinite(n) ? Math.max(1, n) : 1);
  };

  const handleAdd = () => {
    addToCart({ sku, name, price, pkg: selectedPkg, finish: selectedFinish, img, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="pd-buy">
      <div className="priceline">
        <span className="price">${price}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--txt-3)" }}>
          starting · per {pkg[0]}
        </span>
      </div>

      <div className="opt-row">
        <div className="lbl">Packaging / Size</div>
        <div className="opt-pills">
          {pkg.map((pk, i) => (
            <button
              key={pk}
              type="button"
              className={`opt-pill${i === pkgIdx ? " active" : ""}`}
              aria-pressed={i === pkgIdx}
              onClick={() => setPkgIdx(i)}
            >
              {pk}
            </button>
          ))}
        </div>
      </div>

      {finish.length > 0 && (
        <div className="opt-row">
          <div className="lbl">Finish / Color</div>
          <div className="opt-pills">
            {finish.map((f, i) => (
              <button
                key={f}
                type="button"
                className={`opt-pill${i === finishIdx ? " active" : ""}`}
                aria-pressed={i === finishIdx}
                onClick={() => setFinishIdx(i)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="opt-row">
        <div className="lbl">Quantity</div>
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => bump(-1)}>
            −
          </button>
          <input
            inputMode="numeric"
            value={qty}
            aria-label="Quantity"
            onChange={(e) => onQtyInput(e.target.value)}
          />
          <button type="button" aria-label="Increase quantity" onClick={() => bump(1)}>
            +
          </button>
        </div>
      </div>

      {purchasable ? (
        <button
          type="button"
          className="btn btn-cart btn-block"
          onClick={handleAdd}
          aria-live="polite"
        >
          {added ? "Added to cart ✓" : "Add to cart →"}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-cart btn-block"
          disabled
          style={{ cursor: "not-allowed" }}
        >
          {DISABLED_CTA[status]}
        </button>
      )}

      <div className="buy-meta">
        <span>Live LTL freight</span>
        <span>Full TDS &amp; SDS</span>
        <span>US shipping</span>
      </div>
      <p className="gate-note">
        <b>Open browsing, gated checkout.</b> Anyone can build a cart. Completing checkout requires
        an approved contractor account — <SurveyButton className="gate-link">become a contractor</SurveyButton>.
      </p>
    </div>
  );
}
