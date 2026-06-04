"use client";

// ============================================================
// Single source of truth for the interactive chrome state:
// cart, cart drawer, mobile sheet, and the contractor-application
// survey modal. Ported from the prototype's chrome.js so that the
// build-plan principle holds — one conversion path: every "apply /
// become a contractor / checkout wall" CTA opens THE SAME survey.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SURVEY_STEPS = 4; // 0 intro · 1 business · 2 install · 3 received

interface SiteState {
  // cart
  cartCount: number;
  addToCart: () => void;
  // cart drawer
  drawerOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  // mobile nav sheet
  sheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  // contractor survey
  surveyOpen: boolean;
  surveyStep: number;
  surveyStepCount: number;
  openSurvey: () => void;
  closeSurvey: () => void;
  surveyNext: () => void;
  surveyBack: () => void;
}

const SiteContext = createContext<SiteState | null>(null);

export function useSite(): SiteState {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within <SiteProvider>");
  return ctx;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);

  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);
  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const addToCart = useCallback(() => {
    setCartCount((n) => n + 1);
    setDrawerOpen(true);
  }, []);

  const openSurvey = useCallback(() => {
    setSheetOpen(false);
    setSurveyStep(0);
    setSurveyOpen(true);
  }, []);
  const closeSurvey = useCallback(() => setSurveyOpen(false), []);
  const surveyNext = useCallback(
    () => setSurveyStep((s) => Math.min(s + 1, SURVEY_STEPS - 1)),
    [],
  );
  const surveyBack = useCallback(() => setSurveyStep((s) => Math.max(s - 1, 0)), []);

  // lock body scroll whenever an overlay is open
  const overlayOpen = drawerOpen || sheetOpen || surveyOpen;
  useEffect(() => {
    if (overlayOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [overlayOpen]);

  // Escape closes every overlay
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSurveyOpen(false);
        setDrawerOpen(false);
        setSheetOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<SiteState>(
    () => ({
      cartCount,
      addToCart,
      drawerOpen,
      openCart,
      closeCart,
      sheetOpen,
      openSheet,
      closeSheet,
      surveyOpen,
      surveyStep,
      surveyStepCount: SURVEY_STEPS,
      openSurvey,
      closeSurvey,
      surveyNext,
      surveyBack,
    }),
    [
      cartCount,
      addToCart,
      drawerOpen,
      openCart,
      closeCart,
      sheetOpen,
      openSheet,
      closeSheet,
      surveyOpen,
      surveyStep,
      openSurvey,
      closeSurvey,
      surveyNext,
      surveyBack,
    ],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
