"use client";

import { useState } from "react";
import type { PackShot } from "@/lib/catalog";

/**
 * Product-detail gallery. Wires up the `.pd-gallery` / `.pd-thumbs` markup that
 * already existed in globals.css but had never been given a second image to
 * show.
 *
 * Frame order is deliberate: the LPC-labelled packaging renders come first (so
 * the detail page opens on the same pail the catalog card showed), and the job
 * photograph is kept as the trailing "In use" frame rather than being dropped —
 * it is still the product's `img` everywhere else on the site.
 *
 * Each frame carries its own alt/aria-label straight from the catalog, so a
 * Part B hardener is never announced as Part A.
 */
export function ProductGallery({
  img,
  imgAlt,
  packShots = [],
}: {
  /** The 4:3 job/finish photograph — this product's existing `img`. */
  img: string;
  imgAlt: string;
  packShots?: PackShot[];
}) {
  const frames = [
    ...packShots.map((s) => ({ src: s.src, alt: s.alt, label: s.component })),
    { src: img, alt: imgAlt, label: "In use" },
  ];
  const [active, setActive] = useState(0);
  const current = frames[active];

  return (
    <div>
      <div className="pd-gallery">
        <div
          className="main"
          role="img"
          aria-label={current.alt}
          style={{ backgroundImage: `url('${current.src}')` }}
        />
      </div>
      {/* One frame = nothing to switch between; render the figure alone. */}
      {frames.length > 1 && (
        <div className="pd-thumbs">
          {frames.map((f, i) => (
            <button
              key={f.src}
              type="button"
              className={`pd-thumb${i === active ? " active" : ""}`}
              style={{ backgroundImage: `url('${f.src}')` }}
              aria-label={`Show ${f.alt}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
