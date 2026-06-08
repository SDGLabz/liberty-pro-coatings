import { Resend } from "resend";
import {
  buildHubspotMessage,
  formatLeadHtml,
  formatLeadText,
  INTENT_LABEL,
  leadSchema,
  type LeadPayload,
} from "@/lib/leads";
import { createAdminClient, createClient } from "@/lib/supabase/server";

// Contractor-survey submissions land here. We fan out to two destinations:
//   1. Resend  — emails the lead to the LPC inbox (LEAD_TO_EMAIL)
//   2. HubSpot — submits to a HubSpot form (creates/updates a CRM contact)
// Each is independently env-gated, so the site keeps working if only one is
// configured. We only report success when at least one destination actually
// accepted the lead — never a false "received" when nothing was delivered.

export const runtime = "nodejs";

// Basic in-memory rate limit (per server instance). Serverless instances
// aren't shared, so this is a soft defense — combined with the honeypot +
// zod validation it blunts casual abuse without needing an external store.
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(request: Request): boolean {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

type Outcome = "ok" | "unconfigured" | "error";

/** Marks a destination as not-yet-configured (vs a genuine delivery failure). */
class UnconfiguredError extends Error {
  constructor(dest: string) {
    super(`${dest} not configured`);
    this.name = "UnconfiguredError";
  }
}

async function sendEmail(payload: LeadPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!apiKey || !to) throw new UnconfiguredError("resend");

  const from = process.env.LEAD_FROM_EMAIL ?? "Liberty Pro Coatings <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: to.split(",").map((s) => s.trim()).filter(Boolean),
    replyTo: payload.email,
    subject: `New ${INTENT_LABEL[payload.intent]} — ${payload.company}`,
    text: formatLeadText(payload),
    html: formatLeadHtml(payload),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

async function pushToHubspot(payload: LeadPayload): Promise<void> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (!portalId || !formGuid) throw new UnconfiguredError("hubspot");

  const [firstname, ...rest] = payload.contactName.trim().split(/\s+/);
  const lastname = rest.join(" ");
  const fields = [
    { name: "email", value: payload.email },
    { name: "firstname", value: firstname },
    ...(lastname ? [{ name: "lastname", value: lastname }] : []),
    { name: "company", value: payload.company },
    ...(payload.phone ? [{ name: "phone", value: payload.phone }] : []),
    ...(payload.state ? [{ name: "state", value: payload.state }] : []),
    { name: "message", value: buildHubspotMessage(payload) },
  ];

  const res = await fetch(
    `https://api.hsforms.com/submit/v3/integration/submit/${portalId}/${formGuid}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields,
        context: {
          pageUri: payload.pageUri ?? "",
          pageName: "Liberty Pro Coatings — Contractor survey",
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HubSpot ${res.status}: ${body.slice(0, 400)}`);
  }
}

async function saveToDatabase(payload: LeadPayload, userId: string | null): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new UnconfiguredError("database");
  }
  const admin = createAdminClient();
  const { error } = await admin.from("contractor_applications").insert({
    user_id: userId,
    intent: payload.intent,
    company: payload.company,
    contact_name: payload.contactName,
    email: payload.email,
    phone: payload.phone ?? null,
    state: payload.state ?? null,
    years_installing: payload.yearsInstalling ?? null,
    resale_cert: payload.resaleCert ?? null,
    primary_systems: payload.primarySystems ?? null,
    monthly_volume: payload.monthlyVolume ?? null,
    notes: payload.notes ?? null,
  });
  if (error) throw new Error(`Supabase: ${error.message}`);
}

function classify(r: PromiseSettledResult<void>): Outcome {
  if (r.status === "fulfilled") return "ok";
  return r.reason instanceof UnconfiguredError ? "unconfigured" : "error";
}

export async function POST(request: Request) {
  if (rateLimited(request)) {
    return Response.json(
      { ok: false, error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json(
      { ok: false, error: first?.message ?? "Please check the form and try again." },
      { status: 400 },
    );
  }
  const payload = parsed.data;

  // Honeypot: a real visitor never fills this hidden field. Silently accept
  // and drop so bots get a 200 and don't probe further.
  if (payload.companyWebsite && payload.companyWebsite.trim() !== "") {
    return Response.json({ ok: true });
  }

  // Link the application to the submitter's account if they're signed in.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  const labels = ["database", "resend", "hubspot"] as const;
  const results = await Promise.allSettled([
    saveToDatabase(payload, userId),
    sendEmail(payload),
    pushToHubspot(payload),
  ]);
  const outcomes = results.map(classify);

  // Log any genuine failures with detail for debugging (never the lead data).
  results.forEach((r, i) => {
    if (r.status === "rejected" && !(r.reason instanceof UnconfiguredError)) {
      console.error(`[lead] ${labels[i]} delivery failed:`, r.reason);
    }
  });

  const configured = outcomes.filter((o) => o !== "unconfigured");
  const delivered = outcomes.filter((o) => o === "ok");

  if (configured.length === 0) {
    console.error("[lead] no delivery destination configured — lead dropped");
    return Response.json(
      { ok: false, error: "Submissions aren't switched on yet. Please call (224) 733-1919." },
      { status: 503 },
    );
  }
  if (delivered.length === 0) {
    return Response.json(
      { ok: false, error: "We couldn't submit your request. Please try again or call us." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
