"use client";

// ============================================================
// Single source of truth for the interactive chrome state:
// cart, cart drawer, mobile sheet, and the contractor-application
// survey modal. Ported from the prototype's chrome.js so that the
// build-plan principle holds — one conversion path: every "apply /
// become a contractor / checkout wall" CTA opens THE SAME survey.
//
// The cart is a real, line-item cart persisted to localStorage.
// Anyone can build a cart freely (per the funnel); completing
// checkout is gated to approved contractors (server-enforced at
// /checkout). Prices are the public placeholder prices until real
// pricing lands — the cart simply sums what the catalog already
// shows, framed as an estimate (freight + final pricing at checkout).
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

const SURVEY_STEPS = 4; // 0 intro · 1 business · 2 install · 3 received
const CART_KEY = "lpc.cart.v1";

export interface CartItem {
  sku: string;
  name: string;
  /** unit price (public placeholder pricing for now) */
  price: number;
  /** selected packaging label, or "" when not applicable (e.g. configurator kit) */
  pkg: string;
  /** selected finish/color label, or "" */
  finish: string;
  /** optional thumbnail */
  img?: string;
  qty: number;
}

/** What a caller passes to addToCart — qty defaults to 1. */
export type AddCartInput = Omit<CartItem, "qty"> & { qty?: number };

/** Stable identity for a line: same SKU + packaging + finish merges. */
function cartKey(i: { sku: string; pkg: string; finish: string }): string {
  return `${i.sku}|${i.pkg}|${i.finish}`;
}

/**
 * Merge two carts by line identity, taking the larger quantity on a clash so
 * re-syncing the same cart (e.g. on refresh) can never double quantities.
 */
function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const it of [...a, ...b]) {
    const k = cartKey(it);
    const existing = map.get(k);
    if (existing) existing.qty = Math.max(existing.qty, it.qty);
    else map.set(k, { ...it });
  }
  return [...map.values()];
}

interface SiteState {
  // cart
  items: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: AddCartInput) => void;
  setItemQty: (item: CartItem, qty: number) => void;
  removeItem: (item: CartItem) => void;
  clearCart: () => void;
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);

  // Cart sync: signed-in users mirror their cart to the Supabase `carts` table
  // (RLS-scoped to them) so it follows them across devices and survives the
  // apply→approval gap. itemsRef always holds the latest items for the async
  // sign-in merge (avoids a stale closure).
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const userIdRef = useRef<string | null>(null);
  const itemsRef = useRef<CartItem[]>([]);
  itemsRef.current = items;

  // Hydrate the cart from localStorage once on mount. (Initial state is []
  // on both server + client, so there's no hydration mismatch; this just
  // fills it in after mount.)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt/blocked storage */
    }
  }, []);

  // Persist on every change — but skip the very first run so the empty
  // initial state can't clobber a stored cart before hydration lands.
  const firstPersist = useRef(true);
  useEffect(() => {
    if (firstPersist.current) {
      firstPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
    // Mirror to the signed-in user's server cart (RLS scopes it to them).
    const uid = userIdRef.current;
    const supabase = supabaseRef.current;
    if (uid && supabase) {
      supabase
        .from("carts")
        .upsert({ user_id: uid, items, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error("[cart] server sync failed:", error.message);
        });
    }
  }, [items]);

  // On sign-in, merge the local cart with the user's saved server cart and keep
  // syncing; on sign-out, stop syncing but keep the local cart.
  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    let active = true;

    async function syncForUser(uid: string) {
      userIdRef.current = uid;
      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", uid)
        .maybeSingle();
      if (!active || error) return;
      const raw = data?.items;
      const serverItems: CartItem[] = Array.isArray(raw) ? (raw as CartItem[]) : [];
      setItems(mergeCarts(itemsRef.current, serverItems));
    }

    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) syncForUser(data.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) syncForUser(session.user.id);
      else if (event === "SIGNED_OUT") userIdRef.current = null;
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const openCart = useCallback(() => setDrawerOpen(true), []);
  const closeCart = useCallback(() => setDrawerOpen(false), []);
  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const addToCart = useCallback((item: AddCartInput) => {
    const addQty = Math.max(1, item.qty ?? 1);
    setItems((prev) => {
      const key = cartKey(item);
      const idx = prev.findIndex((p) => cartKey(p) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + addQty };
        return next;
      }
      return [...prev, { ...item, qty: addQty }];
    });
    setDrawerOpen(true);
  }, []);

  const setItemQty = useCallback((item: CartItem, qty: number) => {
    const key = cartKey(item);
    const clamped = Math.max(1, Number.isFinite(qty) ? Math.floor(qty) : 1);
    setItems((prev) => prev.map((p) => (cartKey(p) === key ? { ...p, qty: clamped } : p)));
  }, []);

  const removeItem = useCallback((item: CartItem) => {
    const key = cartKey(item);
    setItems((prev) => prev.filter((p) => cartKey(p) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const cartSubtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

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
      items,
      cartCount,
      cartSubtotal,
      addToCart,
      setItemQty,
      removeItem,
      clearCart,
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
      items,
      cartCount,
      cartSubtotal,
      addToCart,
      setItemQty,
      removeItem,
      clearCart,
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
