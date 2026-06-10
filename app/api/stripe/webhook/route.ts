import type Stripe from "stripe";
import { getStripe, stripeConfigured } from "@/lib/stripe/server";
import { upsertOrderFromPaymentIntent } from "@/lib/orders";

// Stripe → our server. The authoritative, browser-independent way orders get
// recorded: Stripe POSTs payment events here and we upsert the order (same
// idempotent path as the success page). Requires STRIPE_WEBHOOK_SECRET to be
// set (from the Stripe CLI locally, or the Dashboard webhook in production);
// until then it returns 503 and is effectively off — local testing records
// orders via the success page instead.

export const runtime = "nodejs";

const HANDLED = new Set([
  "payment_intent.succeeded",
  "payment_intent.processing",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) {
    return new Response("Webhook not configured", { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  // Raw body is required for signature verification — do not parse as JSON first.
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (HANDLED.has(event.type)) {
    try {
      await upsertOrderFromPaymentIntent(event.data.object as Stripe.PaymentIntent);
    } catch (err) {
      console.error(`[webhook] failed handling ${event.type}:`, err);
      return new Response("Handler error", { status: 500 }); // 500 → Stripe retries
    }
  }

  return Response.json({ received: true });
}
