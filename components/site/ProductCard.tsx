import Link from "next/link";
import { CHEM_LABELS, STATUS_LABELS, imgFor, type Chem, type ProductStatus } from "@/lib/catalog";

// Minimal shape the card needs — both the full `Product` (home, detail)
// and a lightweight client-filtered list (ProductCatalog) satisfy it.
export interface ProductCardData {
  sku: string;
  name: string;
  chem: Chem;
  desc: string;
  pkg: string[];
  price: number;
  status: ProductStatus;
  img: string;
  /** Square/portrait crop for the 1/1 card media. Falls back to `img`. */
  imgCard?: string;
  featured?: boolean;
}

// Shared catalog card (no "use client" — usable from both server and
// client parents). Mirrors the prototype's .card markup exactly.
// `reveal` controls the scroll-in animation; pass false where the card
// can mount after the Effects observer has already run (e.g. the
// client-filtered listing), so it never stays stuck invisible.
// `hero` promotes the card to the dominant featured tile (2×2 span in the
// product grid's default view); only the chrome changes — same markup.
export function ProductCard({
  p,
  reveal = true,
  hero = false,
}: {
  p: ProductCardData;
  reveal?: boolean;
  hero?: boolean;
}) {
  const [statusLabel, statusClass] = STATUS_LABELS[p.status];
  return (
    <Link
      className={`card${hero ? " card--hero" : ""}${reveal ? " reveal" : ""}`}
      href={`/products/${p.sku.toLowerCase()}`}
    >
      <div className="media">
        <div
          className="bg"
          style={{ background: `url('${imgFor(p, "card")}') center/cover no-repeat` }}
        />
        <div className="badges">
          {p.featured && <span className="badge badge-pop">Featured</span>}
          <span className={`status ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>
      <div className="body">
        <div className="sku">
          {p.sku} · {CHEM_LABELS[p.chem]}
        </div>
        <h3>{p.name}</h3>
        <p className="desc">{p.desc}</p>
        <div className="priceline">
          <span className="price">
            ${p.price}
            <small> / {p.pkg[0]}</small>
          </span>
          <span
            className="gated"
            style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--navy)" }}
          >
            View <span className="ar" aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
