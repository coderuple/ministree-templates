"use client";

import { useEffect } from "react";

/**
 * The four things on this site that are TEXT rather than a CSS property.
 *
 * Everything else Judah does with scroll — the verses crossfading, the book
 * rail lighting, the rail sliding, the horizon opening — is the stylesheet
 * reading `--p` from the shared engine. These four cannot be: a year that
 * counts backwards, the era beside it, the caption under the scrub bar and
 * the reverse timecode in the header are all *different strings*, and CSS has
 * no way to swap a string for another.
 *
 * So: one rAF loop, no React state, `textContent` only. Nothing here
 * re-renders, which is why the page stays a server component with two small
 * islands rather than a client tree.
 *
 * It also writes `--vel` — how fast the reader is scrolling, 0→1 — which the
 * stylesheet turns into the motion blur across the opening's noise columns.
 * That one has to be measured over time, so CSS cannot do it either.
 */
export function RewindEngine({
  marks,
  captions,
}: {
  /** Counted down through the archive scene, in the order given. */
  marks: ReadonlyArray<{ year: string; era: string }>;
  /** Shown in order across the same scene. */
  captions: readonly string[];
}) {
  useEffect(() => {
    const frame = document.querySelector<HTMLElement>("[data-frame]");
    if (!frame) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const yearEl = frame.querySelector<HTMLElement>("[data-year]");
    const eraEl = frame.querySelector<HTMLElement>("[data-era]");
    const capEl = frame.querySelector<HTMLElement>("[data-caption]");
    const tcEl = frame.querySelector<HTMLElement>("[data-timecode]");
    const archive = frame.querySelector<HTMLElement>("[data-archive]");

    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const pad = (n: number) => String(n).padStart(2, "0");
    /* The years are display strings in the Customizer ("2027", or "MMXXVII"
       if a church insists). Interpolate only when they are actually numbers;
       otherwise step between them, which is the honest fallback. */
    const numbers = marks.map((m) => Number(m.year));
    const numeric = numbers.every((n) => Number.isFinite(n));

    let lastY = window.scrollY;
    let vel = 0;
    let raf = 0;

    const tick = () => {
      raf = 0;
      const vh = window.innerHeight || 800;
      const y = window.scrollY;

      /* Eased toward the instantaneous speed rather than set to it, so the
         blur builds and settles instead of strobing frame to frame. */
      const delta = Math.min(1, Math.abs(y - lastY) / 90);
      vel = reduced ? 0 : vel + (delta - vel) * 0.25;
      lastY = y;
      frame.style.setProperty("--vel", vel.toFixed(3));

      if (tcEl) {
        const doc = document.documentElement.scrollHeight - vh;
        const total = clamp(y / Math.max(1, doc));
        // Counts DOWN: the whole page is a tape being wound back.
        const t = Math.round((1 - total) * 86400 * 1.2);
        tcEl.textContent =
          `${pad(Math.floor(t / 3600) % 24)}:${pad(Math.floor(t / 60) % 60)}` +
          `:${pad(t % 60)}:${pad(Math.floor((1 - total) * 24) % 25)}`;
      }

      if (archive && yearEl && marks.length) {
        const r = archive.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height - vh));
        const at = p * (marks.length - 1);
        const i = Math.min(marks.length - 1, Math.floor(at));
        const next = Math.min(marks.length - 1, i + 1);
        yearEl.textContent = numeric
          ? String(Math.round(numbers[i] + (numbers[next] - numbers[i]) * (at - i)))
          : marks[i].year;
        if (eraEl) eraEl.textContent = marks[i].era;
        if (capEl && captions.length) {
          capEl.textContent = captions[Math.min(captions.length - 1, Math.floor(p * captions.length))];
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [marks, captions]);

  return null;
}

export default RewindEngine;
