"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Accessible-dialog behavior for the persistently-rendered overlays
// (survey modal, cart drawer, mobile sheet). When `open` flips true it
// moves focus into the panel and traps Tab/Shift+Tab inside it; on close
// it restores focus to whatever element opened the dialog. Pair with
// `inert={!open}` on the panel so its controls leave the tab order when
// hidden, and the global Escape handler in SiteProvider. WCAG 2.4.3.
export function useDialogA11y(open: boolean, panelRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const prevFocus = document.activeElement as HTMLElement | null;
    const visibleFocusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    const first = visibleFocusables()[0];
    if (first) {
      first.focus();
    } else {
      panel.setAttribute("tabindex", "-1");
      panel.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = visibleFocusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    panel.addEventListener("keydown", onKey);

    return () => {
      panel.removeEventListener("keydown", onKey);
      if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    };
  }, [open, panelRef]);
}
