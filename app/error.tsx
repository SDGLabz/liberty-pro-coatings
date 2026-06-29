"use client";

import { useEffect } from "react";
import Link from "next/link";

// Route-level error boundary. Must be a Client Component. Kept self-contained:
// it renders outside the normal page tree, so it relies only on context-free
// CSS (the site's .wrap / .eyebrow / .btn classes + color tokens) — no Header,
// Footer, or provider-backed components.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for monitoring / debugging.
    console.error(error);
  }, [error]);

  return (
    <section
      style={{
        background: "var(--bg-2)",
        borderBottom: "1px solid var(--line)",
        display: "grid",
        placeItems: "center",
        minHeight: "min(72vh, 760px)",
      }}
    >
      <div className="wrap" style={{ maxWidth: 720, textAlign: "center" }}>
        <div
          aria-hidden
          style={{
            width: 66,
            height: 66,
            margin: "0 auto 22px",
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            color: "var(--red)",
            background: "rgba(214, 33, 46, .10)",
            border: "1px solid rgba(214, 33, 46, .22)",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <span
          className="eyebrow"
          style={{ color: "var(--red-ink)", justifyContent: "center" }}
        >
          Something went wrong
        </span>

        <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", margin: "12px 0 14px" }}>
          We hit an unexpected error.
        </h1>

        <p className="lede" style={{ margin: "0 auto 30px" }}>
          This one&rsquo;s on us, not you. Try reloading the page &mdash; if it keeps happening,
          head back home or reach out and we&rsquo;ll get you sorted.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button className="btn btn-primary" type="button" onClick={() => reset()}>
            Try again <span className="ar" aria-hidden>&rarr;</span>
          </button>
          <Link className="btn btn-out" href="/">
            Back to Home
          </Link>
        </div>

        {error?.digest ? (
          <p
            style={{
              marginTop: 24,
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--txt-3)",
            }}
          >
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  );
}
