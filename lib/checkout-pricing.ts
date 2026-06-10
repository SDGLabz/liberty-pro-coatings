// ============================================================
// Checkout price math — the SINGLE source of truth for how an order
// total is computed, shared by the client (for display) and the server
// (authoritative). Pure functions only: no secrets, no catalog import,
// safe to bundle to the browser.
//
// Pricing policy (build plan §15): paying by card pays the standard
// price; paying by bank (ACH) earns a discount. We frame it as an ACH
// DISCOUNT, never a credit-card surcharge — surcharging triggers state
// bans and card-network rules, whereas a discount is standard B2B. The
// discount applies to the pre-tax merchandise subtotal.
// ============================================================

/** Percent off the subtotal when paying by bank (ACH). Easy to change. */
export const ACH_DISCOUNT_PCT = 3;

export type PaymentChoice = "card" | "ach";

export interface OrderTotals {
  method: PaymentChoice;
  /** pre-discount merchandise subtotal, in whole cents */
  subtotalCents: number;
  /** ACH discount applied, in whole cents (0 for card) */
  discountCents: number;
  /** amount actually charged, in whole cents */
  totalCents: number;
}

/**
 * Compute the order total for a payment method from a pre-tax subtotal in
 * cents. ACH gets ACH_DISCOUNT_PCT off; card pays full. All math is in
 * integer cents (round the discount, derive the total) so the client and
 * server always agree to the penny.
 */
export function computeTotals(subtotalCents: number, method: PaymentChoice): OrderTotals {
  const subtotal = Math.max(0, Math.round(subtotalCents));
  const discountCents = method === "ach" ? Math.round((subtotal * ACH_DISCOUNT_PCT) / 100) : 0;
  return { method, subtotalCents: subtotal, discountCents, totalCents: subtotal - discountCents };
}

/** Dollars (number) → whole cents, rounded. */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Whole cents → "$1,234.56" for display. */
export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}
