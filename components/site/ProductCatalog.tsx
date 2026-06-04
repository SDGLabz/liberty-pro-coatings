"use client";

import { useMemo, useState } from "react";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { CHEM_LABELS, type Chem, type ProductStatus } from "@/lib/catalog";

// Lightweight item the listing filters on — the page maps the full
// catalog down to this so the client bundle never carries TDS data.
export interface CatalogItem extends ProductCardData {
  role: string;
  family: string;
}

const CHEM_ORDER: Chem[] = ["epoxy", "polyaspartic", "polyurea", "urethane"];
// Quick chips mirror the prototype (Polyurea intentionally omitted there).
const CHEM_CHIPS: Chem[] = ["epoxy", "polyaspartic", "urethane"];
const STATUS_FACETS: [ProductStatus, string][] = [
  ["active-off", "Coming Soon"],
  ["rnd-hold", "In Development"],
];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function ProductCatalog({
  products,
  initialChem,
}: {
  products: CatalogItem[];
  initialChem?: Chem;
}) {
  const [chems, setChems] = useState<Set<Chem>>(
    () => new Set(initialChem ? [initialChem] : []),
  );
  const [roles, setRoles] = useState<Set<string>>(new Set());
  const [families, setFamilies] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<ProductStatus>>(new Set());

  // Facet option lists + counts, derived from the data so they stay correct.
  const roleFacets = useMemo(
    () => [...new Set(products.map((p) => p.role))].sort(),
    [products],
  );
  const familyFacets = useMemo(
    () => [...new Set(products.map((p) => p.family))].sort(),
    [products],
  );
  const count = (key: keyof CatalogItem, value: string) =>
    products.filter((p) => p[key] === value).length;

  const filtered = useMemo(() => {
    const pass = (p: CatalogItem) =>
      (chems.size === 0 || chems.has(p.chem)) &&
      (roles.size === 0 || roles.has(p.role)) &&
      (families.size === 0 || families.has(p.family)) &&
      (statuses.size === 0 || statuses.has(p.status));
    return products
      .filter(pass)
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [products, chems, roles, families, statuses]);

  const setChemChip = (chem: Chem | null) =>
    setChems(chem ? new Set([chem]) : new Set());
  const chipActive = (chem: Chem) => chems.size === 1 && chems.has(chem);

  return (
    <div className="catalog">
      <aside className="filters">
        <div className="fgroup">
          <h4>Chemistry</h4>
          {CHEM_ORDER.map((c) => (
            <label key={c} className="fopt">
              <input
                type="checkbox"
                checked={chems.has(c)}
                onChange={() => setChems((s) => toggle(s, c))}
              />{" "}
              {CHEM_LABELS[c]} <span className="ct">{count("chem", c)}</span>
            </label>
          ))}
        </div>
        <div className="fgroup">
          <h4>Role</h4>
          {roleFacets.map((r) => (
            <label key={r} className="fopt">
              <input
                type="checkbox"
                checked={roles.has(r)}
                onChange={() => setRoles((s) => toggle(s, r))}
              />{" "}
              <span style={{ textTransform: "capitalize" }}>{r}</span>{" "}
              <span className="ct">{count("role", r)}</span>
            </label>
          ))}
        </div>
        <div className="fgroup">
          <h4>Family</h4>
          {familyFacets.map((f) => (
            <label key={f} className="fopt">
              <input
                type="checkbox"
                checked={families.has(f)}
                onChange={() => setFamilies((s) => toggle(s, f))}
              />{" "}
              {f} <span className="ct">{count("family", f)}</span>
            </label>
          ))}
        </div>
        <div className="fgroup">
          <h4>Status</h4>
          {STATUS_FACETS.map(([value, label]) => (
            <label key={value} className="fopt">
              <input
                type="checkbox"
                checked={statuses.has(value)}
                onChange={() => setStatuses((s) => toggle(s, value))}
              />{" "}
              {label} <span className="ct">{count("status", value)}</span>
            </label>
          ))}
        </div>
      </aside>
      <div>
        <div className="catalog-top">
          <span className="count">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </span>
          <div className="filterbar" style={{ margin: 0 }}>
            <button
              type="button"
              className={`chip${chems.size === 0 ? " active" : ""}`}
              onClick={() => setChemChip(null)}
            >
              All
            </button>
            {CHEM_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${chipActive(c) ? " active" : ""}`}
                onClick={() => setChemChip(c)}
              >
                {CHEM_LABELS[c]}
              </button>
            ))}
            <span className="sort">Sort: Featured ▾</span>
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className="pgrid">
            {filtered.map((p) => (
              <ProductCard key={p.sku} p={p} reveal={false} />
            ))}
          </div>
        ) : (
          <p className="lede" style={{ padding: "32px 0" }}>
            No products match those filters.
          </p>
        )}
      </div>
    </div>
  );
}
