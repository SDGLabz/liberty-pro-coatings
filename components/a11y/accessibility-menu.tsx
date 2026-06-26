"use client";
// Accessibility widget — a fixed launcher button + a focus-trapped panel.
// UI styled after the familiar industry-standard accessibility widget
// (branded header → one-click profiles → icon-tile adjustment grids →
// footer). All state lives in the accessibility-provider; this file is purely
// the launcher + panel + a few cursor-following portals (magnifier / guide /
// mask). The panel slide-in is plain CSS (see globals.css), no JS motion lib.
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Accessibility,
  X,
  RotateCcw,
  EyeOff,
  Globe,
  Type,
  Baseline,
  MoveVertical,
  MoveHorizontal,
  Link2,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  PauseCircle,
  Plus,
  Minus,
  Contrast,
  Droplets,
  Droplet,
  Palette,
  Moon,
  Sun,
  PaintBucket,
  ImageOff,
  MousePointer2,
  Focus,
  MousePointerClick,
  VolumeX,
  PanelTopClose,
  Columns,
  BookOpen,
  Check,
  Zap,
  Eye,
  Brain,
  Keyboard,
  Ear,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  useA11y,
  PROFILE_ORDER,
  type TextAlign,
  type Contrast as ContrastMode,
  type Saturation,
  type BigCursor,
  type ProfileKey,
} from "./accessibility-provider";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AccessibilityMenu() {
  // The provider is mounted once in app/layout.tsx (wrapping both the page
  // content and this widget), so the widget just consumes that context.
  return <Widget />;
}

function Widget() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { settings, activeCount } = useA11y();
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Animated close: play the genie-out animation, then unmount. Duration must
  // match .a11y-panel-exit in globals.css (~0.34s).
  const requestClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 340);
  }, []);

  // "Hide Interface" removes the widget for this page session; a reload
  // restores it (deliberately not persisted, so it can't be lost for good).
  if (hidden) return null;

  return (
    <>
      <button
        ref={launcherRef}
        data-a11y-launcher
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open accessibility menu"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-[10010] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4b54] via-brand to-brand-dark text-white shadow-[0_14px_38px_-8px_rgb(var(--brand)/0.65)] outline-none ring-1 ring-white/30 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_22px_50px_-10px_rgb(var(--brand)/0.7)] focus-visible:ring-4 focus-visible:ring-brand/40 active:translate-y-0"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute right-full mr-3 translate-x-1 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          Accessibility
        </span>
        <Accessibility
          aria-hidden
          className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[14deg]"
        />
        {activeCount > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white ring-2 ring-surface"
          >
            {activeCount}
          </span>
        )}
      </button>

      <TextMagnifier active={settings.textMagnifier} />
      <MuteSounds active={settings.muteSounds} />
      <ReadingGuide active={settings.readingGuide} />
      <ReadingMask active={settings.readingMask} />

      {open && (
        <Panel
          closing={closing}
          onClose={requestClose}
          onHide={() => {
            setClosing(false);
            setOpen(false);
            setHidden(true);
          }}
          launcherRef={launcherRef}
        />
      )}
    </>
  );
}

function Panel({
  closing,
  onClose,
  onHide,
  launcherRef,
}: {
  closing: boolean;
  onClose: () => void;
  onHide: () => void;
  launcherRef: RefObject<HTMLButtonElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const { settings, set, step, reset, activeCount, activeProfiles, applyProfile } =
    useA11y();

  // Focus the close button on open; restore focus to the launcher on close.
  useEffect(() => {
    // Capture the launcher node now; it persists for the panel's lifetime, so
    // it's safe to focus it from cleanup.
    const launcherEl = launcherRef.current;
    const id = window.requestAnimationFrame(() => closeBtnRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(id);
      launcherEl?.focus?.();
    };
  }, [launcherRef]);

  // Escape to close + Tab focus trap within the dialog.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stepLabel = (n: number, plus = false) =>
    n === 0 ? "Default" : `${plus && n > 0 ? "+" : ""}${n}`;

  return (
    <div className="fixed inset-0 z-[10020] flex justify-end">
      {/* Backdrop — plain element with a CSS opacity transition (was framer). */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-[2px]",
          closing ? "a11y-backdrop-exit" : "a11y-backdrop-enter",
        )}
        onClick={onClose}
      />
      {/* Panel — slides in from the right via a CSS keyframe (was framer); the
          slide is disabled under prefers-reduced-motion in globals.css. */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Accessibility menu"
        className={cn(
          "relative z-10 flex h-full w-full max-w-[440px] flex-col overflow-hidden bg-surface shadow-[0_30px_80px_-20px_rgba(4,30,66,0.55)] sm:my-3 sm:mr-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl",
          closing ? "a11y-panel-exit" : "a11y-panel-enter",
        )}
      >
        {/* Header — Belzona-blue gradient chrome: brand icon + title on the
            left, frosted control buttons on the right, a status pill + subtle
            wordmark below. */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#ef4b54] via-brand to-brand-dark text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          />
          <div className="relative flex items-start justify-between gap-3 px-5 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <Accessibility aria-hidden className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[18px] font-bold leading-tight tracking-tight">
                  Accessibility
                </h2>
                <p className="text-[12.5px] leading-tight text-white/75">
                  Adjust this site to your needs
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <HeaderBtn
                onClick={reset}
                disabled={activeCount === 0}
                label="Reset all settings"
                icon={<RotateCcw aria-hidden className="h-[18px] w-[18px]" />}
              />
              <HeaderBtn
                onClick={onHide}
                label="Hide accessibility interface"
                icon={<EyeOff aria-hidden className="h-[18px] w-[18px]" />}
              />
              <HeaderBtn
                ref={closeBtnRef}
                onClick={onClose}
                label="Close accessibility menu"
                icon={<X aria-hidden className="h-[18px] w-[18px]" />}
              />
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-2 px-5 pb-4 pt-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/20">
              {activeCount > 0 ? (
                <>
                  <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                  {activeCount} active
                </>
              ) : (
                "No adjustments yet"
              )}
            </span>
            <Image
              src="/brand/liberty-mark-reverse.png"
              alt=""
              aria-hidden
              width={64}
              height={61}
              className="h-7 w-auto opacity-100"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain pt-1">
          {/* Profiles */}
          <SectionBlock title="Accessibility profiles">
            <div
              role="group"
              aria-label="Accessibility profiles"
              className="space-y-2"
            >
              {PROFILE_ORDER.map((key) => {
                const p = PROFILE_META[key];
                return (
                  <ProfileRow
                    key={key}
                    title={p.title}
                    desc={p.desc}
                    icon={<p.icon aria-hidden className="h-5 w-5" />}
                    checked={activeProfiles.has(key)}
                    onChange={(v) => applyProfile(key, v)}
                  />
                );
              })}
            </div>
          </SectionBlock>

          {/* Content adjustments */}
          <SectionBlock title="Content adjustments">
            <div className="grid grid-cols-3 gap-2">
              <StepTile
                label="Bigger Text"
                icon={<Type aria-hidden className="h-5 w-5" />}
                display={stepLabel(settings.fontScale, true)}
                active={settings.fontScale !== 0}
                onDec={() => step("fontScale", -1)}
                onInc={() => step("fontScale", 1)}
              />
              <StepTile
                label="Line Height"
                icon={<MoveVertical aria-hidden className="h-5 w-5" />}
                display={stepLabel(settings.lineHeight)}
                active={settings.lineHeight !== 0}
                onDec={() => step("lineHeight", -1)}
                onInc={() => step("lineHeight", 1)}
              />
              <StepTile
                label="Letter Spacing"
                icon={<MoveHorizontal aria-hidden className="h-5 w-5" />}
                display={stepLabel(settings.letterSpacing)}
                active={settings.letterSpacing !== 0}
                onDec={() => step("letterSpacing", -1)}
                onInc={() => step("letterSpacing", 1)}
              />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <Tile
                label="Readable Font"
                icon={<Baseline aria-hidden className="h-5 w-5" />}
                active={settings.readableFont}
                onClick={() => set("readableFont", !settings.readableFont)}
              />
              <Tile
                label="Highlight Links"
                icon={<Link2 aria-hidden className="h-5 w-5" />}
                active={settings.highlightLinks}
                onClick={() => set("highlightLinks", !settings.highlightLinks)}
              />
              <Tile
                label="Highlight Titles"
                icon={<Heading aria-hidden className="h-5 w-5" />}
                active={settings.highlightTitles}
                onClick={() => set("highlightTitles", !settings.highlightTitles)}
              />
              <Tile
                label="Text Magnifier"
                icon={<ZoomIn aria-hidden className="h-5 w-5" />}
                active={settings.textMagnifier}
                onClick={() => set("textMagnifier", !settings.textMagnifier)}
              />
              <Tile
                label="Align Left"
                icon={<AlignLeft aria-hidden className="h-5 w-5" />}
                active={settings.textAlign === "left"}
                onClick={() => toggleAlign(set, settings.textAlign, "left")}
              />
              <Tile
                label="Align Center"
                icon={<AlignCenter aria-hidden className="h-5 w-5" />}
                active={settings.textAlign === "center"}
                onClick={() => toggleAlign(set, settings.textAlign, "center")}
              />
              <Tile
                label="Align Right"
                icon={<AlignRight aria-hidden className="h-5 w-5" />}
                active={settings.textAlign === "right"}
                onClick={() => toggleAlign(set, settings.textAlign, "right")}
              />
            </div>
          </SectionBlock>

          {/* Color adjustments */}
          <SectionBlock title="Color adjustments">
            <div className="grid grid-cols-3 gap-2">
              <Tile
                label="Dark Contrast"
                icon={<Moon aria-hidden className="h-5 w-5" />}
                active={settings.contrast === "dark"}
                onClick={() => toggleContrast(set, settings.contrast, "dark")}
              />
              <Tile
                label="Light Contrast"
                icon={<Sun aria-hidden className="h-5 w-5" />}
                active={settings.contrast === "light"}
                onClick={() => toggleContrast(set, settings.contrast, "light")}
              />
              <Tile
                label="High Contrast"
                icon={<Contrast aria-hidden className="h-5 w-5" />}
                active={settings.contrast === "high"}
                onClick={() => toggleContrast(set, settings.contrast, "high")}
              />
              <Tile
                label="High Saturation"
                icon={<Droplets aria-hidden className="h-5 w-5" />}
                active={settings.saturation === "high"}
                onClick={() => toggleSaturation(set, settings.saturation, "high")}
              />
              <Tile
                label="Low Saturation"
                icon={<Droplet aria-hidden className="h-5 w-5" />}
                active={settings.saturation === "low"}
                onClick={() => toggleSaturation(set, settings.saturation, "low")}
              />
              <Tile
                label="Monochrome"
                icon={<Palette aria-hidden className="h-5 w-5" />}
                active={settings.saturation === "mono"}
                onClick={() => toggleSaturation(set, settings.saturation, "mono")}
              />
            </div>
            <div className="mt-3 space-y-2">
              <SwatchRow
                label="Text Color"
                icon={<Type aria-hidden className="h-4 w-4" />}
                value={settings.recolorText}
                onChange={(v) => set("recolorText", v)}
              />
              <SwatchRow
                label="Title Color"
                icon={<Heading aria-hidden className="h-4 w-4" />}
                value={settings.recolorTitle}
                onChange={(v) => set("recolorTitle", v)}
              />
              <SwatchRow
                label="Background"
                icon={<PaintBucket aria-hidden className="h-4 w-4" />}
                value={settings.recolorBg}
                onChange={(v) => set("recolorBg", v)}
              />
            </div>
          </SectionBlock>

          {/* Orientation adjustments */}
          <SectionBlock title="Orientation adjustments">
            <div className="grid grid-cols-3 gap-2">
              <Tile
                label="Mute Sounds"
                icon={<VolumeX aria-hidden className="h-5 w-5" />}
                active={settings.muteSounds}
                onClick={() => set("muteSounds", !settings.muteSounds)}
              />
              <Tile
                label="Hide Images"
                icon={<ImageOff aria-hidden className="h-5 w-5" />}
                active={settings.hideImages}
                onClick={() => set("hideImages", !settings.hideImages)}
              />
              <Tile
                label="Read Mode"
                icon={<BookOpen aria-hidden className="h-5 w-5" />}
                active={settings.readMode}
                onClick={() => set("readMode", !settings.readMode)}
              />
              <Tile
                label="Reading Guide"
                icon={<Columns aria-hidden className="h-5 w-5" />}
                active={settings.readingGuide}
                onClick={() => set("readingGuide", !settings.readingGuide)}
              />
              <Tile
                label="Reading Mask"
                icon={<PanelTopClose aria-hidden className="h-5 w-5" />}
                active={settings.readingMask}
                onClick={() => set("readingMask", !settings.readingMask)}
              />
              <Tile
                label="Stop Animations"
                icon={<PauseCircle aria-hidden className="h-5 w-5" />}
                active={settings.stopAnimations}
                onClick={() => set("stopAnimations", !settings.stopAnimations)}
              />
              <Tile
                label="Highlight Focus"
                icon={<Focus aria-hidden className="h-5 w-5" />}
                active={settings.highlightFocus}
                onClick={() => set("highlightFocus", !settings.highlightFocus)}
              />
              <Tile
                label="Highlight Hover"
                icon={<MousePointerClick aria-hidden className="h-5 w-5" />}
                active={settings.highlightHover}
                onClick={() => set("highlightHover", !settings.highlightHover)}
              />
              <Tile
                label="Big Black Cursor"
                icon={<MousePointer2 aria-hidden className="h-5 w-5" />}
                active={settings.bigCursor === "black"}
                onClick={() => toggleCursor(set, settings.bigCursor, "black")}
              />
              <Tile
                label="Big White Cursor"
                icon={<MousePointer2 aria-hidden className="h-5 w-5" />}
                active={settings.bigCursor === "white"}
                onClick={() => toggleCursor(set, settings.bigCursor, "white")}
              />
            </div>
          </SectionBlock>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-line bg-surface-alt px-5 py-3.5">
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            Reset all settings
          </button>
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/legal"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand underline-offset-2 hover:underline"
            >
              <BookOpen aria-hidden className="h-4 w-4" />
              Accessibility Statement
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-slate2">
              <Globe aria-hidden className="h-3.5 w-3.5" /> English
            </span>
          </div>
          <p className="mt-2.5 text-center text-[11px] text-muted2">
            Accessibility tools by{" "}
            <span className="font-semibold text-slate2">
              Industrial Maintenance Solutions
            </span>
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ---------- single-select group helpers (flattened to tiles) ---------- */

type SetFn = ReturnType<typeof useA11y>["set"];

function toggleAlign(set: SetFn, current: TextAlign, value: TextAlign) {
  set("textAlign", current === value ? "default" : value);
}
function toggleContrast(set: SetFn, current: ContrastMode, value: ContrastMode) {
  set("contrast", current === value ? "default" : value);
}
function toggleSaturation(set: SetFn, current: Saturation, value: Saturation) {
  set("saturation", current === value ? "default" : value);
}
function toggleCursor(set: SetFn, current: BigCursor, value: BigCursor) {
  set("bigCursor", current === value ? "default" : value);
}

/* ---------- header button ---------- */

function HeaderBtn({
  onClick,
  label,
  icon,
  disabled,
  ref,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/90 outline-none transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {icon}
    </button>
  );
}

/* ---------- section ---------- */

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="px-5 py-4">
      <h3 className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted2">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ---------- profiles ---------- */

const PROFILE_META: Record<
  ProfileKey,
  { title: string; desc: string; icon: LucideIcon }
> = {
  seizureSafe: {
    title: "Seizure Safe",
    desc: "Clear flashes & reduce color",
    icon: Zap,
  },
  visionImpaired: {
    title: "Vision Impaired",
    desc: "Enhances the site's visuals",
    icon: Eye,
  },
  adhdFriendly: {
    title: "ADHD Friendly",
    desc: "Reduce distractions & improve focus",
    icon: Brain,
  },
  cognitive: {
    title: "Cognitive Disability",
    desc: "Assists with reading & focusing",
    icon: BookOpen,
  },
  keyboardNav: {
    title: "Keyboard Navigation",
    desc: "Use the site with the keyboard",
    icon: Keyboard,
  },
  blindUsers: {
    title: "Blind Users",
    desc: "Optimize for screen readers",
    icon: Ear,
  },
  olderAdults: {
    title: "Older Adults",
    desc: "Larger text & easier reading",
    icon: Users,
  },
};

function ProfileRow({
  title,
  desc,
  icon,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  icon: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  // Stable id for aria-describedby linking the description to the switch.
  const descId = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={descId}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand/40",
        checked
          ? "border-brand bg-brand/[0.06] shadow-[0_6px_18px_-10px_rgb(var(--brand)/0.5)]"
          : "border-line bg-surface hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
            checked ? "bg-brand text-white" : "bg-surface-alt text-slate2",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] font-semibold text-ink">{title}</span>
          <span id={descId} className="block text-[12px] text-muted2">
            {desc}
          </span>
        </span>
      </span>
      <Switch checked={checked} />
    </button>
  );
}

/* ---------- shared switch knob ---------- */

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200",
        checked ? "bg-brand" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </span>
  );
}

/* ---------- adjustment tiles ---------- */

function Tile({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "group relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border p-2.5 text-center outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand/40",
        active
          ? "border-brand bg-brand/[0.06] shadow-[0_6px_18px_-10px_rgb(var(--brand)/0.5)]"
          : "border-line bg-surface hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-brand text-white"
            : "bg-surface-alt text-slate2 group-hover:bg-brand/10 group-hover:text-brand",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-[12px] font-semibold leading-tight",
          active ? "text-brand" : "text-ink",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function StepTile({
  label,
  icon,
  display,
  active,
  onDec,
  onInc,
}: {
  label: string;
  icon: ReactNode;
  display: string;
  active: boolean;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[92px] flex-col items-center justify-between gap-1.5 rounded-2xl border p-2.5 text-center transition-colors",
        active
          ? "border-brand bg-brand/[0.06] shadow-[0_6px_18px_-10px_rgb(var(--brand)/0.5)]"
          : "border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
          active ? "bg-brand text-white" : "bg-surface-alt text-slate2",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-[12px] font-semibold leading-tight",
          active ? "text-brand" : "text-ink",
        )}
      >
        {label}
      </span>
      <span className="flex w-full items-center justify-between gap-1">
        <button
          type="button"
          onClick={onDec}
          aria-label={`Decrease ${label}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink outline-none transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Minus aria-hidden className="h-3.5 w-3.5" />
        </button>
        <span
          aria-live="polite"
          className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink"
        >
          {display}
        </span>
        <button
          type="button"
          onClick={onInc}
          aria-label={`Increase ${label}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink outline-none transition-colors hover:border-brand/40 hover:bg-brand/5 hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <Plus aria-hidden className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}

/* ---------- recolor swatches ---------- */

const RECOLOR_SWATCHES = [
  "#dd1533",
  "#1f2933",
  "#0a3a6b",
  "#15803d",
  "#ffffff",
  "#000000",
];

function SwatchRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="mb-2 flex items-center gap-2.5 text-[13px] font-medium text-ink">
        {icon}
        {label}
      </div>
      <div
        role="group"
        aria-label={`${label} color`}
        className="flex flex-wrap items-center gap-1.5"
      >
        {RECOLOR_SWATCHES.map((hex) => {
          const sel = value?.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              type="button"
              aria-pressed={sel}
              aria-label={`${label} ${hex}`}
              onClick={() => onChange(sel ? null : hex)}
              className={cn(
                "h-7 w-7 rounded-md border outline-none transition-transform focus-visible:ring-2 focus-visible:ring-brand/40",
                sel
                  ? "border-brand ring-2 ring-brand/40"
                  : "border-line hover:scale-110",
              )}
              style={{ backgroundColor: hex }}
            />
          );
        })}
        <button
          type="button"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={cn(
            "flex h-7 items-center justify-center rounded-md border px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40",
            value === null
              ? "border-brand bg-brand/[0.06] text-brand"
              : "border-line text-ink hover:bg-surface-alt",
          )}
        >
          None
        </button>
      </div>
    </div>
  );
}

/* ---------- text magnifier ---------- */

function directText(el: Element): string {
  const target =
    (el.closest(
      "p,a,li,span,h1,h2,h3,h4,h5,h6,button,label,td,th,blockquote,figcaption,dt,dd",
    ) as HTMLElement | null) ?? (el as HTMLElement);
  const t = target.innerText?.replace(/\s+/g, " ").trim() ?? "";
  return t.length > 220 ? `${t.slice(0, 220)}…` : t;
}

function TextMagnifier({ active }: { active: boolean }) {
  const [box, setBox] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      window.cancelAnimationFrame(raf);
      const cx = e.clientX;
      const cy = e.clientY;
      raf = window.requestAnimationFrame(() => {
        const el = document.elementFromPoint(cx, cy);
        if (
          !el ||
          el.closest("[data-a11y-magnifier]") ||
          el.closest('[role="dialog"]') ||
          el.closest("[data-a11y-launcher]")
        ) {
          setBox(null);
          return;
        }
        const text = directText(el);
        if (text) setBox({ x: cx, y: cy, text });
        else setBox(null);
      });
    }
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      setBox(null);
    };
  }, [active]);

  if (!active || !box) return null;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const left = Math.min(Math.max(12, box.x - 24), vw - 360);
  const top = Math.max(12, box.y - 96);
  return (
    <div
      data-a11y-magnifier
      aria-hidden
      className="pointer-events-none fixed z-[10002] max-w-[22rem] rounded-lg border border-brand/30 bg-surface px-4 py-3 text-xl font-semibold leading-snug text-ink shadow-2xl"
      style={{ left, top }}
    >
      {box.text}
    </div>
  );
}

/* ---------- mute sounds ---------- */

function MuteSounds({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    const silence = (root: ParentNode | Document) => {
      root
        .querySelectorAll<HTMLMediaElement>("audio, video")
        .forEach((m) => {
          m.muted = true;
          if (!m.paused) {
            try {
              m.pause();
            } catch {}
          }
        });
    };
    silence(document);
    const onPlay = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t && (t instanceof HTMLAudioElement || t instanceof HTMLVideoElement)) {
        t.muted = true;
      }
    };
    // capture phase so we catch play on any media element
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, [active]);

  return null;
}

/* ---------- reading guide ---------- */

function ReadingGuide({ active }: { active: boolean }) {
  const [y, setY] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      const cy = e.clientY;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => setY(cy));
    }
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      setY(null);
    };
  }, [active]);

  if (!active || y === null) return null;
  return (
    <div
      data-a11y-reading-guide
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-[10001] h-1 bg-brand shadow-[0_0_8px_rgb(var(--brand)/0.6)]"
      style={{ top: y - 2 }}
    />
  );
}

/* ---------- reading mask ---------- */

function ReadingMask({ active }: { active: boolean }) {
  const [y, setY] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      const cy = e.clientY;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => setY(cy));
    }
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
      setY(null);
    };
  }, [active]);

  if (!active || y === null) return null;
  const half = 60; // ~120px clear strip
  return (
    <div data-a11y-reading-mask aria-hidden className="pointer-events-none fixed inset-0 z-[10000]">
      <div
        className="absolute inset-x-0 top-0 bg-black/55"
        style={{ height: Math.max(0, y - half) }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-black/55"
        style={{ top: y + half }}
      />
    </div>
  );
}
