// On-demand revalidation webhook — the SDG portal POSTs here after an LPC
// product is published so the matching public page refreshes within seconds.
//
//   POST /api/revalidate
//   header: x-revalidate-secret: <REVALIDATE_SECRET>
//   body:   { "type": "product", "slug": "eg-mpe01" }
//
// LPC product pages are force-dynamic and overlay the portal cms_products row,
// so this nudges /products and the product page to re-render with the latest
// overlay (and clears any cached layers).
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "REVALIDATE_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { type?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (body.type !== "product") {
    return NextResponse.json({ ok: false, error: `unknown type "${body.type ?? ""}"` }, { status: 400 });
  }

  const paths = ["/products", ...(body.slug ? [`/products/${body.slug.toLowerCase()}`] : [])];
  for (const p of paths) revalidatePath(p, "page");

  return NextResponse.json({ ok: true, type: "product", slug: body.slug ?? null, revalidated: paths });
}
