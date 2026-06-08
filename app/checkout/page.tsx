import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

// Server-side checkout gate. Completing checkout requires an APPROVED
// contractor account — enforced here, server-side, so it can't be bypassed
// from the browser. (The cart + payment themselves arrive with Stripe in a
// later phase; this is the access boundary in front of them.)
export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1) Not signed in.
  if (!user) {
    return (
      <Shell heading="Sign in to check out.">
        <p style={{ color: "var(--txt-2)", marginBottom: 20 }}>
          Checkout is for approved contractor accounts. Sign in, or apply to become an approved
          contractor.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/login">
            Sign in
          </Link>
          <Link className="btn btn-out" href="/login">
            Create an account
          </Link>
        </div>
      </Shell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, company, email")
    .eq("id", user.id)
    .single();
  const status = profile?.status ?? "pending";

  // 2) Signed in but not approved.
  if (status !== "approved") {
    const rejected = status === "rejected";
    return (
      <Shell heading={rejected ? "Account not approved." : "Your account is under review."}>
        <p style={{ color: "var(--txt-2)", marginBottom: 20 }}>
          {rejected
            ? "We weren't able to approve this account for checkout. Please call (224) 733-1919 if you think this is a mistake."
            : "Browsing and building a cart is open to everyone, but completing checkout requires approval. Our team reviews every applicant — we'll email you the moment you're approved."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/account">
            View account status
          </Link>
          <Link className="btn btn-out" href="/products">
            Keep browsing
          </Link>
        </div>
      </Shell>
    );
  }

  // 3) Approved — checkout unlocked. (Cart line items + Stripe payment land in
  // the commerce phase; for now the gate is open and the cart is empty.)
  return (
    <Shell heading="Checkout.">
      <div
        className="featurecard"
        style={{ borderLeft: "4px solid var(--green)", marginBottom: 20 }}
      >
        <strong style={{ color: "#1a7a48" }}>✓ Approved to check out</strong>
        <p style={{ color: "var(--txt-2)", marginTop: 6, fontSize: 14 }}>
          {profile?.company || profile?.email || user.email} — your account is approved for
          freight-inclusive checkout.
        </p>
      </div>
      <p style={{ color: "var(--txt-2)", marginBottom: 20 }}>
        Your cart is empty. Browse the catalog and build an order — card &amp; ACH payment with live
        LTL freight is coming soon.
      </p>
      <Link className="btn btn-primary" href="/products">
        Shop the catalog →
      </Link>
    </Shell>
  );
}

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Contractor checkout</span>
          <h1>{heading}</h1>
        </div>
      </section>
      <section>
        <div className="wrap" style={{ maxWidth: 560 }}>
          {children}
        </div>
      </section>
    </>
  );
}
