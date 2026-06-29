"use client";

import { useState } from "react";
import type { TdsSpecRow, TdsPhysicalRow } from "@/lib/catalog";

/**
 * TDS specification tables with a segmented toggle (Technical | Physical / ASTM)
 * so the ~33 spec rows are layered behind one tap instead of dumped all at once,
 * plus a "Download full TDS" affordance beside the spec block.
 */
export function SpecTables({
  technical,
  physical,
  tdsHref,
}: {
  technical: TdsSpecRow[];
  physical: TdsPhysicalRow[];
  tdsHref: string;
}) {
  const [tab, setTab] = useState<"tech" | "phys">("tech");

  return (
    <div className="specs">
      <div className="specs-bar">
        <div className="seg" role="tablist" aria-label="Specification tables">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "tech"}
            className={`seg-btn${tab === "tech" ? " active" : ""}`}
            onClick={() => setTab("tech")}
          >
            Technical Data
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "phys"}
            className={`seg-btn${tab === "phys" ? " active" : ""}`}
            onClick={() => setTab("phys")}
          >
            Physical / ASTM
          </button>
        </div>
        <a className="specs-dl" href={tdsHref} target="_blank" rel="noopener">
          Download full TDS <span className="ar" aria-hidden>→</span>
        </a>
      </div>

      {tab === "tech" ? (
        <table className="spec-table">
          <tbody>
            {technical.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="spec-table">
          <tbody>
            {physical.map(([k, std, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td className="std">{std}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
