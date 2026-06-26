"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { LazyMotion } from "framer-motion";

// The accessibility widget (launcher + panel) is a site-wide overlay, not
// above-the-fold content. We load it with ssr:false and only AFTER the page
// goes idle, so its chunk + framer-motion features land after first paint
// instead of competing with the hero on the LCP critical path.
const AccessibilityMenu = dynamic(
  () =>
    import("@/components/a11y/AccessibilityMenu").then((m) => ({
      default: m.AccessibilityMenu,
    })),
  { ssr: false },
);

// Load the animation feature set from its own async chunk (domAnimation, not
// domMax — the widget uses no drag/layout props). Every `m.*` inside the menu
// gets its features from this provider.
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domAnimation);

export function A11yWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const schedule =
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (cb: () => void) =>
            (window as Window).requestIdleCallback(cb, { timeout: 2500 })
        : (cb: () => void) => window.setTimeout(cb, 1500);
    schedule(() => setReady(true));
  }, []);

  if (!ready) return null;
  return (
    <LazyMotion features={loadFeatures} strict>
      <AccessibilityMenu />
    </LazyMotion>
  );
}
