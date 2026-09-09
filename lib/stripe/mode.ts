/**
 * Which Stripe mode the storefront is wired to, derived from the publishable
 * key rather than a hand-maintained flag.
 *
 * Deliberately its own module with NO imports. `lib/stripe/client.ts` pulls in
 * `loadStripe` from `@stripe/stripe-js`, so anything importing the mode check
 * from there drags Stripe.js into that page's bundle. The product pages need
 * the answer and have no reason to load Stripe.js, hence the split.
 *
 * Deriving from the key prefix is what makes the pre-launch state self-healing:
 * the "test mode" notices and the suppressed cart both lift by themselves the
 * moment live keys are set, with no second commit to remember. Leaving that to
 * a manual edit is how a live store ends up telling real customers their real
 * payment is not real.
 */
export function isStripeTestMode(): boolean {
  return (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "").startsWith("pk_test_");
}
