import { z } from "zod";
import { getStripe, stripeConfigured } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/catalog";
import { computeTotals } from "@/lib/checkout-pricing";

// Creates a Stripe PaymentIntent for the signed-in, APPROVED contractor's
// cart. Two safeguards are the whole point of this route:
//   1. The subtotal is recomputed SERVER-SIDE from the catalog — the prices
//      the browser claims are ignored, so a tampered cart can't change what's
//      charged.
//   2. The PaymentIntent is locked to a SINGLE payment method type, so the
//      discounted (ACH) amount can only ever be paid by bank, and the full
//      (card) amount only by card. The ACH discount is applied here, not in
//      the client.
// Test-mode keys until launch — nothing here moves real money yet.

export const runtime = "nodejs";

const STRIPE_MIN_CENTS = 50; // Stripe rejects charges under $0.50.
const MAX_QTY = 999;

const intentSchema = z.object({
  method: z.enum(["card", "ach"]),
  items: z
    .array(
      z.object({
        sku: z.string().min(1),
        pkg: z.string().default(""),
        finish: z.string().default(""),
        qty: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1, "Your cart is empty."),
});

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return Response.json(
      { ok: false, error: "Checkout isn't switched on yet. Please call (224) 733-1919." },
      { status: 503 },
    );
  }

  // 1) Auth + approval gate — the same server-side boundary as /checkout.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: "Please sign in to check out." }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();
  if (profile?.status !== "approved") {
    return Response.json(
      { ok: false, error: "Your account isn't approved for checkout yet." },
      { status: 403 },
    );
  }

  // 2) Validate the request shape.
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  const parsed = intentSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid cart." },
      { status: 400 },
    );
  }
  const { method, items } = parsed.data;

  // 3) Recompute the subtotal from the catalog — NEVER trust client prices.
  let subtotalCents = 0;
  const skuSummary: string[] = [];
  for (const item of items) {
    const product = getProduct(item.sku);
    if (!product) {
      return Response.json({ ok: false, error: `Unknown product: ${item.sku}` }, { status: 400 });
    }
    subtotalCents += Math.round(product.price * 100) * item.qty;
    skuSummary.push(`${item.sku}x${item.qty}`);
  }

  const totals = computeTotals(subtotalCents, method);
  if (totals.totalCents < STRIPE_MIN_CENTS) {
    return Response.json(
      { ok: false, error: "Order total is below the minimum for online payment." },
      { status: 400 },
    );
  }

  // 4) Create the PaymentIntent, locked to ONE method so the ACH-discounted
  //    amount can only be paid by bank (and the full amount only by card).
  const stripeMethod: "card" | "us_bank_account" = method === "ach" ? "us_bank_account" : "card";
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: totals.totalCents,
      currency: "usd",
      payment_method_types: [stripeMethod],
      ...(method === "ach"
        ? { payment_method_options: { us_bank_account: { verification_method: "automatic" } } }
        : {}),
      metadata: {
        user_id: user.id,
        method,
        subtotal_cents: String(totals.subtotalCents),
        discount_cents: String(totals.discountCents),
        total_cents: String(totals.totalCents),
        items: skuSummary.join(", ").slice(0, 480),
      },
    });

    return Response.json({ ok: true, clientSecret: intent.client_secret, totals });
  } catch (err) {
    console.error("[checkout] create-intent failed:", err);
    return Response.json(
      { ok: false, error: "We couldn't start checkout. Please try again." },
      { status: 500 },
    );
  }
}
