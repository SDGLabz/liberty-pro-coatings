"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSite } from "./SiteProvider";
import { useDialogA11y } from "./useDialogA11y";
import { useAuth } from "./useAuth";

// Cart drawer. Shows the real line-item cart (anyone can build one freely),
// an estimated subtotal, and a checkout CTA gated by the visitor's sign-in +
// approval status. When empty it falls back to the friendly gate prompt.
export function CartDrawer() {
  const { drawerOpen, closeCart, openSurvey, items, cartSubtotal, setItemQty, removeItem, clearCart } =
    useSite();
  const { loading, loggedIn, status } = useAuth();
  const panelRef = useRef<HTMLElement>(null);
  useDialogA11y(drawerOpen, panelRef);

  const hasItems = items.length > 0;

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

        {hasItems ? (
          <>
            <div className="cart-lines">
              {items.map((it) => (
                <div className="citem" key={`${it.sku}|${it.pkg}|${it.finish}`}>
                  <div
                    className="ci-thumb"
                    style={it.img ? { backgroundImage: `url('${it.img}')` } : undefined}
                    aria-hidden="true"
                  />
                  <div className="ci-main">
                    <div className="ci-top">
                      <div>
                        <div className="ci-sku">{it.sku}</div>
                        <h4 className="ci-name">{it.name}</h4>
                      </div>
                      <button
                        type="button"
                        className="ci-remove"
                        onClick={() => removeItem(it)}
                        aria-label={`Remove ${it.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    {(it.pkg || it.finish) && (
                      <div className="ci-meta">{[it.pkg, it.finish].filter(Boolean).join(" · ")}</div>
                    )}
                    <div className="ci-bottom">
                      <div className="ci-qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setItemQty(it, it.qty - 1)}
                        >
                          −
                        </button>
                        <span>{it.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setItemQty(it, it.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="ci-price">${(it.price * it.qty).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-subtotal">
                <span>Estimated subtotal</span>
                <strong>${cartSubtotal.toLocaleString()}</strong>
              </div>
              <button type="button" className="cart-clear" onClick={clearCart}>
                Clear cart
              </button>
              <p className="cart-note">
                Estimate only — freight &amp; final contractor pricing are confirmed at checkout.
              </p>
              {loading ? (
                // While auth resolves, keep the path open — /checkout is the
                // real, server-side gate, so an approved user is never trapped.
                <Link className="btn btn-primary btn-block" href="/checkout" onClick={closeCart}>
                  Proceed to checkout →
                </Link>
              ) : loggedIn && status === "approved" ? (
                <Link className="btn btn-primary btn-block" href="/checkout" onClick={closeCart}>
                  Proceed to checkout →
                </Link>
              ) : loggedIn ? (
                <>
                  <Link className="btn btn-primary btn-block" href="/account" onClick={closeCart}>
                    Checkout — account under review
                  </Link>
                  <p className="cart-note" style={{ marginTop: 8 }}>
                    You can keep building your cart now; you&apos;ll be able to check out as soon as
                    your application is approved.
                  </p>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-primary btn-block" onClick={openSurvey}>
                    Become an Approved Contractor →
                  </button>
                  <Link
                    className="btn btn-out btn-block"
                    href="/login"
                    onClick={closeCart}
                    style={{ marginTop: 8 }}
                  >
                    Sign in to check out
                  </Link>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="empty">
            <div className="big">🛒</div>
            <p>Your cart is empty.</p>
            <div className="gatebox">
              {loggedIn && status === "approved" ? (
                <>
                  <h4>You&apos;re approved ✓</h4>
                  <p>Your account can check out with freight-inclusive pricing.</p>
                  <Link className="btn btn-primary btn-block" href="/products" onClick={closeCart}>
                    Shop the catalog →
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
        )}
      </aside>
    </>
  );
}
