import type { Metadata } from "next";
import Link from "next/link";
import { getSystem } from "@/lib/catalog";
import { SurveyButton } from "@/components/site/SurveyButton";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Garage-led, every vertical. The same Liberty Pro systems carry from residential garages into commercial, industrial, food & beverage, automotive and institutional floors.",
  alternates: { canonical: "/industries" },
};

// Editorial verticals (not catalog-derived). System slugs resolve to live
// /systems/<slug> pages; labels come from the SYSTEMS data.
const INDUSTRIES = [
  {
    eyebrow: "Flagship use",
    title: "Residential garage.",
    blurb:
      "The problems are specific: hot-tire pickup that lifts cheap coatings, abrasion from daily use, slab moisture, and the homeowner who wants it to look great. Our flake broadcast, 1-day flake and polyaspartic systems are built for exactly this — durable, decorative, and installable in a day.",
    img: "/images/cat-1day.jpg",
    systems: ["flake-broadcast", "pigmented-epoxy-floor"],
  },
  {
    eyebrow: "Vertical",
    title: "Commercial & Retail",
    blurb: "Showrooms, storefronts and offices wanting a durable decorative floor.",
    img: "/images/featured-fin.jpg",
    systems: ["metallic-epoxy", "epoxyscapes-flooring", "flake-broadcast"],
  },
  {
    eyebrow: "Vertical",
    title: "Warehouse & Industrial",
    blurb: "High-traffic, high-load floors needing impact and chemical resistance.",
    img: "/images/cat-pig.jpg",
    systems: ["solid-slurry", "pigmented-epoxy-floor", "microquartz-floor"],
  },
  {
    eyebrow: "Vertical",
    title: "Food & Beverage",
    blurb: "Hygienic, slip-resistant, washdown-ready surfaces.",
    img: "/images/cat-quartz.jpg",
    systems: ["microquartz-floor", "solid-slurry"],
  },
  {
    eyebrow: "Vertical",
    title: "Automotive",
    blurb: "Dealerships, service bays and detail shops.",
    img: "/images/cat-flake.jpg",
    systems: ["flake-broadcast", "metallic-epoxy"],
  },
  {
    eyebrow: "Vertical",
    title: "Institutional",
    blurb: "Schools, healthcare and public buildings.",
    img: "/images/cat-metal.jpg",
    systems: ["microquartz-floor", "pigmented-epoxy-floor"],
  },
];

function SystemPills({ slugs }: { slugs: string[] }) {
  return (
    <div className="opt-pills">
      {slugs.map((slug) => {
        const s = getSystem(slug);
        if (!s) return null;
        return (
          <Link key={slug} className="opt-pill" href={`/systems/${slug}`}>
            {s.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function IndustriesPage() {
  const [flagship, ...verticals] = INDUSTRIES;

  return (
    <>
      <section className="ihero">
        <div className="photo" style={{ backgroundImage: "url('/images/cat-1day.jpg')" }} />
        <div className="wrap">
          <span className="eyebrow">Garage-led · every vertical</span>
          <h1>Where Liberty Pro works.</h1>
          <p>
            Residential garage is our flagship — but the same systems carry into commercial,
            industrial, food &amp; beverage, automotive and institutional floors. Find the systems
            and products built for your jobs.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/products">
              Shop Products <span className="ar" aria-hidden>→</span>
            </Link>
            <Link className="btn btn-out" href="/systems">
              Browse Systems
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Industries</span>
      </div>

      <section>
        <div className="wrap">
          {/* Flagship — text left, visual right */}
          <div className="twocol reveal">
            <div>
              <span className="eyebrow">{flagship.eyebrow}</span>
              <h2 style={{ fontSize: "clamp(26px,3.6vw,44px)", margin: "12px 0 14px" }}>
                {flagship.title}
              </h2>
              <p className="lede" style={{ marginBottom: 14 }}>
                {flagship.blurb}
              </p>
              <SystemPills slugs={flagship.systems} />
              <div style={{ marginTop: 18 }}>
                <Link className="btn btn-primary" href="/industries/residential-garage">
                  Explore residential garage <span className="ar" aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="visual" style={{ backgroundImage: `url('${flagship.img}')` }} />
          </div>

          {/* Verticals — visual left, text right */}
          {verticals.map((v) => (
            <div className="twocol reveal" style={{ marginTop: 46 }} key={v.title}>
              <div className="visual" style={{ backgroundImage: `url('${v.img}')` }} />
              <div>
                <span className="eyebrow">{v.eyebrow}</span>
                <h2 style={{ fontSize: "clamp(24px,3.2vw,38px)", margin: "12px 0 12px" }}>
                  {v.title}
                </h2>
                <p className="lede" style={{ marginBottom: 16 }}>
                  {v.blurb}
                </p>
                <SystemPills slugs={v.systems} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="wrap">
          <div className="cta-panel reveal">
            <div className="bg" />
            <div className="grid-tex" />
            <div className="inner">
              <span className="eyebrow">For installers</span>
              <h2>Stock the systems your market needs.</h2>
              <p>Get approved to buy direct with freight-inclusive pricing.</p>
              <div className="cta-row">
                <SurveyButton className="btn btn-primary">Become a Contractor <span className="ar" aria-hidden>→</span></SurveyButton>
                <Link className="btn btn-out" href="/products">
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
