"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Progressive-enhancement island — faithful port of the interaction
// wiring at the bottom of the prototype's chrome.js:
//   • scroll-reveal (.reveal → .in)
//   • count-up ([data-count])
//   • card tilt + glow (.card, .cat)
//   • magnetic buttons (.btn-primary, .btn-light)
// All motion is gated on prefers-reduced-motion; tilt/magnetic also
// require a fine pointer. Re-runs on route change so newly rendered
// content gets wired.
export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    // ---- scroll reveal ----
    const revs = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (reduce) {
      revs.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.14, rootMargin: "0px 0px -7% 0px" },
      );
      revs.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    // ---- count-up ----
    if (!reduce) {
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            const el = e.target as HTMLElement;
            const end = parseFloat(el.dataset.count || "0");
            const suf = el.dataset.suffix || "";
            const d = 1100;
            let t0: number | null = null;
            const tick = (t: number) => {
              if (t0 === null) t0 = t;
              let p = Math.min((t - t0) / d, 1);
              p = 1 - Math.pow(1 - p, 3);
              el.textContent = (end % 1 ? (end * p).toFixed(1) : Math.round(end * p)) + suf;
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }),
        { threshold: 0.6 },
      );
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => io.observe(n));
      cleanups.push(() => io.disconnect());
    }

    // ---- card tilt + glow ----
    if (!reduce && fine) {
      document.querySelectorAll<HTMLElement>(".card,.cat").forEach((el) => {
        let raf = 0;
        const onMove = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width;
          const py = (ev.clientY - r.top) / r.height;
          el.style.setProperty("--mx", px * 100 + "%");
          el.style.setProperty("--my", py * 100 + "%");
          const rx = (py - 0.5) * -6;
          const ry = (px - 0.5) * 6;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            el.style.transition = "transform .08s linear";
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
          });
        };
        const onLeave = () => {
          el.style.transition = "transform .5s cubic-bezier(.2,.7,.25,1)";
          el.style.transform = "";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.style.transform = "";
        });
      });
    }

    // ---- magnetic buttons ----
    if (!reduce && fine) {
      document.querySelectorAll<HTMLElement>(".btn-primary,.btn-light").forEach((b) => {
        const onMove = (ev: PointerEvent) => {
          const r = b.getBoundingClientRect();
          b.style.transform = `translate(${(ev.clientX - r.left - r.width / 2) * 0.18}px,${
            (ev.clientY - r.top - r.height / 2) * 0.28
          }px)`;
        };
        const onLeave = () => {
          b.style.transform = "";
        };
        b.addEventListener("pointermove", onMove);
        b.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          b.removeEventListener("pointermove", onMove);
          b.removeEventListener("pointerleave", onLeave);
          b.style.transform = "";
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
