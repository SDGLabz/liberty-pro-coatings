"use client";

import { useSite } from "./SiteProvider";

// Cart drawer. In Batch 1 the cart is always empty (no add-to-cart
// buttons exist yet — products land in a later batch), so this shows
// the "build a cart freely / checkout requires approval" gate state.
export function CartDrawer() {
  const { drawerOpen, closeCart, openSurvey } = useSite();
  return (
    <>
      <div
        className={`drawer-bg${drawerOpen ? " open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className={`drawer${drawerOpen ? " open" : ""}`} aria-label="Cart">
        <div className="dh">
          <h3>Your Cart</h3>
          <button className="close" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>
        <div className="empty">
          <div className="big">🛒</div>
          <p>Your cart is empty.</p>
          <div className="gatebox">
            <h4>Build a cart freely</h4>
            <p>
              Anyone can browse, see pricing, and build a cart. Completing checkout requires an
              approved contractor account.
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={openSurvey}>
              Become an Approved Contractor →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
