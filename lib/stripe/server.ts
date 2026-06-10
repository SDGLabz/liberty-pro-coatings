import Stripe from "stripe";

// Server-side Stripe client. The SECRET key (sk_…) is read only here and must
// never reach a Client Component — that's why this lives in a server-only path
// and is constructed lazily: importing the module can't throw at build time if
// the key is absent, and the client is created only when a request that has
// already passed `stripeConfigured()` actually needs it.
//
// Keys are TEST-mode (sk_test_…) until launch, so nothing here can move real
// money. Flip to live keys in Vercel at go-live — no code change needed.

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      // No pinned apiVersion: use the version the installed `stripe` package
      // is built against, so the TypeScript types always match.
      typescript: true,
      appInfo: { name: "Liberty Pro Coatings" },
    });
  }
  return _stripe;
}

/** True when a Stripe secret key is configured (else handlers return 503). */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
