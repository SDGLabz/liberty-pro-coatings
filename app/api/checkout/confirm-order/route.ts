import { z } from "zod";
import { getStripe, stripeConfigured } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { upsertOrderFromPaymentIntent } from "@/lib/orders";

// Called by the post-payment success page. Retrieves the PaymentIntent from
// Stripe (authoritative — never trusting the browser for amounts), confirms it
// belongs to the signed-in user, records the order, and returns its status.

export const runtime = "nodejs";

const schema = z.object({ paymentIntentId: z.string().min(1).startsWith("pi_") });

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return Response.json({ ok: false, error: "Checkout isn't configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "Invalid payment reference." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(parsed.data.paymentIntentId);
    // Ownership: the intent must belong to this user (set in metadata at creation).
    if (pi.metadata?.user_id !== user.id) {
      return Response.json({ ok: false, error: "Not your order." }, { status: 403 });
    }
    const items = await upsertOrderFromPaymentIntent(pi);
    const status =
      pi.status === "succeeded" ? "paid" : pi.status === "processing" ? "processing" : "failed";
    return Response.json({ ok: true, status, items });
  } catch (err) {
    console.error("[confirm-order] failed:", err);
    return Response.json({ ok: false, error: "Could not confirm the order." }, { status: 500 });
  }
}
