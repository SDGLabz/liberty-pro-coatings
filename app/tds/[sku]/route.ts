import { getProduct } from "@/lib/catalog";
import { renderTdsPdf } from "@/lib/tds-pdf";

// On-demand branded TDS PDF, generated from the product's catalog TDS data.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const product = getProduct(sku);
  if (!product || !product.tds) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await renderTdsPdf(product);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="LPC_TDS_${product.sku}.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
