import type { Metadata } from "next";
import Link from "next/link";
import { SYSTEMS } from "@/lib/catalog";
import { SystemCard } from "@/components/site/SystemCard";
import { SurveyButton } from "@/components/site/SurveyButton";
import { breadcrumbJsonLd } from "@/lib/breadcrumb-schema";

const description =
  "Nine engineered concrete floor systems, primer to topcoat, built from Liberty Pro products. Garage-led, with commercial, industrial and decorative options.";

export const metadata: Metadata = {
  title: "Systems",
  description,
  alternates: { canonical: "/systems" },
  openGraph: { type: "website", title: "Systems · Liberty Pro Coatings", description, url: "/systems" },
  twitter: { title: "Systems · Liberty Pro Coatings", description },
};

export default function SystemsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              { name: "Systems", url: "/systems" },
            ]),
          ),
        }}
      />
      <section className="ihero">
        <div className="photo" style={{ backgroundImage: "url('/images/cat-flake.jpg')" }} />
        <div className="wrap">
          <span className="eyebrow">Nine engineered build-ups</span>
          <h1>Floor systems.</h1>
          <p>
            Each system is a complete, spec&apos;d build-up, primer to topcoat, built from Liberty
            Pro products. Garage-led, with commercial, industrial and decorative options. Pick a
            look or a use, and we&apos;ll show you the layers and the products behind them.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/products">
              Shop Products <span className="ar" aria-hidden>→</span>
            </Link>
            <SurveyButton className="btn btn-out">Become a Contractor</SurveyButton>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="cats bento">
            {[...SYSTEMS]
              .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
              .map((s) => (
                <SystemCard key={s.slug} s={s} />
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
