"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { introState, lenisStore } from "@/lib/state";

/**
 * The opening curtain: a counter to 100, then two panels wipe away.
 *
 * The Customizer has offered an "Intro preloader" switch since the template
 * shipped, but the component it referred to was deleted along with the old
 * single-page `Experience` — so the toggle did nothing at all.
 *
 * Shown once per browser session, not once per navigation: a preloader on every
 * route change would be an obstacle rather than an entrance. Skipped entirely
 * for reduced-motion visitors, who get the page immediately.
 */
const SEEN_KEY = "flame-intro-seen";

export default function Preloader({
  label,
  onDone,
}: {
  label: string;
  /** Fires once the curtain is up — or immediately when there is no curtain,
   *  which is the case a caller sequencing an entrance animation off this is
   *  most likely to forget. Reduced-motion and second-visit both skip the
   *  preloader entirely, and a hero waiting on a callback that never came would
   *  simply never appear. */
  onDone?: () => void;
}) {
  const [active, setActive] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode or storage disabled — treat as unseen; worst case is one
      // extra intro, never a crash.
    }
    if (reduced || seen) {
      doneRef.current?.();
      return;
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-loading", "");
    lenisStore.current?.stop();

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.removeAttribute("data-loading");
          lenisStore.current?.start();
          try {
            sessionStorage.setItem(SEEN_KEY, "1");
          } catch {
            /* see above */
          }
          setActive(false);
          doneRef.current?.();
        },
      });

      /* The ember scene's camera reads `introState.z` every frame. Nothing had
         animated it since the old single-page shell was removed, so the dolly
         never happened; the curtain lifting is the moment it was written for. */
      tl.to(introState, { z: window.innerWidth < 768 ? 13.5 : 9.5, duration: 3.4, ease: "power2.out" }, 0);

      tl.fromTo(
        ".preloader-line",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" },
      )
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (countRef.current) {
                countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              }
            },
          },
          0.2,
        )
        .to(".preloader-front", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=0.15")
        .to(".preloader-back", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.12");
    }, root);

    return () => {
      ctx.revert();
      document.documentElement.removeAttribute("data-loading");
      lenisStore.current?.start();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[300]" aria-hidden>
      <div className="preloader-back absolute inset-0 bg-ember" />
      <div className="preloader-front absolute inset-0 flex flex-col items-center justify-center gap-6 bg-panel text-panel-ink">
        <div className="overflow-hidden">
          <span className="preloader-line block font-display text-4xl uppercase tracking-[0.2em] sm:text-6xl">
            {label}
          </span>
        </div>
        <div className="overflow-hidden">
          <span
            ref={countRef}
            className="preloader-line block font-display text-sm tracking-[0.4em] text-ember"
          >
            000
          </span>
        </div>
      </div>
    </div>
  );
}
