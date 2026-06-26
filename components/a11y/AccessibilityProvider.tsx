"use client";
// Accessibility widget — state store + effect applier.
// Mirrors the lib/providers.tsx pattern: a small React context persisted to
// localStorage. A single effect reflects the current settings onto <html>
// (classes + CSS vars); the override styles live in globals.css. Content
// adjustments (A3a–b) live here; later sub-stages add color / orientation /
// profiles by extending this same shape + the same CSS hooks.
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type TextAlign = "default" | "left" | "center" | "right";
export type Contrast = "default" | "dark" | "light" | "high";
export type Saturation = "default" | "high" | "low" | "mono";
export type BigCursor = "default" | "black" | "white";

export interface A11ySettings {
  fontScale: number; // -2..+5; 0 = default
  lineHeight: number; // 0..3; 0 = default
  letterSpacing: number; // 0..3; 0 = default
  readableFont: boolean;
  highlightLinks: boolean;
  highlightTitles: boolean;
  textAlign: TextAlign;
  textMagnifier: boolean;
  contrast: Contrast;
  saturation: Saturation;
  recolorText: string | null;
  recolorTitle: string | null;
  recolorBg: string | null;
  stopAnimations: boolean;
  hideImages: boolean;
  bigCursor: BigCursor;
  highlightFocus: boolean;
  highlightHover: boolean;
  muteSounds: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  readMode: boolean;
}

// One-click profiles (A3e). Each bundles a set of the settings above; turning
// one ON merges its `apply`, turning it OFF reverts exactly those keys back to
// their DEFAULTS. Active profiles ride the persisted settings object.
export type ProfileKey =
  | "seizureSafe"
  | "visionImpaired"
  | "adhdFriendly"
  | "cognitive"
  | "keyboardNav"
  | "blindUsers"
  | "olderAdults";

export const PROFILE_APPLY: Record<ProfileKey, Partial<A11ySettings>> = {
  seizureSafe: { stopAnimations: true, saturation: "low" },
  visionImpaired: {
    fontScale: 2,
    contrast: "high",
    highlightLinks: true,
    lineHeight: 1,
  },
  adhdFriendly: { readingMask: true, saturation: "low", highlightLinks: true },
  cognitive: {
    readableFont: true,
    highlightTitles: true,
    highlightLinks: true,
    readingGuide: true,
  },
  keyboardNav: { highlightFocus: true },
  blindUsers: { highlightLinks: true, highlightFocus: true, readableFont: true },
  olderAdults: {
    fontScale: 2,
    lineHeight: 1,
    readableFont: true,
    highlightLinks: true,
    bigCursor: "black",
  },
};

export const PROFILE_ORDER: ProfileKey[] = [
  "seizureSafe",
  "visionImpaired",
  "adhdFriendly",
  "cognitive",
  "keyboardNav",
  "blindUsers",
  "olderAdults",
];

const DEFAULTS: A11ySettings = {
  fontScale: 0,
  lineHeight: 0,
  letterSpacing: 0,
  readableFont: false,
  highlightLinks: false,
  highlightTitles: false,
  textAlign: "default",
  textMagnifier: false,
  contrast: "default",
  saturation: "default",
  recolorText: null,
  recolorTitle: null,
  recolorBg: null,
  stopAnimations: false,
  hideImages: false,
  bigCursor: "default",
  highlightFocus: false,
  highlightHover: false,
  muteSounds: false,
  readingGuide: false,
  readingMask: false,
  readMode: false,
};

const STORAGE_KEY = "lpc:a11y";
const FONT_STEP = 0.1; // 10% per step
const LINE_HEIGHTS = ["", "1.5", "1.75", "2"]; // indexed by step (0 = default)
const LETTER_SPACINGS = ["", "0.05em", "0.1em", "0.15em"];

type StepKey = "fontScale" | "lineHeight" | "letterSpacing";
const STEP_RANGE: Record<StepKey, [number, number]> = {
  fontScale: [-2, 5],
  lineHeight: [0, 3],
  letterSpacing: [0, 3],
};

interface A11yContextValue {
  settings: A11ySettings;
  set: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  step: (key: StepKey, dir: 1 | -1) => void;
  reset: () => void;
  /** Profiles currently switched on (their bundles are merged into settings). */
  activeProfiles: Set<ProfileKey>;
  /** Turn a one-click profile on (merge its bundle) or off (revert its keys). */
  applyProfile: (key: ProfileKey, on: boolean) => void;
  /** How many settings differ from default — drives the launcher badge. */
  activeCount: number;
}

const Ctx = createContext<A11yContextValue | null>(null);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS);
  const [activeProfiles, setActiveProfiles] = useState<Set<ProfileKey>>(
    () => new Set(),
  );
  const [hydrated, setHydrated] = useState(false);

  // Load any persisted choices once on mount. Active profiles ride the same
  // serialized object under a reserved `_profiles` array.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<A11ySettings> & {
          _profiles?: ProfileKey[];
        };
        const { _profiles, ...rest } = parsed;
        setSettings({ ...DEFAULTS, ...rest });
        if (Array.isArray(_profiles)) {
          setActiveProfiles(
            new Set(_profiles.filter((p) => p in PROFILE_APPLY)),
          );
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist + apply to <html> whenever settings change.
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...settings, _profiles: [...activeProfiles] }),
        );
      } catch {}
    }
    const html = document.documentElement;

    html.style.setProperty(
      "--a11y-font-scale",
      String(1 + settings.fontScale * FONT_STEP),
    );
    html.classList.toggle("a11y-font-scaled", settings.fontScale !== 0);

    if (settings.lineHeight > 0) {
      html.style.setProperty(
        "--a11y-line-height",
        LINE_HEIGHTS[settings.lineHeight],
      );
    }
    html.classList.toggle("a11y-line-height", settings.lineHeight > 0);

    if (settings.letterSpacing > 0) {
      html.style.setProperty(
        "--a11y-letter-spacing",
        LETTER_SPACINGS[settings.letterSpacing],
      );
    }
    html.classList.toggle("a11y-letter-spacing", settings.letterSpacing > 0);

    html.classList.toggle("a11y-readable-font", settings.readableFont);
    html.classList.toggle("a11y-highlight-links", settings.highlightLinks);
    html.classList.toggle("a11y-highlight-titles", settings.highlightTitles);

    html.classList.toggle("a11y-align-left", settings.textAlign === "left");
    html.classList.toggle("a11y-align-center", settings.textAlign === "center");
    html.classList.toggle("a11y-align-right", settings.textAlign === "right");

    // Contrast — token overrides (one class at most), NOT a root filter.
    html.classList.toggle(
      "a11y-contrast-dark",
      settings.contrast === "dark",
    );
    html.classList.toggle(
      "a11y-contrast-light",
      settings.contrast === "light",
    );
    html.classList.toggle(
      "a11y-contrast-high",
      settings.contrast === "high",
    );

    // Saturation — CSS filters applied to #a11y-root (not <html>, so the
    // fixed widget keeps its positioning).
    html.classList.toggle(
      "a11y-saturate-high",
      settings.saturation === "high",
    );
    html.classList.toggle(
      "a11y-saturate-low",
      settings.saturation === "low",
    );
    html.classList.toggle(
      "a11y-saturate-mono",
      settings.saturation === "mono",
    );

    // Recolor — optional color overrides via CSS vars + a toggle class.
    if (settings.recolorText) {
      html.style.setProperty("--a11y-recolor-text", settings.recolorText);
    }
    html.classList.toggle("a11y-recolor-text", settings.recolorText !== null);
    if (settings.recolorTitle) {
      html.style.setProperty("--a11y-recolor-title", settings.recolorTitle);
    }
    html.classList.toggle("a11y-recolor-title", settings.recolorTitle !== null);
    if (settings.recolorBg) {
      html.style.setProperty("--a11y-recolor-bg", settings.recolorBg);
    }
    html.classList.toggle("a11y-recolor-bg", settings.recolorBg !== null);

    html.classList.toggle("a11y-stop-motion", settings.stopAnimations);

    // Orientation adjustments (A3d).
    html.classList.toggle("a11y-hide-images", settings.hideImages);
    html.classList.toggle("a11y-cursor-black", settings.bigCursor === "black");
    html.classList.toggle("a11y-cursor-white", settings.bigCursor === "white");
    html.classList.toggle("a11y-highlight-focus", settings.highlightFocus);
    html.classList.toggle("a11y-highlight-hover", settings.highlightHover);
    html.classList.toggle("a11y-read-mode", settings.readMode);
  }, [settings, activeProfiles, hydrated]);

  const set = useCallback(
    <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
      setSettings((s) => ({ ...s, [key]: value }));
    },
    [],
  );

  const step = useCallback((key: StepKey, dir: 1 | -1) => {
    setSettings((s) => {
      const [min, max] = STEP_RANGE[key];
      return { ...s, [key]: Math.max(min, Math.min(max, s[key] + dir)) };
    });
  }, []);

  // Turn a profile on (merge its bundle) or off (revert exactly its keys back
  // to DEFAULTS). Multiple profiles may be on at once; later ones merge.
  const applyProfile = useCallback((key: ProfileKey, on: boolean) => {
    const bundle = PROFILE_APPLY[key];
    setSettings((s) => {
      if (on) return { ...s, ...bundle };
      const next = { ...s };
      (Object.keys(bundle) as (keyof A11ySettings)[]).forEach((k) => {
        (next[k] as A11ySettings[typeof k]) = DEFAULTS[k];
      });
      return next;
    });
    setActiveProfiles((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULTS);
    setActiveProfiles(new Set());
  }, []);

  const activeCount =
    (settings.fontScale !== 0 ? 1 : 0) +
    (settings.lineHeight !== 0 ? 1 : 0) +
    (settings.letterSpacing !== 0 ? 1 : 0) +
    (settings.readableFont ? 1 : 0) +
    (settings.highlightLinks ? 1 : 0) +
    (settings.highlightTitles ? 1 : 0) +
    (settings.textAlign !== "default" ? 1 : 0) +
    (settings.textMagnifier ? 1 : 0) +
    (settings.contrast !== "default" ? 1 : 0) +
    (settings.saturation !== "default" ? 1 : 0) +
    (settings.recolorText !== null ? 1 : 0) +
    (settings.recolorTitle !== null ? 1 : 0) +
    (settings.recolorBg !== null ? 1 : 0) +
    (settings.stopAnimations ? 1 : 0) +
    (settings.hideImages ? 1 : 0) +
    (settings.bigCursor !== "default" ? 1 : 0) +
    (settings.highlightFocus ? 1 : 0) +
    (settings.highlightHover ? 1 : 0) +
    (settings.muteSounds ? 1 : 0) +
    (settings.readingGuide ? 1 : 0) +
    (settings.readingMask ? 1 : 0) +
    (settings.readMode ? 1 : 0);

  return (
    <Ctx.Provider
      value={{
        settings,
        set,
        step,
        reset,
        activeProfiles,
        applyProfile,
        activeCount,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useA11y must be used within <AccessibilityProvider>");
  return ctx;
}
