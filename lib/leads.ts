// ============================================================
// Lead capture — shared contract between the client survey and the
// /api/lead route handler.
//
// One conversion path on the site = one payload shape here. The survey
// modal builds a `LeadPayload`, POSTs it to /api/lead, and the route
// fans it out to two destinations: a Resend email to the LPC inbox and
// a HubSpot form submission (CRM contact). Keep the field set in sync
// with the inputs in components/site/SurveyModal.tsx.
// ============================================================

import { z } from "zod";

/** The four "what do you need" paths the survey opens with (step 0). */
export const LEAD_INTENTS = ["apply", "quote", "sample", "specialist"] as const;
export type LeadIntent = (typeof LEAD_INTENTS)[number];

/** Human labels for each intent — used in the email subject + body. */
export const INTENT_LABEL: Record<LeadIntent, string> = {
  apply: "Contractor account application",
  quote: "Project / kit quote request",
  sample: "Sample / color kit request",
  specialist: "Specialist consultation request",
};

// Server-side validation schema (zod v4). Required: who they are + a way
// to reach them. Everything else is optional context. Generous max
// lengths guard against abuse without rejecting real submissions.
export const leadSchema = z.object({
  intent: z.enum(LEAD_INTENTS),
  company: z.string().trim().min(1, "Company name is required").max(200),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  email: z.email("A valid email is required").max(200),
  phone: z.string().trim().max(40).optional(),
  state: z.string().trim().max(60).optional(),
  yearsInstalling: z.string().trim().max(40).optional(),
  resaleCert: z.string().trim().max(80).optional(),
  primarySystems: z.string().trim().max(120).optional(),
  monthlyVolume: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
  // Spam honeypot — real users never see/fill this. Any value ⇒ bot.
  companyWebsite: z.string().max(200).optional(),
  // Context for the CRM record (where the form was submitted from).
  pageUri: z.string().max(500).optional(),
});

export type LeadPayload = z.infer<typeof leadSchema>;

/** Ordered (label, value) rows of the meaningful detail, omitting blanks. */
function detailRows(p: LeadPayload): Array<[string, string]> {
  const rows: Array<[string, string | undefined]> = [
    ["Request type", INTENT_LABEL[p.intent]],
    ["Company", p.company],
    ["Contact", p.contactName],
    ["Email", p.email],
    ["Phone", p.phone],
    ["State", p.state],
    ["Years installing", p.yearsInstalling],
    ["Resale / tax-exempt", p.resaleCert],
    ["Primary systems", p.primarySystems],
    ["Monthly volume", p.monthlyVolume],
    ["Notes", p.notes],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1] && r[1].trim()));
}

/** Plain-text body for the Resend email (and a readable fallback). */
export function formatLeadText(p: LeadPayload): string {
  const lines = detailRows(p).map(([k, v]) => `${k}: ${v}`);
  return `New ${INTENT_LABEL[p.intent].toLowerCase()} from libertyprocoatings.com\n\n${lines.join("\n")}\n`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Branded HTML body for the Resend email. */
export function formatLeadHtml(p: LeadPayload): string {
  const rows = detailRows(p)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 14px;border-bottom:1px solid #eef1f5;font:600 12px/1.4 system-ui;color:#6b7a90;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;vertical-align:top">${esc(
          k,
        )}</td><td style="padding:8px 14px;border-bottom:1px solid #eef1f5;font:14px/1.5 system-ui;color:#0f1b2d">${esc(
          v,
        ).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<div style="max-width:600px;margin:0 auto;font-family:system-ui,sans-serif">
    <div style="background:#0a3a6b;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
      <div style="font:700 13px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Liberty Pro Coatings</div>
      <div style="font:700 19px/1.3 system-ui;margin-top:6px">New ${esc(INTENT_LABEL[p.intent])}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eef1f5;border-top:0;border-radius:0 0 10px 10px">${rows}</table>
    <p style="font:12px/1.5 system-ui;color:#94a3b8;margin:14px 2px">Submitted via the contractor survey · reply to reach ${esc(
      p.contactName,
    )} directly.</p>
  </div>`;
}

/**
 * The detail packed into HubSpot's standard `message` property. We map the
 * core identity to default contact fields (email/firstname/lastname/company/
 * phone/state) and fold the contractor-specific answers into `message`, so
 * the HubSpot form only needs default properties — no custom setup required.
 */
export function buildHubspotMessage(p: LeadPayload): string {
  const extra = detailRows(p).filter(
    ([k]) => !["Company", "Contact", "Email", "Phone", "State"].includes(k),
  );
  return extra.map(([k, v]) => `${k}: ${v}`).join("\n");
}
