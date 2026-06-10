"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { useDialogA11y } from "./useDialogA11y";
import type { LeadIntent, LeadPayload } from "@/lib/leads";

// Contractor-application survey. One conversion path: every "apply / become
// a contractor / checkout" CTA across the site opens THIS modal.
//
// On submit it POSTs the captured fields to /api/lead, which emails the lead
// (Resend) and pushes it to HubSpot. The success screen only shows once a
// destination has actually accepted the submission.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SurveyModal() {
  const { surveyOpen, surveyStep, surveyStepCount, closeSurvey, surveyNext, surveyBack } = useSite();
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useDialogA11y(surveyOpen, panelRef);

  const [intent, setIntent] = useState<LeadIntent>("apply");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fresh start every time the modal opens.
  useEffect(() => {
    if (surveyOpen) {
      setSubmitting(false);
      setErrorMsg("");
      setIntent("apply");
      formRef.current?.reset();
    }
  }, [surveyOpen]);

  const progress = ((surveyStep + 1) / surveyStepCount) * 100;
  const stepClass = (n: number) => `step-q${surveyStep === n ? " on" : ""}`;

  const pick = (next: LeadIntent) => {
    setIntent(next);
    setErrorMsg("");
    surveyNext();
  };

  // Required identity fields all live in step 1.
  const businessValid = (get: (k: string) => string) =>
    Boolean(get("company") && get("contactName") && EMAIL_RE.test(get("email")));

  const reader = () => {
    const fd = new FormData(formRef.current ?? undefined);
    return (k: string) => (fd.get(k)?.toString() ?? "").trim();
  };

  const handleContinue = () => {
    const get = reader();
    if (!businessValid(get)) {
      setErrorMsg("Please add your company, contact name, and a valid business email.");
      return;
    }
    setErrorMsg("");
    surveyNext();
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const get = reader();

    if (!businessValid(get)) {
      setErrorMsg("Please add your company, contact name, and a valid business email.");
      surveyBack(); // back to step 1 where those fields live
      return;
    }

    const payload: LeadPayload = {
      intent,
      company: get("company"),
      contactName: get("contactName"),
      email: get("email"),
      phone: get("phone") || undefined,
      state: get("state") || undefined,
      yearsInstalling: get("yearsInstalling") || undefined,
      resaleCert: get("resaleCert") || undefined,
      primarySystems: get("primarySystems") || undefined,
      monthlyVolume: get("monthlyVolume") || undefined,
      notes: get("notes") || undefined,
      companyWebsite: get("companyWebsite") || undefined,
      pageUri: typeof window !== "undefined" ? window.location.href : undefined,
    };

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again or call (224) 733-1919.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      surveyNext(); // → "Application received" step
    } catch {
      setErrorMsg("Network error. Please try again or call (224) 733-1919.");
      setSubmitting(false);
    }
  }

  const errorBanner = errorMsg ? (
    <p
      role="alert"
      style={{ color: "var(--red)", fontWeight: 600, fontSize: 13, lineHeight: 1.45, margin: "0 0 14px" }}
    >
      {errorMsg}
    </p>
  ) : null;

  return (
    <div
      className={`modal-bg${surveyOpen ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSurvey();
      }}
    >
      <div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-label="Contractor application"
        aria-modal="true"
        inert={!surveyOpen}
      >
        <div className="mh">
          <strong style={{ fontFamily: "var(--head)", textTransform: "uppercase", fontSize: 15 }}>
            Become an Approved Contractor
          </strong>
          <div className="prog">
            <i style={{ width: `${progress}%` }} />
          </div>
          <button className="x" onClick={closeSurvey} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="mb">
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: "contents" }} noValidate>
            {/* Spam honeypot — hidden from real users; bots that fill it are dropped. */}
            <input
              type="text"
              name="companyWebsite"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />

            {/* Step 0 — intro / path picker */}
            <div className={stepClass(0)}>
              <h3 className="q">How can we help you get set up?</h3>
              <p className="qsub">
                Liberty Pro sells to vetted, approved contractor installers in the US. Tell us what you
                need and we&apos;ll route you to the right place.
              </p>
              <button type="button" className="path-card" onClick={() => pick("apply")}>
                <div className="pic">📝</div>
                <div>
                  <h4>Apply for a contractor account</h4>
                  <p>Get approved to check out with freight-inclusive pricing.</p>
                </div>
              </button>
              <button type="button" className="path-card" onClick={() => pick("quote")}>
                <div className="pic">🧰</div>
                <div>
                  <h4>Quote a project or kit</h4>
                  <p>Tell us the system and square footage; we&apos;ll build the order.</p>
                </div>
              </button>
              <button type="button" className="path-card" onClick={() => pick("sample")}>
                <div className="pic">📦</div>
                <div>
                  <h4>Request a sample or color kit</h4>
                  <p>See flake, quartz and metallic options in person.</p>
                </div>
              </button>
              <button type="button" className="path-card" onClick={() => pick("specialist")}>
                <div className="pic">💬</div>
                <div>
                  <h4>Talk to a coatings specialist</h4>
                  <p>Spec help, surface prep, or product selection.</p>
                </div>
              </button>
              <p className="foot-note">
                Prefer another way? <a href="/contact">Contact us <span className="ar" aria-hidden>→</span></a> · (224) 733-1919
              </p>
            </div>

            {/* Step 1 — business */}
            <div className={stepClass(1)}>
              <h3 className="q">Tell us about your business</h3>
              <p className="qsub">
                Standard contractor onboarding — this verifies you install professionally.
              </p>
              {errorBanner}
              <div className="form">
                <div className="frow two">
                  <div className="frow">
                    <label htmlFor="sv-company">Company name</label>
                    <input id="sv-company" name="company" placeholder="Acme Concrete Coatings LLC" />
                  </div>
                  <div className="frow">
                    <label htmlFor="sv-contact">Contact name</label>
                    <input id="sv-contact" name="contactName" placeholder="Jordan Smith" />
                  </div>
                </div>
                <div className="frow two">
                  <div className="frow">
                    <label htmlFor="sv-email">Business email</label>
                    <input
                      id="sv-email"
                      name="email"
                      type="email"
                      placeholder="jordan@acmecoatings.com"
                    />
                  </div>
                  <div className="frow">
                    <label htmlFor="sv-phone">Phone</label>
                    <input id="sv-phone" name="phone" placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div className="frow two">
                  <div className="frow">
                    <label htmlFor="sv-state">State</label>
                    <input id="sv-state" name="state" placeholder="IL" />
                  </div>
                  <div className="frow">
                    <label htmlFor="sv-years">Years installing</label>
                    <select id="sv-years" name="yearsInstalling" defaultValue="Less than 1">
                      <option>Less than 1</option>
                      <option>1–3</option>
                      <option>3–5</option>
                      <option>5+</option>
                    </select>
                  </div>
                </div>
                <div className="frow">
                  <label htmlFor="sv-cert">Resale / tax-exempt certificate</label>
                  <select id="sv-cert" name="resaleCert" defaultValue="I have one on file">
                    <option>I have one on file</option>
                    <option>I&apos;ll provide one</option>
                    <option>Not tax-exempt</option>
                  </select>
                </div>
              </div>
              <div className="mnav">
                <button type="button" className="btn btn-out" onClick={surveyBack}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={handleContinue}>
                  Continue
                </button>
              </div>
            </div>

            {/* Step 2 — install profile */}
            <div className={stepClass(2)}>
              <h3 className="q">What do you install most?</h3>
              <p className="qsub">Helps us prep your account with the right systems and pricing.</p>
              <div className="form">
                <div className="frow">
                  <label htmlFor="sv-systems">Primary systems</label>
                  <select
                    id="sv-systems"
                    name="primarySystems"
                    defaultValue="Flake broadcast / 1-day flake"
                  >
                    <option>Flake broadcast / 1-day flake</option>
                    <option>Metallic epoxy</option>
                    <option>MicroQuartz</option>
                    <option>Solid color / pigmented</option>
                    <option>Industrial slurry</option>
                    <option>Mix of the above</option>
                  </select>
                </div>
                <div className="frow">
                  <label htmlFor="sv-volume">Typical monthly volume</label>
                  <select id="sv-volume" name="monthlyVolume" defaultValue="1–5 jobs">
                    <option>1–5 jobs</option>
                    <option>5–15 jobs</option>
                    <option>15+ jobs</option>
                  </select>
                </div>
                <div className="frow">
                  <label htmlFor="sv-notes">Anything we should know?</label>
                  <textarea
                    id="sv-notes"
                    name="notes"
                    placeholder="Markets you serve, current suppliers, questions…"
                  />
                </div>
              </div>
              {errorBanner}
              <div className="mnav">
                <button type="button" className="btn btn-out" onClick={surveyBack} disabled={submitting}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </div>
            </div>

            {/* Step 3 — received */}
            <div className={stepClass(3)}>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "var(--green)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 30,
                    margin: "0 auto 18px",
                  }}
                >
                  ✓
                </div>
                <h3 className="q" style={{ textAlign: "center" }}>
                  Application received.
                </h3>
                <p
                  className="qsub"
                  style={{ textAlign: "center", maxWidth: "40ch", margin: "0 auto 22px" }}
                >
                  Our team reviews every applicant. Once approved you&apos;ll be able to check out with
                  live freight-inclusive pricing — and your cart will be waiting.
                </p>
                <button type="button" className="btn btn-primary" onClick={closeSurvey}>
                  Keep browsing
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
