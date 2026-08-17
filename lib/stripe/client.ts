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
 * True while the store is on TEST keys. Derived from the publishable key rather
 * than a hand-maintained flag, so the "test mode — no real charge" notices
 * disappear by themselves the moment live keys are set. Leaving that to a
 * manual edit is how a live store ends up telling real customers their real
 * payment isn't real.
 */
export function isStripeTestMode(): boolean {
  return (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith("pk_test_");
}
