import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, type Chem } from "@/lib/catalog";
import { ProductCatalog, type CatalogItem } from "@/components/site/ProductCatalog";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Every Liberty Pro coating with full technical data and public pricing — 20 products across epoxy, polyaspartic, polyurea and urethane chemistries.",
  alternates: { canonical: "/products" },
};

const VALID_CHEMS: Chem[] = ["epoxy", "polyaspartic", "polyurea", "urethane"];

// Map the full catalog down to the fields the listing needs (no TDS in
// the client payload).
const ITEMS: CatalogItem[] = PRODUCTS.map((p) => ({
  sku: p.sku,
  name: p.name,
  chem: p.chem,
  desc: p.desc,
  pkg: p.pkg,
  price: p.price,
  status: p.status,
  img: p.img,
  featured: p.featured,
  role: p.role,
  family: p.family,
}));

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ chem?: string; q?: string }>;
}) {
  const { chem, q } = await searchParams;
  const initialChem = VALID_CHEMS.includes(chem as Chem) ? (chem as Chem) : undefined;
  const initialQuery = typeof q === "string" ? q : undefined;

  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Home</Link>
        <span className="sep">/</span>
        <span>Products</span>
      </div>
      <section className="pagehead">
        <div className="wrap">
          <span className="eyebrow">The catalog · this is the shop</span>
          <h1>Products.</h1>
          <p className="lede">
            Every Liberty Pro coating, with full technical data, public pricing, and add-to-cart. 20
            products across epoxy, polyaspartic, polyurea and urethane chemistries. All products
            ship switched off at launch — visible and specced, buyable once activated.
          </p>
        </div>
      </section>
      <section>
        <div className="wrap">
          <ProductCatalog products={ITEMS} initialChem={initialChem} initialQuery={initialQuery} />
        </div>
      </section>
    </>
  );
}
