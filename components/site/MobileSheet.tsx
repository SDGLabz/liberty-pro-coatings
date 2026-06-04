"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSite } from "./SiteProvider";
import { useDialogA11y } from "./useDialogA11y";
import { NAV } from "./nav";

export function MobileSheet() {
  const { sheetOpen, closeSheet, openSurvey } = useSite();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogA11y(sheetOpen, panelRef);
  return (
    <div
      ref={panelRef}
      className={`sheet${sheetOpen ? " open" : ""}`}
      id="sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!sheetOpen}
    >
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
