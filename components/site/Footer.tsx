"use client";

import Link from "next/link";
import { useSite } from "./SiteProvider";

export function Footer() {
  const { openSurvey } = useSite();
  return (
    <footer>
      <div className="wrap">
        <div className="top">
          <div>
            <Link className="logo" href="/" aria-label="Liberty Pro Coatings home" style={{ color: "#fff" }}>
              <img src="/brand/liberty-mark-reverse.svg" alt="" width={42} height={40} />
              <span>Liberty Pro Coatings</span>
            </Link>
            <p className="blurb">
              Manufacturer-direct concrete coating systems for approved contractor installers. A
              brand of American Polymer Group.
            </p>
            <div className="nap">
              (224) 733-1919
              <br />
              info@libertyprocoatings.com
              <br />
              405 Oakwood Ave, Waukegan, IL 60085
            </div>
          </div>
          <div className="cols">
            <h5>Shop</h5>
            <Link href="/products">All Products</Link>
            <Link href="/products?chem=epoxy">Epoxy</Link>
            <Link href="/products?chem=polyaspartic">Polyaspartic</Link>
            <Link href="/products?chem=urethane">Urethane</Link>
            <Link href="/configurator">Build a Kit</Link>
          </div>
          <div className="cols">
            <h5>Explore</h5>
            <Link href="/systems">Systems</Link>
            <Link href="/colors">Colors</Link>
            <Link href="/industries">Industries</Link>
            <Link href="/resources">Resources &amp; TDS</Link>
          </div>
          <div className="cols">
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <button type="button" className="footer-link" onClick={openSurvey}>
              Become a Contractor
            </button>
            <Link href="/contact">Contact</Link>
            <Link href="/legal">Legal &amp; Shipping</Link>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 Liberty Pro Coatings — a brand of American Polymer Group · US shipping</span>
          <span>Card &amp; ACH · Live LTL Freight</span>
        </div>
      </div>
    </footer>
  );
}
