"use client";

import { useEffect, useState } from "react";

// Dismissible "you're approved" notice on the account page. Once the contractor
// X's it out we remember it in localStorage and never show it again on this
// browser. (Pending / rejected statuses keep their actionable cards instead.)
const KEY = "lpc.approvedNoticeDismissed.v1";

export function ApprovedNotice() {
  // Start hidden, reveal after mount only if not previously dismissed — avoids
  // briefly flashing a notice the user already cleared.
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore blocked storage */
    }
    setShow(false);
  };

  return (
    <div className="featurecard approved-notice" style={{ marginBottom: 18 }}>
      <button
        type="button"
        className="approved-notice-x"
        onClick={dismiss}
        aria-label="Dismiss this notice"
      >
        ✕
      </button>
      <span className="approved-notice-badge">Approved</span>
      <p style={{ marginTop: 12, color: "var(--txt-2)", lineHeight: 1.6, marginRight: 24 }}>
        Your account is approved — you can check out with freight-inclusive pricing.
      </p>
    </div>
  );
}
