"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSite } from "@/components/site/SiteProvider";

// Stripe redirects here after a payment attempt with the PaymentIntent details
// in the URL. We confirm the real status with Stripe (never trust the URL's
// redirect_status alone) and clear the cart once a payment has succeeded or is
// processing. The durable order record is written by the webhook (Batch 3) —
// this page is the customer-facing confirmation.

type ResultState = "loading" | "succeeded" | "processing" | "failed";
type LineItem = { sku?: string; name: string; pkg?: string; finish?: string; qty: number };

function Result() {
  const params = useSearchParams();
  const { clearCart } = useSite();
  const [state, setState] = useState<ResultState>("loading");
  const [items, setItems] = useState<LineItem[]>([]);
  const cleared = useRef(false);

  useEffect(() => {
    const piId = params.get("payment_intent");
    if (!piId) {
      setState("failed");
      return;
    }
    let active = true;
    // The server records the order (verifying the payment with Stripe) and
    // returns its real status — the browser is never trusted for the outcome.
    fetch("/api/checkout/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId: piId }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!active) return;
        const s = data?.status;
        if (r.ok && (s === "paid" || s === "processing")) {
          setState(s === "paid" ? "succeeded" : "processing");
          if (Array.isArray(data?.items)) setItems(data.items as LineItem[]);
          if (!cleared.current) {
            cleared.current = true;
            clearCart();
          }
        } else {
          setState("failed");
        }
      })
      .catch(() => {
        if (active) setState("failed");
      });
    return () => {
      active = false;
    };
  }, [params, clearCart]);

  if (state === "loading") {
    return <p style={{ color: "var(--txt-2)" }}>Confirming your payment…</p>;
  }
  if (state === "failed") {
    return (
      <div className="featurecard" style={{ borderLeft: "4px solid var(--red)" }}>
        <h2 className="co-h">We couldn&apos;t confirm that payment.</h2>
        <p style={{ color: "var(--txt-2)" }}>
          No completed charge was found. Please try again, or call (224) 733-1919.
        </p>
        <Link className="btn btn-primary" href="/checkout">
          Back to checkout
        </Link>
      </div>
    );
  }

  const processing = state === "processing";
  return (
    <div className="featurecard" style={{ borderLeft: "4px solid var(--green)" }}>
      <strong style={{ color: "var(--green)", fontSize: 18 }}>
        {processing ? "✓ Payment received — clearing" : "✓ Payment confirmed"}
      </strong>
      <p style={{ color: "var(--txt-2)", marginTop: 8 }}>
        {processing
          ? "Your bank (ACH) payment is processing and will settle in a few business days. We'll email you when it clears, then your order moves to fulfillment."
          : "Thanks — your payment went through. A receipt and order confirmation will follow by email."}
      </p>
      {items.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0", borderTop: "1px solid var(--line)" }}>
          {items.map((it, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "9px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 14,
              }}
            >
              <span>
                <b>{it.name}</b>
                {(it.pkg || it.finish) && (
                  <span style={{ color: "var(--txt-3)", fontSize: 12, display: "block" }}>
                    {[it.pkg, it.finish].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span style={{ color: "var(--txt-2)", whiteSpace: "nowrap" }}>× {it.qty}</span>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <Link className="btn btn-primary" href="/products">
          Continue shopping
        </Link>
        <Link className="btn btn-out" href="/account">
          View account
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Contractor checkout</span>
          <h1>Order status.</h1>
        </div>
      </section>
      <section>
        <div className="wrap" style={{ maxWidth: 620 }}>
          <Suspense fallback={<p style={{ color: "var(--txt-2)" }}>Loading…</p>}>
            <Result />
          </Suspense>
        </div>
      </section>
    </>
  );
}
