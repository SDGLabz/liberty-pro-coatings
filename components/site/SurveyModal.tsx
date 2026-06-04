"use client";

import { useRef } from "react";
import { useSite } from "./SiteProvider";
import { useDialogA11y } from "./useDialogA11y";

// Contractor-application survey launcher. One conversion path: every
// "apply / become a contractor / checkout" CTA across the site opens
// THIS modal.
//
// NOTE: front-end only — the form does not submit anywhere yet. Wiring
// it to a real destination (Resend / Supabase row / GoHighLevel) is a
// flagged pre-launch blocker (build-plan §11.6). Inputs are placeholders.
export function SurveyModal() {
  const { surveyOpen, surveyStep, surveyStepCount, closeSurvey, surveyNext, surveyBack } = useSite();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(surveyOpen, panelRef);
  const progress = ((surveyStep + 1) / surveyStepCount) * 100;
  const stepClass = (n: number) => `step-q${surveyStep === n ? " on" : ""}`;

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
          {/* Step 0 — intro / path picker */}
          <div className={stepClass(0)}>
            <h3 className="q">How can we help you get set up?</h3>
            <p className="qsub">
              Liberty Pro sells to vetted, approved contractor installers in the US. Tell us what you
              need and we&apos;ll route you to the right place.
            </p>
            <button type="button" className="path-card" onClick={surveyNext}>
              <div className="pic">📝</div>
              <div>
                <h4>Apply for a contractor account</h4>
                <p>Get approved to check out with freight-inclusive pricing.</p>
              </div>
            </button>
            <button type="button" className="path-card" onClick={surveyNext}>
              <div className="pic">🧰</div>
              <div>
                <h4>Quote a project or kit</h4>
                <p>Tell us the system and square footage; we&apos;ll build the order.</p>
              </div>
            </button>
            <button type="button" className="path-card" onClick={surveyNext}>
              <div className="pic">📦</div>
              <div>
                <h4>Request a sample or color kit</h4>
                <p>See flake, quartz and metallic options in person.</p>
              </div>
            </button>
            <button type="button" className="path-card" onClick={surveyNext}>
              <div className="pic">💬</div>
              <div>
                <h4>Talk to a coatings specialist</h4>
                <p>Spec help, surface prep, or product selection.</p>
              </div>
            </button>
            <p className="foot-note">
              Prefer another way? <a href="/contact">Contact us →</a> · (224) 733-1919
            </p>
          </div>

          {/* Step 1 — business */}
          <div className={stepClass(1)}>
            <h3 className="q">Tell us about your business</h3>
            <p className="qsub">
              Standard contractor onboarding — this verifies you install professionally.
            </p>
            <div className="form">
              <div className="frow two">
                <div className="frow">
                  <label>Company name</label>
                  <input placeholder="Acme Concrete Coatings LLC" />
                </div>
                <div className="frow">
                  <label>Contact name</label>
                  <input placeholder="Jordan Smith" />
                </div>
              </div>
              <div className="frow two">
                <div className="frow">
                  <label>Business email</label>
                  <input type="email" placeholder="jordan@acmecoatings.com" />
                </div>
                <div className="frow">
                  <label>Phone</label>
                  <input placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="frow two">
                <div className="frow">
                  <label>State</label>
                  <input placeholder="IL" />
                </div>
                <div className="frow">
                  <label>Years installing</label>
                  <select defaultValue="Less than 1">
                    <option>Less than 1</option>
                    <option>1–3</option>
                    <option>3–5</option>
                    <option>5+</option>
                  </select>
                </div>
              </div>
              <div className="frow">
                <label>Resale / tax-exempt certificate</label>
                <select defaultValue="I have one on file">
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
              <button type="button" className="btn btn-primary" onClick={surveyNext}>
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
                <label>Primary systems</label>
                <select defaultValue="Flake broadcast / 1-day flake">
                  <option>Flake broadcast / 1-day flake</option>
                  <option>Metallic epoxy</option>
                  <option>MicroQuartz</option>
                  <option>Solid color / pigmented</option>
                  <option>Industrial slurry</option>
                  <option>Mix of the above</option>
                </select>
              </div>
              <div className="frow">
                <label>Typical monthly volume</label>
                <select defaultValue="1–5 jobs">
                  <option>1–5 jobs</option>
                  <option>5–15 jobs</option>
                  <option>15+ jobs</option>
                </select>
              </div>
              <div className="frow">
                <label>Anything we should know?</label>
                <textarea placeholder="Markets you serve, current suppliers, questions…" />
              </div>
            </div>
            <div className="mnav">
              <button type="button" className="btn btn-out" onClick={surveyBack}>
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={surveyNext}>
                Submit application
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
        </div>
      </div>
    </div>
  );
}
