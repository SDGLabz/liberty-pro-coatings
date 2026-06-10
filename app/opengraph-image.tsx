import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Root Open Graph / Twitter card image. Next.js auto-detects this file and
// injects og:image + twitter:image for every route (detail pages inherit it
// unless they define their own), so social shares stop producing blank cards.
export const runtime = "nodejs";
export const alt = "Liberty Pro Coatings — concrete floor coating systems for the trade";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Real Liberty Pro Coatings emblem, inlined as a data URI (Satori <img> can't
// resolve app-relative paths). Shown on a white tile so it reads on the dark card.
const markSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/brand/liberty-mark.png"),
).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a3a6b 0%, #0c1424 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              width: 84,
              height: 84,
              borderRadius: 18,
              background: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={62} height={59} alt="" />
          </div>
          <div style={{ color: "#ffffff", fontSize: 30, fontWeight: 700, letterSpacing: 3 }}>
            LIBERTY PRO COATINGS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ color: "#ffffff", fontSize: 78, fontWeight: 800, lineHeight: 1.05 }}>
            Concrete floor coatings, built to last.
          </div>
          <div style={{ color: "#9fb0c5", fontSize: 30, marginTop: 26 }}>
            Epoxy · Polyaspartic · Urethane — manufacturer-direct, for the trade
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#9fb0c5",
            fontSize: 24,
          }}
        >
          <span>Made in the USA · Contractor-grade</span>
          <span style={{ color: "#e8b73a" }}>Become an approved contractor →</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
