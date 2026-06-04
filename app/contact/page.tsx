import type { Metadata } from "next";
import Link from "next/link";
import { SurveyButton } from "@/components/site/SurveyButton";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Liberty Pro Coatings team for product, spec or account questions — or start a contractor application. (224) 733-1919 · info@libertyprocoatings.com.",
  alternates: { canonical: "/contact" },
};

// NOTE: the message form is a front-end placeholder. Wiring it to a real
// destination (Resend / Supabase / GoHighLevel) is the same flagged
// pre-launch task as the survey (build-plan §11.6).
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
                  <span className="eyebrow">Send a message</span>
                  <h2>Tell us what you need.</h2>
                </div>
              </div>
              <div className="form reveal">
                <div className="frow two">
                  <div className="frow">
                    <label>Name</label>
                    <input placeholder="Jordan Smith" />
                  </div>
                  <div className="frow">
                    <label>Company</label>
                    <input placeholder="Acme Coatings" />
                  </div>
                </div>
                <div className="frow two">
                  <div className="frow">
                    <label>Email</label>
                    <input type="email" placeholder="you@company.com" />
                  </div>
                  <div className="frow">
                    <label>Phone</label>
                    <input placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div className="frow">
                  <label>How can we help?</label>
                  <select defaultValue="Product or spec question">
                    <option>Product or spec question</option>
                    <option>Contractor account</option>
                    <option>Order or freight</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="frow">
                  <label>Message</label>
                  <textarea placeholder="What can we help with?" />
                </div>
                <button type="button" className="btn btn-primary" style={{ width: "fit-content" }}>
                  Send Message
                </button>
              </div>
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
                    Become a Contractor →
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
