"use client";

import { useState } from "react";
import { useSite } from "./SiteProvider";

export interface SystemComponent {
  sku: string;
  name: string;
  price: number;
  img: string;
  pkg: string;
}

// "Add all components to cart" for a system detail page — adds one of each
// product the system's build-up uses, then opens the cart. The contractor
// adjusts quantities/packaging in the cart (or uses the coverage calculator
// to size them first).
export function AddSystemToCart({ items }: { items: SystemComponent[] }) {
  const { addToCart } = useSite();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    for (const it of items) {
      addToCart({
        sku: it.sku,
        name: it.name,
        price: it.price,
        img: it.img,
        pkg: it.pkg,
        finish: "",
        qty: 1,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  if (items.length === 0) return null;

  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
      {added ? "Added ✓" : `Add ${items.length} components to cart →`}
    </button>
  );
}
