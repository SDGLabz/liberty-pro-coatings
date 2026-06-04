import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal & Shipping",
  description:
    "Terms of sale, privacy, shipping & hazmat policy, and product warranty/disclaimer for Liberty Pro Coatings.",
  alternates: { canonical: "/legal" },
};

// Placeholder legal structure — final copy is supplied by counsel before
// launch (flagged content blocker).
export default function LegalPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Legal</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">Policies</span>
          <h1>Legal &amp; shipping.</h1>
          <p className="lede">
            Terms, privacy, shipping &amp; hazmat policy, and product warranty/disclaimer. Placeholder
            structure — final legal copy to be supplied.
          </p>
        </div>
      </section>
      <section>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="tds-sec">
            <h2>Terms of Sale</h2>
            <p>
              Placeholder. Sale terms, order acceptance, pricing, and approved-contractor account
              conditions to be provided.
            </p>
          </div>
          <div className="tds-sec">
            <h2>Privacy Policy</h2>
            <p>
              Placeholder. How Liberty Pro collects, uses and protects contractor and visitor
              information.
            </p>
          </div>
          <div className="tds-sec">
            <h2>Shipping &amp; Hazmat Policy</h2>
            <p>
              US shipping only at launch. Many coatings ship as hazmat LTL freight; live rates are
              calculated at checkout. Operational hazmat readiness (BOL, placarding, trained staff)
              is handled per DOT regulation.
            </p>
          </div>
          <div className="tds-sec">
            <h2>Warranty &amp; Disclaimer</h2>
            <p>
              The information provided in product technical data sheets is general in nature and
              intended for commercial and industrial customers. Nothing shall constitute any warranty
              expressed or implied. Liberty Pro Coatings, 405 Oakwood Ave, Waukegan, IL 60085.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
