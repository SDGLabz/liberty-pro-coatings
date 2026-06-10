import { Resend } from "resend";
import { SITE } from "./site";
import { formatUsd } from "./checkout-pricing";

// Transactional emails to contractor APPLICANTS (distinct from lib/leads.ts,
// which emails inbound survey leads TO the LPC inbox). Sent from the admin
// approval queue when an account is approved or rejected.
//
// NOTE ON DELIVERABILITY: until a sending domain is verified in Resend, the
// account can only deliver to the Resend account owner — so approval emails to
// real third-party applicants won't arrive until the domain is verified at DNS
// cutover. The code is correct and ready; it just no-ops cleanly if Resend
// isn't configured, and won't throw into the approval flow either way.

export type StatusEmail = {
  to: string;
  name?: string | null;
  company?: string | null;
  status: "approved" | "rejected";
};

const BRAND = "#0a3a6b";

function approvedHtml(name: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0c1424">
    <div style="border-top:4px solid ${BRAND};padding:24px 0 8px">
      <h1 style="font-size:20px;margin:0 0 4px;color:${BRAND}">Liberty Pro Coatings</h1>
      <p style="font-size:12px;color:#d6212e;letter-spacing:1px;margin:0;text-transform:uppercase">Contractor account approved</p>
    </div>
    <p>Hi ${name},</p>
    <p>Good news — your Liberty Pro Coatings contractor account has been <strong>approved</strong>. You can now sign in and complete checkout with freight-inclusive pricing.</p>
    <p style="margin:24px 0">
      <a href="${SITE.url}/login" style="background:${BRAND};color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;display:inline-block">Sign in to your account →</a>
    </p>
    <p style="font-size:13px;color:#5a6b80">Questions? Call us at (224) 733-1919 or reply to this email.</p>
  </div>`;
}

function rejectedHtml(name: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0c1424">
    <div style="border-top:4px solid ${BRAND};padding:24px 0 8px">
      <h1 style="font-size:20px;margin:0 0 4px;color:${BRAND}">Liberty Pro Coatings</h1>
      <p style="font-size:12px;color:#5a6b80;letter-spacing:1px;margin:0;text-transform:uppercase">Account update</p>
    </div>
    <p>Hi ${name},</p>
    <p>Thanks for your interest in a Liberty Pro Coatings contractor account. We weren't able to approve the application at this time.</p>
    <p>If you believe this is a mistake or would like to discuss it, please call us at <strong>(224) 733-1919</strong> — we're happy to help.</p>
    <p style="font-size:13px;color:#5a6b80">You can keep browsing the full catalog, systems, and technical data at ${SITE.url}.</p>
  </div>`;
}

/**
 * Send an approval/rejection email. No-ops (resolves) if Resend isn't
 * configured. Never throws — callers should not let email block approval.
 */
export async function sendStatusEmail({ to, name, company, status }: StatusEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  const from = process.env.LEAD_FROM_EMAIL ?? "Liberty Pro Coatings <onboarding@resend.dev>";
  const greeting = name?.trim() || company?.trim() || "there";
  const resend = new Resend(apiKey);

  const subject =
    status === "approved"
      ? "You're approved — Liberty Pro Coatings"
      : "An update on your Liberty Pro Coatings account";
  const html = status === "approved" ? approvedHtml(greeting) : rejectedHtml(greeting);
  const text =
    status === "approved"
      ? `Hi ${greeting},\n\nYour Liberty Pro Coatings contractor account has been approved. Sign in to start ordering with freight-inclusive pricing: ${SITE.url}/login\n\nQuestions? Call (224) 733-1919.`
      : `Hi ${greeting},\n\nWe weren't able to approve your Liberty Pro Coatings contractor account at this time. If you have questions, call (224) 733-1919.\n\nYou can keep browsing at ${SITE.url}.`;

  try {
    const { error } = await resend.emails.send({ from, to, subject, html, text });
    if (error) console.error(`[emails] status email (${status}) failed:`, error.message);
  } catch (err) {
    console.error(`[emails] status email (${status}) threw:`, err);
  }
}

// ── Order confirmation ────────────────────────────────────────────────────
// Sent once per successful checkout (from the confirm-order route): a receipt
// to the customer and an internal alert to the LPC inbox. Same deliverability
// caveat as above — until a sending domain is verified in Resend, real
// third-party delivery won't arrive; the code no-ops cleanly until then.

export type OrderEmailItem = { name: string; pkg?: string; finish?: string; qty: number };

export type OrderEmail = {
  /** customer email */
  to: string;
  items: OrderEmailItem[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  method: "card" | "ach";
  /** short human reference, e.g. last 8 of the PaymentIntent id */
  orderRef: string;
  /** ACH payment still settling */
  processing?: boolean;
};

function orderRowsHtml(items: OrderEmailItem[]): string {
  return items
    .map((it) => {
      const sub = [it.pkg, it.finish].filter(Boolean).join(" · ");
      return `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #e7ecf3">
          <strong>${it.name}</strong>${sub ? `<br><span style="color:#5a6b80;font-size:13px">${sub}</span>` : ""}
        </td>
        <td style="padding:9px 0;border-bottom:1px solid #e7ecf3;text-align:right;white-space:nowrap;color:#5a6b80">× ${it.qty}</td>
      </tr>`;
    })
    .join("");
}

function totalsHtml(o: OrderEmail): string {
  const discount =
    o.discountCents > 0
      ? `<tr><td style="padding:3px 0;color:#1a7a48">ACH discount</td><td style="padding:3px 0;text-align:right;color:#1a7a48">−${formatUsd(o.discountCents)}</td></tr>`
      : "";
  return `<table style="width:100%;font-size:14px;margin-top:10px">
    <tr><td style="padding:3px 0;color:#5a6b80">Subtotal</td><td style="padding:3px 0;text-align:right">${formatUsd(o.subtotalCents)}</td></tr>
    ${discount}
    <tr><td style="padding:8px 0 0;font-weight:bold;border-top:1px solid #e7ecf3">Total (${o.method === "ach" ? "Bank / ACH" : "Card"})</td><td style="padding:8px 0 0;text-align:right;font-weight:bold;border-top:1px solid #e7ecf3">${formatUsd(o.totalCents)}</td></tr>
  </table>`;
}

function orderText(o: OrderEmail): string {
  const lines = o.items
    .map((it) => {
      const sub = [it.pkg, it.finish].filter(Boolean).join(" · ");
      return `- ${it.name}${sub ? ` (${sub})` : ""} x${it.qty}`;
    })
    .join("\n");
  return `Order ${o.orderRef}\n\n${lines}\n\nSubtotal: ${formatUsd(o.subtotalCents)}${o.discountCents > 0 ? `\nACH discount: -${formatUsd(o.discountCents)}` : ""}\nTotal (${o.method === "ach" ? "Bank/ACH" : "Card"}): ${formatUsd(o.totalCents)}\n\nFreight is quoted before shipment. Questions? (224) 733-1919.`;
}

function receiptHtml(o: OrderEmail): string {
  const note = o.processing
    ? "Your bank (ACH) payment is processing and will settle in a few business days. We'll move your order to fulfillment once it clears."
    : "Your payment went through and your order is moving to fulfillment.";
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0c1424">
    <div style="border-top:4px solid ${BRAND};padding:24px 0 8px">
      <h1 style="font-size:20px;margin:0 0 4px;color:${BRAND}">Liberty Pro Coatings</h1>
      <p style="font-size:12px;color:#d6212e;letter-spacing:1px;margin:0;text-transform:uppercase">Order ${o.orderRef} confirmed</p>
    </div>
    <p>Thanks for your order. ${note}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px">${orderRowsHtml(o.items)}</table>
    ${totalsHtml(o)}
    <p style="font-size:13px;color:#5a6b80;margin-top:22px">Freight is quoted and added before shipment. Questions? Call (224) 733-1919 or reply to this email.</p>
  </div>`;
}

function alertHtml(o: OrderEmail): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0c1424">
    <h2 style="font-size:18px;color:${BRAND};margin:0 0 4px">New order ${o.orderRef} — ${formatUsd(o.totalCents)}</h2>
    <p style="font-size:13px;color:#5a6b80;margin:0 0 14px">Customer: ${o.to || "(unknown)"} · ${o.method === "ach" ? "Bank / ACH" : "Card"}${o.processing ? " · PROCESSING" : ""}</p>
    <table style="width:100%;border-collapse:collapse">${orderRowsHtml(o.items)}</table>
    ${totalsHtml(o)}
  </div>`;
}

/**
 * Send the post-payment order confirmation: a receipt to the customer and an
 * internal alert to the LPC inbox. No-ops if Resend isn't configured; never
 * throws (callers must not let email block the checkout response).
 */
export async function sendOrderConfirmation(o: OrderEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const from = process.env.LEAD_FROM_EMAIL ?? "Liberty Pro Coatings <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  if (o.to) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: o.to,
        subject: `Order ${o.orderRef} confirmed — Liberty Pro Coatings`,
        html: receiptHtml(o),
        text: orderText(o),
      });
      if (error) console.error("[emails] order receipt failed:", error.message);
    } catch (err) {
      console.error("[emails] order receipt threw:", err);
    }
  }

  const notify = process.env.ORDER_NOTIFY_EMAIL ?? process.env.LEAD_TO_EMAIL;
  if (notify) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: notify,
        subject: `New order ${o.orderRef} — ${formatUsd(o.totalCents)}`,
        html: alertHtml(o),
        text: orderText(o),
      });
      if (error) console.error("[emails] order alert failed:", error.message);
    } catch (err) {
      console.error("[emails] order alert threw:", err);
    }
  }
}
