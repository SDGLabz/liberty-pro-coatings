"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  ALLOW_ALL,
  CONSENT_EVENT,
  DENY_ALL,
  OPEN_PREFS_EVENT,
  hasConsent,
  hasDecided,
  readConsent,
  writeConsent,
  type ConsentCategory,
  type ConsentPrefs,
} from "@/lib/consent";

/* ---------------------------------------------------------------------------
   Cookie consent — GDPR/ePrivacy opt-in. The banner shows until the visitor
   makes a choice; non-essential categories stay blocked (see lib/consent.ts)
   until they accept. "Reject" is as prominent as "Accept" (equal prominence),
   and a preferences modal lets them choose per category at any time. Mounted
   outside #a11y-root, styled in the LPC palette.
--------------------------------------------------------------------------- */

const CATEGORIES: {
  key: Exclude<ConsentCategory, "necessary">;
  title: string;
  desc: string;
}[] = [
  {
    key: "analytics",
    title: "Analytics",
    desc: "Anonymous usage stats that help us improve the site (e.g. which products and pages get viewed). No tracking until you allow it.",
  },
  {
    key: "marketing",
    title: "Marketing",
    desc: "Lets us measure campaigns and show relevant offers. Sets advertising cookies only with your permission.",
  },
];

export function CookieConsent() {
  const [banner, setBanner] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentPrefs>(DENY_ALL);

  // Show the banner only if no current-version choice exists. Defer a tick so
  // it animates in after first paint and never blocks hydration.
  useEffect(() => {
    if (!hasDecided()) {
      const id = window.setTimeout(() => setBanner(true), 600);
      return () => window.clearTimeout(id);
    }
  }, []);

  // Footer "Cookie preferences" link reopens the modal (prefilled with the
  // current choice).
  useEffect(() => {
    function onOpen() {
      const c = readConsent();
      setDraft(
        c
          ? { necessary: true, analytics: !!c.analytics, marketing: !!c.marketing }
          : DENY_ALL,
      );
      setPrefsOpen(true);
    }
    window.addEventListener(OPEN_PREFS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, onOpen);
  }, []);

  const commit = useCallback((prefs: ConsentPrefs) => {
    writeConsent(prefs);
    setBanner(false);
    setPrefsOpen(false);
  }, []);

  if (!banner && !prefsOpen) return null;

  return (
    <>
      {banner && !prefsOpen && (
        <ConsentBanner
          onAcceptAll={() => commit(ALLOW_ALL)}
          onRejectAll={() => commit(DENY_ALL)}
          onCustomize={() => {
            setDraft(DENY_ALL);
            setPrefsOpen(true);
          }}
        />
      )}
      {prefsOpen && (
        <PreferencesModal
          draft={draft}
          setDraft={setDraft}
          onClose={() => setPrefsOpen(false)}
          onSave={() => commit(draft)}
          onAcceptAll={() => commit(ALLOW_ALL)}
          onRejectAll={() => commit(DENY_ALL)}
          dismissible={hasDecided()}
        />
      )}
    </>
  );
}

/* ---------------- banner ---------------- */

function ConsentBanner({
  onAcceptAll,
  onRejectAll,
  onCustomize,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="lpc-consent-in fixed inset-x-4 bottom-4 z-[100] sm:left-5 sm:right-auto sm:max-w-[420px]"
    >
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_24px_60px_-18px_rgba(8,12,18,0.4)]">
        <div className="h-1 w-full bg-[var(--red)]" aria-hidden />
        <div className="p-5">
          <div className="flex items-center gap-2.5">
            <CookieIcon className="h-5 w-5 text-[var(--red)]" />
            <h2 className="text-[15px] font-bold text-[var(--ink)]">
              We value your privacy
            </h2>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--txt-2)]">
            We use strictly necessary cookies to run this site. With your okay,
            we also use analytics and marketing cookies to improve it. You can
            accept, reject, or choose what to allow.{" "}
            <Link
              href="/legal"
              className="font-semibold text-[var(--navy-bright)] underline underline-offset-2"
            >
              Learn more
            </Link>
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRejectAll}
                className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={onAcceptAll}
                className="flex-1 rounded-xl bg-[var(--red)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(214,33,46,0.8)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Accept all
              </button>
            </div>
            <button
              type="button"
              onClick={onCustomize}
              className="rounded-xl px-4 py-2 text-[13px] font-semibold text-[var(--txt-3)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            >
              Customize preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- preferences modal ---------------- */

function PreferencesModal({
  draft,
  setDraft,
  onClose,
  onSave,
  onAcceptAll,
  onRejectAll,
  dismissible,
}: {
  draft: ConsentPrefs;
  setDraft: (p: ConsentPrefs) => void;
  onClose: () => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  dismissible: boolean;
}) {
  // Escape closes only if a prior choice already exists (otherwise the visitor
  // must make a choice — opt-in can't be dismissed into "accepted").
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissible) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, dismissible]);

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
      <div
        className="lpc-consent-fade absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={dismissible ? onClose : undefined}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cookie preferences"
        className="lpc-consent-in relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:m-4 sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--line)] px-5 py-4">
          <CookieIcon className="h-5 w-5 text-[var(--red)]" />
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[var(--ink)]">
              Cookie preferences
            </h2>
            <p className="text-[12px] text-[var(--txt-3)]">
              Choose which cookies we can use.
            </p>
          </div>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--txt-3)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {/* Strictly necessary — locked on */}
          <CategoryRow
            title="Strictly necessary"
            desc="Required for the site to work — security, login, and your cart. Always on; these don't set tracking cookies."
            checked
            locked
          />
          {CATEGORIES.map((c) => (
            <CategoryRow
              key={c.key}
              title={c.title}
              desc={c.desc}
              checked={draft[c.key]}
              onChange={(v) => setDraft({ ...draft, [c.key]: v })}
            />
          ))}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-[var(--line)] bg-[var(--bg-2)] px-5 py-4 sm:flex-row">
          <button
            type="button"
            onClick={onRejectAll}
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-white/60"
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:bg-white/60"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={onAcceptAll}
            className="flex-1 rounded-xl bg-[var(--red)] px-4 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  locked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const descId = useId();
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[13.5px] font-bold text-[var(--ink)]">
            {title}
          </span>
          <span id={descId} className="mt-1 block text-[12.5px] leading-relaxed text-[var(--txt-2)]">
            {desc}
          </span>
        </div>
        {locked ? (
          <span className="mt-0.5 shrink-0 rounded-full bg-[var(--bg-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--txt-3)]">
            Always on
          </span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-describedby={descId}
            onClick={() => onChange?.(!checked)}
            className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              checked ? "bg-[var(--red)]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                checked ? "translate-x-[1.375rem]" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
      <path d="M8.5 8.5h.01M16 9.5h.01M8 14h.01M14.5 14.5h.01M11 11.5h.01" />
    </svg>
  );
}

/* ---------------- gating helpers for consumers ---------------- */

/**
 * React hook for gating UI/scripts on consent. Re-renders when consent changes.
 * Example: `const ok = useConsent("analytics"); if (ok) loadGA();`
 */
export function useConsent(category: ConsentCategory): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const sync = () => setOk(hasConsent(category));
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, [category]);
  return ok;
}
