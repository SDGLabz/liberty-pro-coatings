import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getProduct } from "@/lib/catalog";

// Shared order-recording logic, used by BOTH the post-checkout confirm route
// and the Stripe webhook. The upsert is keyed on the PaymentIntent id, so the
// two paths (browser return + server webhook) can both run safely without ever
// creating a duplicate order. All writes use the service-role client.

type DbStatus = "processing" | "paid" | "failed" | "canceled" | "refunded";

function mapStatus(piStatus: Stripe.PaymentIntent.Status): DbStatus {
  switch (piStatus) {
    case "succeeded":
      return "paid";
    case "processing":
      return "processing";
    case "canceled":
      return "canceled";
    default:
      // requires_payment_method / requires_action / requires_confirmation /
      // requires_capture — none of these is a completed order.
      return "failed";
  }
}

interface OrderItem {
  sku: string;
  name: string;
  qty: number;
}

// metadata.items is a compact "skuxqty, skuxqty" summary set at intent
// creation. Re-expand it and enrich each line with the catalog name.
function parseItems(summary: string | undefined): OrderItem[] {
  if (!summary) return [];
  const out: OrderItem[] = [];
  for (const part of summary.split(",")) {
    const m = part.trim().match(/^(.+)x(\d+)$/);
    if (!m) continue;
    const sku = m[1];
    const qty = parseInt(m[2], 10);
    out.push({ sku, name: getProduct(sku)?.name ?? sku, qty });
  }
  return out;
}

function toInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Record (or update) the order for a Stripe PaymentIntent. Idempotent on the
 * PaymentIntent id. No-ops for intents that aren't ours (no user_id metadata).
 */
export async function upsertOrderFromPaymentIntent(pi: Stripe.PaymentIntent): Promise<void> {
  const md = pi.metadata ?? {};
  const userId = md.user_id;
  if (!userId) return; // not one of our checkout intents

  const admin = createAdminClient();

  let email: string | null = pi.receipt_email ?? null;
  if (!email) {
    const { data } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    email = data?.email ?? null;
  }

  const { error } = await admin.from("orders").upsert(
    {
      user_id: userId,
      stripe_payment_intent_id: pi.id,
      status: mapStatus(pi.status),
      payment_method: md.method === "ach" ? "ach" : "card",
      amount_total: pi.amount,
      subtotal_cents: toInt(md.subtotal_cents, pi.amount),
      discount_cents: toInt(md.discount_cents, 0),
      currency: pi.currency ?? "usd",
      items: parseItems(md.items),
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_payment_intent_id" },
  );
  if (error) throw new Error(`orders upsert failed: ${error.message}`);
}
