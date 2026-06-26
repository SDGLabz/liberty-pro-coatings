// Cookie-consent core — GDPR/ePrivacy "opt-in" model.
//
// Non-essential categories (analytics, marketing) are DENIED until the visitor
// explicitly agrees, so any script gated through here never loads — and never
// sets a cookie — without permission. The choice is stored in a first-party
// cookie (so it's readable server-side and survives) and mirrored to
// localStorage, with a timestamp + version for audit / re-prompt on policy
// changes. Withdrawing a category best-effort clears that category's cookies.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentPrefs {
  necessary: true; // strictly necessary — always on, can't be turned off
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent extends ConsentPrefs {
  ts: string; // ISO timestamp of the choice (consent record)
  v: number; // consent/policy version — bump to re-prompt everyone
}

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "lpc_consent";
export const CONSENT_EVENT = "lpc:consent";
export const OPEN_PREFS_EVENT = "lpc:open-cookie-prefs";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export const DENY_ALL: ConsentPrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
};
export const ALLOW_ALL: ConsentPrefs = {
  necessary: true,
  analytics: true,
  marketing: true,
};

// Cookies each non-essential category is allowed to set — cleared when consent
// for that category is withdrawn. Empty until real trackers are wired up; e.g.
//   analytics: ["_ga", "_gid", "_gat", "_ga_XXXXXXX"]
//   marketing: ["_fbp", "_gcl_au", "_gcl_aw"]
const CATEGORY_COOKIES: Record<"analytics" | "marketing", string[]> = {
  analytics: [],
  marketing: [],
};

/** Read the stored consent record, or null if the visitor hasn't chosen yet. */
export function readConsent(): StoredConsent | null {
  if (typeof document === "undefined") return null;
  try {
    const hit = document.cookie
      .split("; ")
      .find((c) => c.startsWith(CONSENT_COOKIE + "="));
    if (hit) {
      const raw = decodeURIComponent(hit.slice(CONSENT_COOKIE.length + 1));
      return JSON.parse(raw) as StoredConsent;
    }
    // Cookie blocked/cleared — fall back to localStorage.
    const ls = localStorage.getItem(CONSENT_COOKIE);
    return ls ? (JSON.parse(ls) as StoredConsent) : null;
  } catch {
    return null;
  }
}

/** True once the visitor has made a valid, current-version choice. */
export function hasDecided(): boolean {
  const c = readConsent();
  return !!c && c.v === CONSENT_VERSION;
}

/**
 * Has the visitor consented to a category? `necessary` is always true; everything
 * else defaults to FALSE until an explicit, current-version choice exists — this
 * is what makes the gate "block by default".
 */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const c = readConsent();
  return !!c && c.v === CONSENT_VERSION && Boolean(c[category]);
}

/** Persist a choice, clear withdrawn cookies, and notify gated scripts. */
export function writeConsent(prefs: ConsentPrefs): StoredConsent {
  const record: StoredConsent = {
    necessary: true,
    analytics: !!prefs.analytics,
    marketing: !!prefs.marketing,
    ts: new Date().toISOString(),
    v: CONSENT_VERSION,
  };
  const value = encodeURIComponent(JSON.stringify(record));
  const secure =
    typeof location !== "undefined" && location.protocol === "https:";
  try {
    document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
    localStorage.setItem(CONSENT_COOKIE, JSON.stringify(record));
  } catch {}
  // Clear cookies for any category the visitor declined / withdrew.
  (["analytics", "marketing"] as const).forEach((cat) => {
    if (!record[cat]) clearCookies(CATEGORY_COOKIES[cat]);
  });
  try {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
  } catch {}
  return record;
}

/** Best-effort delete of named cookies across likely paths/domains. */
function clearCookies(names: string[]) {
  if (!names.length || typeof document === "undefined") return;
  const host = location.hostname;
  const root = "." + host.split(".").slice(-2).join(".");
  const domains = ["", host, "." + host, root];
  names.forEach((n) => {
    domains.forEach((d) => {
      document.cookie = `${n}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
    });
  });
}

/** Let a footer link / button reopen the preferences modal. */
export function openCookiePreferences() {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT));
  } catch {}
}
