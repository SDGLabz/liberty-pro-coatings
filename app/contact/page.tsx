import type { Metadata } from "next";
import Link from "next/link";
import { SurveyButton } from "@/components/site/SurveyButton";
import { SurveyLauncher } from "@/components/site/SurveyLauncher";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Liberty Pro Coatings team for product, spec or account questions — or start a contractor application. (224) 733-1919 · info@libertyprocoatings.com.",
  alternates: { canonical: "/contact" },
};

// The contact page launches the shared contractor survey (SurveyLauncher →
// SurveyModal), which submits to /api/lead (Resend email + HubSpot). No inline
// form here, by house rule (one conversion path).
export default function ContactPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Contact</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Get in touch</span>
          <h1>Contact.</h1>
          <p className="lede">
            Questions on products, specs or your account? Reach the Liberty Pro team — or start a
            contractor application.
          </p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="layout">
            <div>
              <div className="sec-head reveal">
                <div className="l">
                  <span className="eyebrow">Start a request</span>
                  <h2>Tell us what you need.</h2>
                </div>
              </div>
              <SurveyLauncher />
            </div>
            <aside className="aside">
              <div className="pd-buy">
                <h3 style={{ fontSize: 18, marginBottom: 14 }}>Liberty Pro Coatings</h3>
                <div
                  className="nap"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    lineHeight: 2,
                    color: "var(--txt-2)",
                  }}
                >
                  (224) 733-1919
                  <br />
                  info@libertyprocoatings.com
                  <br />
                  405 Oakwood Ave
                  <br />
                  Waukegan, IL 60085
                </div>
                <div style={{ marginTop: 16 }}>
                  <SurveyButton className="btn btn-primary btn-block">
                    Become a Contractor <span className="ar" aria-hidden>→</span>
                  </SurveyButton>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
