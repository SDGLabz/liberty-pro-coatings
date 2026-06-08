import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendStatusEmail } from "@/lib/emails";

export const metadata: Metadata = { title: "Admin — Approvals", robots: { index: false } };
export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  status: string;
  role: string;
  created_at: string;
};
type Application = {
  id: string;
  user_id: string | null;
  intent: string | null;
  company: string;
  contact_name: string;
  email: string;
  phone: string | null;
  state: string | null;
  years_installing: string | null;
  resale_cert: string | null;
  primary_systems: string | null;
  monthly_volume: string | null;
  notes: string | null;
  created_at: string;
};

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  approved: { color: "#1a7a48", bg: "#e8f5ee" },
  pending: { color: "#9a6e00", bg: "#fdf4e0" },
  rejected: { color: "#d6212e", bg: "#fde9eb" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? STATUS_COLOR.pending;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        color: c.color,
        background: c.bg,
      }}
    >
      {status}
    </span>
  );
}

// Shared (non-action) helper — re-checks admin, then flips a profile's status
// and its linked applications. Called by the server actions below.
async function updateStatus(id: string, status: "approved" | "rejected" | "pending") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") return;

  const admin = createAdminClient();
  // Grab the applicant's contact details before flipping status, so we can
  // notify them of an approve/reject decision.
  const { data: applicant } = await admin
    .from("profiles")
    .select("email, full_name, company")
    .eq("id", id)
    .single();

  await admin.from("profiles").update({ status }).eq("id", id);
  const appStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "reviewing";
  await admin.from("contractor_applications").update({ status: appStatus }).eq("user_id", id);

  // Notify the applicant on a final decision. sendStatusEmail never throws and
  // no-ops if Resend isn't configured, so it can't break the approval action.
  if ((status === "approved" || status === "rejected") && applicant?.email) {
    await sendStatusEmail({
      to: applicant.email,
      name: applicant.full_name,
      company: applicant.company,
      status,
    });
  }
  revalidatePath("/admin");
}

async function approveAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (id) await updateStatus(id, "approved");
}
async function rejectAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (id) await updateStatus(id, "rejected");
}

function ApplicationDetail({ app }: { app: Application }) {
  const rows = (
    [
      ["Request", app.intent],
      ["Primary systems", app.primary_systems],
      ["Monthly volume", app.monthly_volume],
      ["Years installing", app.years_installing],
      ["Resale cert", app.resale_cert],
      ["State", app.state],
      ["Phone", app.phone],
      ["Notes", app.notes],
    ] as Array<[string, string | null]>
  ).filter(([, v]) => v && v.trim());
  if (!rows.length) return null;
  return (
    <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 14px", fontSize: 13, marginTop: 10 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt style={{ color: "var(--txt-3)", whiteSpace: "nowrap" }}>{k}</dt>
          <dd style={{ color: "var(--txt-2)" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AdminPage() {
  // Auth gate — admins only.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/account");

  // Read everything with the service-role client (bypasses RLS).
  const admin = createAdminClient();
  const [{ data: profilesData }, { data: appsData }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,email,full_name,company,phone,status,role,created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("contractor_applications")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesData ?? []) as Profile[];
  const apps = (appsData ?? []) as Application[];

  const latestAppByUser = new Map<string, Application>();
  for (const a of apps) {
    if (a.user_id && !latestAppByUser.has(a.user_id)) latestAppByUser.set(a.user_id, a);
  }
  const pending = profiles.filter((p) => p.status === "pending");
  const decided = profiles.filter((p) => p.status !== "pending");
  const anonApps = apps.filter((a) => !a.user_id).slice(0, 25);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Admin</span>
          <h1>Contractor approvals.</h1>
          <p className="lede">
            Review applicants and approve who can check out. {pending.length} awaiting review.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: 860 }}>
          {/* PENDING */}
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Awaiting review ({pending.length})</h2>
          {pending.length === 0 && (
            <p style={{ color: "var(--txt-2)", marginBottom: 32 }}>No pending applicants right now.</p>
          )}
          {pending.map((p) => {
            const app = latestAppByUser.get(p.id);
            return (
              <div className="featurecard" key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{p.company || app?.company || p.email}</strong>
                    <div style={{ fontSize: 13, color: "var(--txt-2)", marginTop: 2 }}>
                      {(p.full_name || app?.contact_name) && <>{p.full_name || app?.contact_name} · </>}
                      {p.email} · signed up {fmtDate(p.created_at)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <form action={approveAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-primary btn-sm">Approve</button>
                    </form>
                    <form action={rejectAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-out btn-sm">Reject</button>
                    </form>
                  </div>
                </div>
                {app ? (
                  <ApplicationDetail app={app} />
                ) : (
                  <p style={{ fontSize: 13, color: "var(--txt-3)", marginTop: 8, fontStyle: "italic" }}>
                    No application form submitted yet — account signup only.
                  </p>
                )}
              </div>
            );
          })}

          {/* ALL ACCOUNTS */}
          <h2 style={{ fontSize: 20, margin: "36px 0 16px" }}>All accounts ({profiles.length})</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--txt-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  <th style={{ padding: "8px 10px" }}>Email</th>
                  <th style={{ padding: "8px 10px" }}>Company</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                  <th style={{ padding: "8px 10px" }}>Change</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px" }}>
                      {p.email}
                      {p.role === "admin" && <span style={{ color: "var(--navy-bright)", fontSize: 12 }}> (admin)</span>}
                    </td>
                    <td style={{ padding: "10px", color: "var(--txt-2)" }}>{p.company || "—"}</td>
                    <td style={{ padding: "10px" }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: "10px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {p.status !== "approved" && (
                          <form action={approveAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" style={{ color: "#1a7a48", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Approve</button>
                          </form>
                        )}
                        {p.status !== "rejected" && (
                          <form action={rejectAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button type="submit" style={{ color: "var(--red)", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Reject</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {profiles.length === 0 && <p style={{ color: "var(--txt-2)" }}>No accounts yet.</p>}

          {/* ANONYMOUS SURVEY LEADS */}
          {anonApps.length > 0 && (
            <>
              <h2 style={{ fontSize: 20, margin: "36px 0 16px" }}>Survey leads (no account)</h2>
              {anonApps.map((a) => (
                <div className="featurecard" key={a.id} style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: 15 }}>{a.company}</strong>
                  <div style={{ fontSize: 13, color: "var(--txt-2)", marginTop: 2 }}>
                    {a.contact_name} · {a.email} · {fmtDate(a.created_at)}
                  </div>
                  <ApplicationDetail app={a} />
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
}
