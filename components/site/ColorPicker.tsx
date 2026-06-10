"use client";

import { useState, useEffect } from "react";
import type { Color } from "@/lib/catalog";

// Compact color control for the buy box: shows the selected swatch + name as a
// trigger, and opens a large, category-grouped picker overlay (lightbox-style)
// so swatches are actually easy to see — without adding a tall grid to the page.
// The overlay goes full-screen on mobile.
export function ColorPicker({
  colors,
  value,
  onChange,
  productName,
}: {
  colors: Color[];
  value: string | null;
  onChange: (v: string | null) => void;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = colors.find((c) => c.n === value) ?? null;

  const groups: { series: string; name: string; colors: Color[] }[] = [];
  for (const c of colors) {
    let g = groups.find((x) => x.series === c.s);
    if (!g) {
      g = { series: c.s, name: c.s.replace(/^\d+\s+/, ""), colors: [] };
      groups.push(g);
    }
    g.colors.push(c);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pick = (n: string | null) => {
    onChange(n);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="color-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span
          className="ct-sw"
          style={
            selected
              ? { backgroundImage: `url('${selected.img}')`, backgroundColor: selected.c }
              : undefined
          }
        />
        <span className="ct-txt">
          <b>{selected ? selected.n : "Choose a color"}</b>
          <span>{selected ? selected.s.replace(/^\d+\s+/, "") : `${colors.length} options · tap to browse`}</span>
        </span>
        <span className="ct-go">
          {selected ? "Change" : "Browse"} <span className="ar" aria-hidden>→</span>
        </span>
      </button>

      {open && (
        <div
          className="cp-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Choose a color"
          onClick={() => setOpen(false)}
        >
          <div className="cp-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cp-head">
              <div>
                <span className="eyebrow">Colors &amp; finishes</span>
                <h3>Choose a color for {productName}</h3>
              </div>
              <button type="button" className="cp-x" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="cp-body">
              {groups.map((g) => (
                <div key={g.series} className="cp-group">
                  <div className="cp-group-head">
                    <h4>{g.name}</h4>
                    <span>{g.colors.length}</span>
                  </div>
                  <div className="cp-grid">
                    {g.colors.map((c) => (
                      <button
                        key={c.n}
                        type="button"
                        className={`cp-sw${value === c.n ? " active" : ""}`}
                        onClick={() => pick(c.n)}
                        aria-pressed={value === c.n}
                      >
                        <span
                          className="cp-chip"
                          style={{ backgroundImage: `url('${c.img}')`, backgroundColor: c.c }}
                        />
                        <span className="cp-name">{c.n}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="cp-foot">
              <button type="button" className="btn btn-out btn-sm" onClick={() => pick(null)}>
                Clear color
              </button>
              <button type="button" className="btn btn-cart btn-sm" onClick={() => setOpen(false)}>
                {selected ? `Use ${selected.n}` : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
