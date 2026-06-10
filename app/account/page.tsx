import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatUsd } from "@/lib/checkout-pricing";
import { getProduct } from "@/lib/catalog";
import { ApprovedNotice } from "@/components/site/ApprovedNotice";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

type OrderRow = {
  id: string;
  status: string;
  payment_method: string;
  amount_total: number;
  items: unknown;
  created_at: string;
};

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "#1a7a48" },
  processing: { label: "Processing", color: "#9a6e00" },
  failed: { label: "Failed", color: "#d6212e" },
  canceled: { label: "Canceled", color: "#5f6f86" },
  refunded: { label: "Refunded", color: "#5f6f86" },
};

const STATUS_UI: Record<string, { label: string; note: string; color: string; bg: string }> = {
  approved: {
    label: "Approved",
    note: "Your account is approved — you can check out with freight-inclusive pricing.",
    color: "#1a7a48",
    bg: "#e8f5ee",
  },
  pending: {
    label: "Under review",
    note: "Thanks for applying. Our team reviews every applicant — we'll email you the moment you're approved.",
    color: "#9a6e00",
    bg: "#fdf4e0",
  },
  rejected: {
    label: "Not approved",
    note: "We weren't able to approve this account. Please contact us at (224) 733-1919.",
    color: "#d6212e",
    bg: "#fde9eb",
  },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, company, phone, status, role")
    .eq("id", user.id)
    .single();

  const { data: ordersData } = await supabase
    .from("orders")
    .select("id, status, payment_method, amount_total, items, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const orderRows = (ordersData ?? []) as unknown as OrderRow[];

  const status = profile?.status ?? "pending";
  const ui = STATUS_UI[status] ?? STATUS_UI.pending;
  const isAdmin = profile?.role === "admin";

  async function signOut() {
    "use server";
    const s = await createClient();
    await s.auth.signOut();
    redirect("/");
  }

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Contractor portal</span>
          <h1>My account.</h1>
          <p className="lede">{profile?.company || profile?.email || user.email}</p>
        </div>
      </section>

      <section>
        <div className="wrap" style={{ maxWidth: 640 }}>
          {status === "approved" ? (
            <ApprovedNotice />
          ) : (
            <div className="featurecard" style={{ marginBottom: 18 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  color: ui.color,
                  background: ui.bg,
                }}
              >
                {ui.label}
              </span>
              <p style={{ marginTop: 12, color: "var(--txt-2)", lineHeight: 1.6 }}>{ui.note}</p>
            </div>
          )}

          <div className="featurecard" style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Account details</h3>
            <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", fontSize: 14 }}>
              <dt style={{ color: "var(--txt-3)" }}>Email</dt>
              <dd>{profile?.email || user.email}</dd>
              {profile?.full_name && (
                <>
                  <dt style={{ color: "var(--txt-3)" }}>Name</dt>
                  <dd>{profile.full_name}</dd>
                </>
              )}
              {profile?.company && (
                <>
                  <dt style={{ color: "var(--txt-3)" }}>Company</dt>
                  <dd>{profile.company}</dd>
                </>
              )}
            </dl>
          </div>

          {orderRows.length > 0 && (
            <div className="featurecard" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Recent orders</h3>
              {orderRows.map((o) => {
                const items = Array.isArray(o.items)
                  ? (o.items as Array<{
                      sku: string;
                      name: string;
                      qty: number;
                      pkg?: string;
                      finish?: string;
                    }>)
                  : [];
                const firstImg = items[0]?.sku ? getProduct(items[0].sku)?.img : undefined;
                const s = ORDER_STATUS[o.status] ?? { label: o.status, color: "#5f6f86" };
                return (
                  <div
                    key={o.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderTop: "1px solid var(--line)",
                      padding: "12px 0",
                    }}
                  >
                    <div
                      className="order-thumb"
                      style={firstImg ? { backgroundImage: `url('${firstImg}')` } : undefined}
                      aria-hidden="true"
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--txt-2)" }}>
                        {new Date(o.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {o.payment_method === "ach" ? "Bank (ACH)" : "Card"}
                      </div>
                      {items.length > 0 && (
                        <div style={{ fontSize: 13, color: "var(--txt-3)" }}>
                          {items
                            .map(
                              (it) =>
                                `${it.name}${it.pkg ? ` · ${it.pkg}` : ""}${it.finish ? ` · ${it.finish}` : ""} ×${it.qty}`,
                            )
                            .join(", ")}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 700 }}>{formatUsd(o.amount_total)}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isAdmin && (
            <div className="featurecard" style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Admin</h3>
              <p style={{ color: "var(--txt-2)", fontSize: 14, marginBottom: 12 }}>
                Review contractor applications and approve who can check out.
              </p>
              <Link className="btn btn-out" href="/admin">
                Open approval queue <span className="ar" aria-hidden>→</span>
              </Link>
            </div>
          )}

          <form action={signOut}>
            <button type="submit" className="btn btn-out">
              Sign out
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
