import type { Metadata } from "next";
import Link from "next/link";
import { SYSTEMS } from "@/lib/catalog";
import { SystemCard } from "@/components/site/SystemCard";
import { SurveyButton } from "@/components/site/SurveyButton";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Nine engineered concrete floor systems — primer to topcoat — built from Liberty Pro products. Garage-led, with commercial, industrial and decorative options.",
  alternates: { canonical: "/systems" },
};

export default function SystemsPage() {
  return (
    <>
      <section className="ihero">
        <div className="photo" style={{ backgroundImage: "url('/images/cat-flake.jpg')" }} />
        <div className="wrap">
          <span className="eyebrow">Nine engineered build-ups</span>
          <h1>Floor systems.</h1>
          <p>
            Each system is a complete, spec&apos;d build-up — primer to topcoat — built from Liberty
            Pro products. Garage-led, with commercial, industrial and decorative options. Pick a
            look or a use, and we&apos;ll show you the layers and the products behind them.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/products">
              Shop Products →
            </Link>
            <SurveyButton className="btn btn-out">Become a Contractor</SurveyButton>
          </div>
        </div>
      </section>
      <section>
        <div className="wrap">
          <div className="cats cols-3">
            {SYSTEMS.map((s) => (
              <SystemCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
