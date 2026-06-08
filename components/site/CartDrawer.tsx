"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSite } from "./SiteProvider";
import { useDialogA11y } from "./useDialogA11y";
import { useAuth } from "./useAuth";

// Cart drawer. The cart is always empty for now (no add-to-cart buttons yet —
// products become purchasable in the commerce phase), so this shows the gate
// state, which reflects the visitor's sign-in + approval status.
export function CartDrawer() {
  const { drawerOpen, closeCart, openSurvey } = useSite();
  const { loggedIn, status } = useAuth();
  const panelRef = useRef<HTMLElement>(null);
  useDialogA11y(drawerOpen, panelRef);

  return (
    <>
      <div
        className={`drawer-bg${drawerOpen ? " open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={`drawer${drawerOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        inert={!drawerOpen}
      >
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
            {loggedIn && status === "approved" ? (
              <>
                <h4>You&apos;re approved ✓</h4>
                <p>Your account can check out with freight-inclusive pricing.</p>
                <Link className="btn btn-primary btn-block" href="/checkout" onClick={closeCart}>
                  Proceed to checkout →
                </Link>
              </>
            ) : loggedIn ? (
              <>
                <h4>Account under review</h4>
                <p>
                  You&apos;ll be able to check out as soon as your application is approved — we&apos;ll
                  email you.
                </p>
                <Link className="btn btn-out btn-block" href="/account" onClick={closeCart}>
                  View account status
                </Link>
              </>
            ) : (
              <>
                <h4>Build a cart freely</h4>
                <p>
                  Anyone can browse, see pricing, and build a cart. Completing checkout requires an
                  approved contractor account.
                </p>
                <button type="button" className="btn btn-primary btn-block" onClick={openSurvey}>
                  Become an Approved Contractor →
                </button>
                <Link
                  className="btn btn-out btn-block"
                  href="/login"
                  onClick={closeCart}
                  style={{ marginTop: 8 }}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
