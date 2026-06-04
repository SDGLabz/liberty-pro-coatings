import Link from "next/link";
import type { System } from "@/lib/catalog";

// Shared system "cat" card (no "use client"). The home rail trims
// " System"/" Floor" from the name for a tighter look; the systems
// index shows the full name.
export function SystemCard({
  s,
  cleanName = false,
  reveal = true,
}: {
  s: System;
  cleanName?: boolean;
  reveal?: boolean;
}) {
  const name = cleanName ? s.name.replace(" System", "").replace(" Floor", "") : s.name;
  return (
    <Link className={`cat${reveal ? " reveal" : ""}`} href={`/systems/${s.slug}`}>
      <div className="bg" style={{ background: `url('${s.img}') center/cover no-repeat` }} />
      <span className="ct">{s.tag}</span>
      <h3>{name}</h3>
    </Link>
  );
}
