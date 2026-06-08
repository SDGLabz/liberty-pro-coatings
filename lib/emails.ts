import { Resend } from "resend";
import { SITE } from "./site";

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
