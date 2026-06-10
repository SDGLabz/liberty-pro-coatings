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

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  pkg?: string;
  finish?: string;
  img?: string;
}

// metadata.items is a compact, tilde-separated summary set at intent creation.
// Each line is "sku|pkg|finish|qty" (older orders used the legacy "skuxqty").
// Re-expand each line and enrich it with the catalog name + image.
function parseItems(summary: string | undefined): OrderItem[] {
  if (!summary) return [];
  const out: OrderItem[] = [];
  for (const raw of summary.split("~")) {
    const part = raw.trim();
    if (!part) continue;
    let sku = "";
    let pkg = "";
    let finish = "";
    let qty = NaN;
    if (part.includes("|")) {
      const f = part.split("|");
      sku = f[0] ?? "";
      pkg = f[1] ?? "";
      finish = f[2] ?? "";
      qty = parseInt(f[3] ?? "", 10);
    } else {
      const m = part.match(/^(.+)x(\d+)$/);
      if (m) {
        sku = m[1];
        qty = parseInt(m[2], 10);
      }
    }
    if (!sku || !Number.isFinite(qty) || qty < 1) continue;
    const product = getProduct(sku);
    out.push({
      sku,
      name: product?.name ?? sku,
      qty,
      ...(pkg ? { pkg } : {}),
      ...(finish ? { finish } : {}),
      ...(product?.img ? { img: product.img } : {}),
    });
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
export async function upsertOrderFromPaymentIntent(
  pi: Stripe.PaymentIntent,
): Promise<OrderItem[]> {
  const md = pi.metadata ?? {};
  const userId = md.user_id;
  if (!userId) return []; // not one of our checkout intents

  const admin = createAdminClient();

  let email: string | null = pi.receipt_email ?? null;
  if (!email) {
    const { data } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    email = data?.email ?? null;
  }

  const items = parseItems(md.items);
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
      items,
      email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_payment_intent_id" },
  );
  if (error) throw new Error(`orders upsert failed: ${error.message}`);
  return items;
}
