"use client";

import { useState, useEffect, useCallback } from "react";
import type { Color } from "@/lib/catalog";

export type SwatchGroup = { series: string; name: string; colors: Color[] };

// Grouped swatch grid with a click-to-zoom lightbox. Used on /colors (and any
// page that wants the browse-and-enlarge swatch experience). Clicking a swatch
// opens an overlay with the enlarged image; ← / → navigate the full set across
// groups, Esc or a click outside closes it.
export function SwatchGrid({ groups }: { groups: SwatchGroup[] }) {
  const flat = groups.flatMap((g) => g.colors);
  const offsets: number[] = [];
  let acc = 0;
  for (const g of groups) {
    offsets.push(acc);
    acc += g.colors.length;
  }

  const [active, setActive] = useState<number | null>(null);
  const open = active !== null;

  const go = useCallback(
    (delta: number) =>
      setActive((i) => (i === null ? i : (i + delta + flat.length) % flat.length)),
    [flat.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const current = open ? flat[active] : null;

  return (
    <>
      {groups.map((g, gi) => (
        <div key={g.series}>
          <div className="sec-head reveal" style={{ marginTop: 36 }}>
            <div className="l">
              <span className="eyebrow">{g.series}</span>
              <h2 style={{ fontSize: "clamp(24px,3vw,38px)" }}>{g.name}</h2>
            </div>
          </div>
          <div className="swgrid">
            {g.colors.map((c, j) => {
              const idx = offsets[gi] + j;
              return (
                <button
                  key={c.n}
                  type="button"
                  className="swcard reveal"
                  onClick={() => setActive(idx)}
                  aria-label={`View ${c.n} swatch larger`}
                >
                  <div
                    className="chip"
                    style={{
                      backgroundColor: c.c,
                      backgroundImage: `url('${c.img}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="nm">
                    <b>{c.n}</b>
                    <span>{c.s}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {current && (
        <div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={`${current.n} swatch`}
          onClick={() => setActive(null)}
        >
          <button type="button" className="lb-x" aria-label="Close" onClick={() => setActive(null)}>
            ✕
          </button>
          {flat.length > 1 && (
            <button
              type="button"
              className="lb-nav lb-prev"
              aria-label="Previous swatch"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
            >
              ‹
            </button>
          )}
          <figure className="lb-fig" onClick={(e) => e.stopPropagation()}>
            <div
              className="lb-img"
              style={{ backgroundImage: `url('${current.img}')`, backgroundColor: current.c }}
              role="img"
              aria-label={`${current.n} swatch`}
            />
            <figcaption>
              <b>{current.n}</b>
              <span>{current.s}</span>
            </figcaption>
          </figure>
          {flat.length > 1 && (
            <button
              type="button"
              className="lb-nav lb-next"
              aria-label="Next swatch"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
