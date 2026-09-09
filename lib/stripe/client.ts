import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Browser-side Stripe loader. Uses the PUBLISHABLE key (pk_…), which is safe to
// ship to the client — it can only start payments, never move money on its own.
// Loaded once and cached so Stripe.js isn't re-fetched on every render.

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = key ? loadStripe(key) : Promise.resolve(null);
  }
  return stripePromise;
}

/**
 * True while the store is on TEST keys. Lives in `./mode` so callers that need
 * only the answer — the product buy box, for one — can ask without importing
 * this module and pulling Stripe.js into their bundle. Re-exported here so the
 * existing checkout import keeps working.
 */
export { isStripeTestMode } from "./mode";
