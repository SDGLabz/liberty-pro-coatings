"use client";

import Link from "next/link";
import { useSite } from "./SiteProvider";
import { NAV } from "./nav";

export function MobileSheet() {
  const { sheetOpen, closeSheet, openSurvey } = useSite();
  return (
    <div className={`sheet${sheetOpen ? " open" : ""}`} id="sheet">
      <div className="top">
        <div className="logo">
          <span className="mark">L</span>LPC
        </div>
        <button className="close" onClick={closeSheet} aria-label="Close menu">
          ✕
        </button>
      </div>
      {NAV.map(([label, href]) => (
        <Link key={href} href={href} onClick={closeSheet}>
          {label}
        </Link>
      ))}
      <button
        type="button"
        className="sheet-cta"
        style={{ color: "var(--gold-bright)" }}
        onClick={openSurvey}
      >
        Become a Contractor →
      </button>
    </div>
  );
}
