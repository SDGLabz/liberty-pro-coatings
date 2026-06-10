"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripePromise } from "@/lib/stripe/client";
import { useSite } from "@/components/site/SiteProvider";
import {
  ACH_DISCOUNT_PCT,
  computeTotals,
  formatUsd,
  toCents,
  type OrderTotals,
  type PaymentChoice,
} from "@/lib/checkout-pricing";

// The approved-contractor checkout experience. We pick the payment method with
// our OWN toggle (card vs. ACH) because the price differs by method — so each
// choice asks the server for a fresh PaymentIntent locked to that method and
// priced server-side. The Stripe Payment Element then collects just that
// method's details. Test mode until launch — no real charge.

const stripePromise = getStripePromise();

export default function CheckoutClient() {
  const { items } = useSite();
  const [method, setMethod] = useState<PaymentChoice>("card");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [serverTotals, setServerTotals] = useState<OrderTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotalCents = useMemo(
    () => items.reduce((s, i) => s + toCents(i.price) * i.qty, 0),
    [items],
  );
  const localTotals = useMemo(() => computeTotals(subtotalCents, method), [subtotalCents, method]);

  // Create / recreate a PaymentIntent whenever the method or cart changes. The
  // server re-prices from the catalog and returns the authoritative totals; a
  // request counter ignores any stale response that a newer toggle superseded.
  const reqRef = useRef(0);
  useEffect(() => {
    if (items.length === 0) {
      setClientSecret(null);
      return;
    }
    const reqId = ++reqRef.current;
    setLoading(true);
    setError(null);
    setClientSecret(null);
    fetch("/api/checkout/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        items: items.map((i) => ({ sku: i.sku, pkg: i.pkg, finish: i.finish, qty: i.qty })),
      }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (reqId !== reqRef.current) return; // superseded by a newer request
        if (!r.ok || !data.ok) {
          setError(data.error ?? "We couldn't start checkout. Please try again.");
        } else {
          setClientSecret(data.clientSecret);
          setServerTotals(data.totals);
        }
        setLoading(false);
      })
      .catch(() => {
        if (reqId !== reqRef.current) return;
        setError("Network error. Please try again.");
        setLoading(false);
      });
  }, [method, items]);

  if (items.length === 0) {
    return (
      <div className="co-empty featurecard">
        <h2 className="co-h">Your cart is empty.</h2>
        <p style={{ color: "var(--txt-2)" }}>Browse the catalog and build an order.</p>
        <Link className="btn btn-primary" href="/products">
          Shop the catalog <span className="ar" aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  const totals = serverTotals ?? localTotals;
  const elementsOptions: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0a3a6b",
            colorText: "#0e1a2b",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "10px",
          },
        },
      }
    : undefined;

  return (
    <div className="co-grid">
      <div className="co-pay">
        <h2 className="co-h">Payment method</h2>
        <div className="co-methods" role="radiogroup" aria-label="Payment method">
          <button
            type="button"
            role="radio"
            aria-checked={method === "card"}
            className={`co-method${method === "card" ? " is-on" : ""}`}
            onClick={() => setMethod("card")}
          >
            <span className="co-method-t">Credit / debit card</span>
            <span className="co-method-s">Pay the standard total</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={method === "ach"}
            className={`co-method${method === "ach" ? " is-on" : ""}`}
            onClick={() => setMethod("ach")}
          >
            <span className="co-method-t">
              Pay by bank (ACH) <span className="co-save">save {ACH_DISCOUNT_PCT}%</span>
            </span>
            <span className="co-method-s">Lower fees · a few business days to clear</span>
          </button>
        </div>

        {error && (
          <div className="co-error" role="alert">
            {error}
          </div>
        )}
        {loading && <div className="co-loading">Loading secure payment form…</div>}

        {clientSecret && elementsOptions && (
          <Elements key={clientSecret} stripe={stripePromise} options={elementsOptions}>
            <PaymentForm method={method} totals={totals} />
          </Elements>
        )}
      </div>

      <aside className="co-summary">
        <h2 className="co-h">Order summary</h2>
        <ul className="co-lines">
          {items.map((i) => (
            <li key={`${i.sku}|${i.pkg}|${i.finish}`} className="co-line">
              <div className="co-line-main">
                <strong>{i.name}</strong>
                <span className="co-line-sub">
                  {[i.pkg, i.finish].filter(Boolean).join(" · ") || "—"} × {i.qty}
                </span>
              </div>
              <span className="co-line-amt">{formatUsd(toCents(i.price) * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="co-tot">
          <Row label="Subtotal" value={formatUsd(totals.subtotalCents)} />
          {totals.discountCents > 0 && (
            <Row
              label={`ACH discount (${ACH_DISCOUNT_PCT}%)`}
              value={`−${formatUsd(totals.discountCents)}`}
              accent
            />
          )}
          <Row label="Total" value={formatUsd(totals.totalCents)} big />
        </div>
        <p className="co-note">
          Tax &amp; freight are added in a later step. <strong>Test mode</strong> — no real charge.
        </p>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  big,
  accent,
}: {
  label: string;
  value: string;
  big?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`co-row${big ? " co-row-big" : ""}`}>
      <span>{label}</span>
      <span className={accent ? "co-row-accent" : undefined}>{value}</span>
    </div>
  );
}

function PaymentForm({ method, totals }: { method: PaymentChoice; totals: OrderTotals }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErr(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
    });
    // On success Stripe redirects to return_url; reaching here means an
    // immediate validation/card error (no redirect happened).
    if (error) {
      setErr(error.message ?? "Payment failed. Please check your details and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="co-form">
      <PaymentElement />
      {err && (
        <div className="co-error" role="alert">
          {err}
        </div>
      )}
      <button type="submit" className="btn btn-primary co-pay-btn" disabled={!stripe || submitting}>
        {submitting
          ? "Processing…"
          : `Pay ${formatUsd(totals.totalCents)}${method === "ach" ? " by bank" : ""}`}
      </button>
      <p className="co-secure">🔒 Payments secured by Stripe · test mode</p>
    </form>
  );
}
