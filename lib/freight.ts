// ─────────────────────────────────────────────────────────────────────────
// LTL freight estimation — Banyan-shaped SEAM (Phase 5 scaffold).
//
// This returns an ESTIMATE only. Real, binding rates flip on when LPC provides
// (a) the per-SKU freight CSV (weight / dims / freight class / NMFC / hazmat —
// see docs/freight/) and (b) Banyan LIVE Connect credentials. Until then the
// checkout shows a transparent estimated-freight line with a "confirmed before
// shipment" disclaimer; freight is NOT added to the charged amount yet.
//
// To flip it on later: implement the Banyan call inside estimateFreight()
// (origin FREIGHT_ORIGIN_ZIP → destZip, with each line's weight/class/hazmat)
// and return { isEstimate: false, source: "banyan", ... }. The shape stays the
// same so the UI needs no change. Wiring freight into the SERVER charge
// (create-intent, with the ACH discount applying to merchandise + freight) is a
// separate, deliberate step done at the same time — never trust a client total.
// ─────────────────────────────────────────────────────────────────────────

// Single ship-from warehouse (Waukegan, IL — shared with Polymer Nation).
export const FREIGHT_ORIGIN_ZIP = "60085";

export interface FreightLineItem {
  sku: string;
  qty: number;
  // Forward-looking: populated from the per-SKU freight CSV in Phase 5. The
  // mock below only needs qty; real rating needs these.
  weightLbs?: number;
  freightClass?: string;
  isHazmat?: boolean;
}

export interface FreightQuote {
  estimateCents: number;
  carrier: string;
  /** true = non-binding estimate (mock or indicative); false = real bound rate. */
  isEstimate: boolean;
  source: "mock" | "banyan";
  disclaimer: string;
}

// Transparent placeholder economics until real rates exist. Deliberately simple
// (base LTL move + per-package handling + a hazmat accessorial) and clearly
// labelled an estimate so it is never mistaken for a quoted/charged amount.
const MOCK_BASE_CENTS = 8500; // base LTL pickup + delivery
const MOCK_PER_PACKAGE_CENTS = 1500; // per-package handling
const MOCK_HAZMAT_SURCHARGE_CENTS = 4500; // carrier hazmat accessorial

/**
 * Estimate LTL freight for a cart. Returns null for an empty cart.
 * `destZip` is accepted now so the Banyan call has it when this flips on;
 * the mock ignores it.
 */
export function estimateFreight(
  items: FreightLineItem[],
  destZip?: string,
): FreightQuote | null {
  void destZip; // used by the Banyan call in Phase 5; mock is destination-agnostic
  if (!items.length) return null;

  const packages = items.reduce((sum, i) => sum + Math.max(0, i.qty), 0);
  if (packages <= 0) return null;
  const hasHazmat = items.some((i) => i.isHazmat);

  const estimateCents =
    MOCK_BASE_CENTS +
    packages * MOCK_PER_PACKAGE_CENTS +
    (hasHazmat ? MOCK_HAZMAT_SURCHARGE_CENTS : 0);

  return {
    estimateCents,
    carrier: "LTL freight",
    isEstimate: true,
    source: "mock",
    disclaimer: "Estimated. Final LTL freight is confirmed before your order ships.",
  };
}
