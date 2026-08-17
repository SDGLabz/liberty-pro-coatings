import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { getProduct, primaryPackShot } from "@/lib/catalog";

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
    // Match the cart/line-item thumbnail: the LPC-labelled pail when one exists,
    // otherwise the product's job photograph.
    const lineImg = product ? (primaryPackShot(product)?.src ?? product.img) : undefined;
    out.push({
      sku,
      name: product?.name ?? sku,
      qty,
      ...(pkg ? { pkg } : {}),
      ...(finish ? { finish } : {}),
      ...(lineImg ? { img: lineImg } : {}),
    });
  }
  return out;
}

function toInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export interface OrderShipping {
  name: string | null;
  phone: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  };
}

/**
 * Normalize the PaymentIntent's shipping block for storage. Returns null when
 * Stripe has no address on the intent — true for every order placed before
 * checkout collected one, and for any intent that failed before confirmation.
 */
function parseShipping(pi: Stripe.PaymentIntent): OrderShipping | null {
  const s = pi.shipping;
  if (!s?.address) return null;
  const a = s.address;
  // A shipping block with no street line is not an address anyone can deliver
  // to — treat it as absent rather than storing a hollow record that looks
  // like fulfillment has what it needs.
  if (!a.line1) return null;
  return {
    name: s.name ?? null,
    phone: s.phone ?? null,
    address: {
      line1: a.line1,
      line2: a.line2 ?? null,
      city: a.city ?? null,
      state: a.state ?? null,
      postal_code: a.postal_code ?? null,
      country: a.country ?? null,
    },
  };
}

/** One-line "1 Example St, Zion, IL 60085" for emails and order lists. */
export function formatShipping(s: OrderShipping | null | undefined): string {
  if (!s) return "";
  const a = s.address;
  const street = [a.line1, a.line2].filter(Boolean).join(", ");
  const region = [a.city, [a.state, a.postal_code].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [s.name, street, region].filter(Boolean).join(" · ");
}

/**
 * Record (or update) the order for a Stripe PaymentIntent. Idempotent on the
 * PaymentIntent id. No-ops for intents that aren't ours (no user_id metadata).
 */
export async function upsertOrderFromPaymentIntent(
  pi: Stripe.PaymentIntent,
): Promise<{ items: OrderItem[]; shipping: OrderShipping | null }> {
  const md = pi.metadata ?? {};
  const userId = md.user_id;
  if (!userId) return { items: [], shipping: null }; // not one of our checkout intents

  const admin = createAdminClient();

  let email: string | null = pi.receipt_email ?? null;
  if (!email) {
    const { data } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    email = data?.email ?? null;
  }

  const items = parseItems(md.items);
  const shipping = parseShipping(pi);
  const base = {
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
  };

  // Only write the address when Stripe actually has one. Both the webhook and
  // the success page call this, and the webhook can fire on an early
  // `processing` event whose intent has no shipping yet — writing null then
  // would wipe an address a later call had already recorded.
  const row = shipping ? { ...base, shipping } : base;

  const { error } = await admin
    .from("orders")
    .upsert(row, { onConflict: "stripe_payment_intent_id" });

  if (error) {
    // The `shipping` column arrives in migration 0005. If the code is deployed
    // before that migration runs, PostgREST rejects the whole row for the one
    // unknown column (PGRST204) — which would stop the order being recorded at
    // all. Recording the order matters more than recording the address, so
    // retry without it. The address is still on the PaymentIntent and still
    // reaches the fulfillment email either way.
    const isMissingColumn =
      shipping && (error.code === "PGRST204" || /shipping/i.test(error.message));
    if (!isMissingColumn) throw new Error(`orders upsert failed: ${error.message}`);

    console.error(
      "[orders] `shipping` column missing — run migration 0005_orders_shipping.sql. " +
        "Recording the order without the address.",
    );
    const { error: retryError } = await admin
      .from("orders")
      .upsert(base, { onConflict: "stripe_payment_intent_id" });
    if (retryError) throw new Error(`orders upsert failed: ${retryError.message}`);
  }

  return { items, shipping };
}
