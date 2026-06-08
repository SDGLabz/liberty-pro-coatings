"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteProvider";
import { NAV } from "./nav";

// Solid sticky header — white frosted bar with dark text. (A previous
// "transparent over the dark hero" treatment was removed: the header sits
// ABOVE each hero in normal flow, never behind it, so the transparent state
// left white nav text over the white page background — invisible.)
export function Header() {
  const { cartCount, openCart, openSheet, openSurvey } = useSite();

  // cart-count bump
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount === prevCount.current) return;
    prevCount.current = cartCount;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 260);
    return () => clearTimeout(t);
  }, [cartCount]);

  return (
    <>
      <div className="announce">
        Made in the USA · independently tested · contractor-grade —{" "}
        <button type="button" className="announce-link" onClick={openSurvey}>
          become an approved contractor →
        </button>
      </div>
      <header>
        <div className="wrap nav">
          <Link className="logo" href="/">
            <span className="mark">L</span>Liberty&nbsp;Pro
          </Link>
          <nav className="nav-links">
            {NAV.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="searchbar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input placeholder="Search products, SKUs, specs…" aria-label="Search" />
          </div>
          <div className="nav-right">
            <button className="iconbtn" title="Account" aria-label="Account">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </button>
            <button className="iconbtn" id="cartBtn" title="Cart" aria-label="Cart" onClick={openCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12z" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="18" cy="20" r="1.4" />
                <path d="M6 6 5 2H2" />
              </svg>
              <span className={`cartcount${bump ? " bump" : ""}`}>{cartCount}</span>
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={openSurvey}>
              Become a Contractor
            </button>
          </div>
          <button className="burger" aria-label="Menu" onClick={openSheet}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  );
}
