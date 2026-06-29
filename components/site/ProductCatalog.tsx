"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
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
  initialQuery,
}: {
  products: CatalogItem[];
  initialChem?: Chem;
  initialQuery?: string;
}) {
  const [chems, setChems] = useState<Set<Chem>>(
    () => new Set(initialChem ? [initialChem] : []),
  );
  const [roles, setRoles] = useState<Set<string>>(new Set());
  const [families, setFamilies] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<ProductStatus>>(new Set());
  const [query, setQuery] = useState(initialQuery ?? "");

  // Fuzzy search over the catalog (name, SKU, description, role, family,
  // chemistry). Rebuilt only when the product list changes.
  const fuse = useMemo(
    () =>
      new Fuse(products, {
        keys: ["name", "sku", "desc", "role", "family", "chem"],
        threshold: 0.38,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [products],
  );

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
    const q = query.trim();
    // Search first (keeps Fuse relevance order); otherwise the full list.
    const base = q ? fuse.search(q).map((r) => r.item) : products;
    const pass = (p: CatalogItem) =>
      (chems.size === 0 || chems.has(p.chem)) &&
      (roles.size === 0 || roles.has(p.role)) &&
      (families.size === 0 || families.has(p.family)) &&
      (statuses.size === 0 || statuses.has(p.status));
    const out = base.filter(pass);
    // No query → featured-first. With a query → preserve relevance ranking.
    return q ? out : out.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }, [products, fuse, query, chems, roles, families, statuses]);

  const setChemChip = (chem: Chem | null) =>
    setChems(chem ? new Set([chem]) : new Set());
  const chipActive = (chem: Chem) => chems.size === 1 && chems.has(chem);

  // The default view = nothing searched and no facet applied. Only then does
  // the first (featured-first) product get promoted to the dominant hero tile,
  // so the hierarchy never fights search-relevance or filter results.
  const isDefaultView =
    !query.trim() &&
    chems.size === 0 &&
    roles.size === 0 &&
    families.size === 0 &&
    statuses.size === 0;

  // Mobile filters live in a bottom-sheet drawer (the 15-checkbox sidebar is
  // too tall to sit inline above the products on a phone).
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = chems.size + roles.size + families.size + statuses.size;
  const clearAll = () => {
    setChems(new Set());
    setRoles(new Set());
    setFamilies(new Set());
    setStatuses(new Set());
    setQuery("");
  };

  // While the sheet is open: lock body scroll and close on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="catalog">
      {drawerOpen && (
        <div className="filters-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />
      )}
      <aside className={`filters${drawerOpen ? " open" : ""}`} id="filters-panel">
        <div className="drawer-head drawer-only">
          <h3>Filters</h3>
          <button
            type="button"
            className="drawer-x"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>
        <div className="catalog-search drawer-only" style={{ marginBottom: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs…"
            aria-label="Search products"
          />
          {query && (
            <button type="button" className="cs-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
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
        <div className="drawer-foot drawer-only">
          <button type="button" className="btn btn-out" onClick={clearAll}>
            Clear all
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
            Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </button>
        </div>
      </aside>
      <div>
        <div className="filters-bar">
          <button
            type="button"
            className="filters-trigger"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="filters-panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            Filters
            {activeCount > 0 && <span className="fcount">{activeCount}</span>}
          </button>
        </div>
        <div className="catalog-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKUs, specs…"
            aria-label="Search products"
          />
          {query && (
            <button type="button" className="cs-clear" onClick={() => setQuery("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
        <div className="catalog-top">
          <span className="count">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {query.trim() && <> for “{query.trim()}”</>}
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
            <span className="sort">Sort: {query.trim() ? "Relevance" : "Featured"} ▾</span>
          </div>
        </div>
        {filtered.length > 0 ? (
          <div className={`pgrid${isDefaultView ? " pgrid--hero" : ""}`}>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.sku}
                p={p}
                reveal={false}
                hero={isDefaultView && i === 0}
              />
            ))}
          </div>
        ) : (
          <p className="lede" style={{ padding: "32px 0" }}>
            {query.trim()
              ? `No products match “${query.trim()}”. Try a SKU, chemistry, or role.`
              : "No products match those filters."}
          </p>
        )}
      </div>
    </div>
  );
}
