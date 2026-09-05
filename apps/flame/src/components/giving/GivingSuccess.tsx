"use client";

import { useMemo } from "react";

const BURST_KEYFRAMES = `
@keyframes flame-ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  15% { opacity: 0.9; }
  100% { transform: translateY(-220px) scale(0.4); opacity: 0; }
}
@keyframes flame-check-draw { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .flame-ember, .flame-check { animation: none !important; }
  .flame-check { stroke-dashoffset: 0 !important; }
}`;

/** Cinematic thank-you: a rising-ember burst + a drawn checkmark over a dark panel. */
export default function GivingSuccess({ message, amountLabel }: { message?: string; amountLabel?: string }) {
  const embers = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        dur: 2 + Math.random() * 2.2,
        size: 2 + Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="relative overflow-hidden border border-line bg-panel px-6 py-24 text-center text-panel-ink">
      <style dangerouslySetInnerHTML={{ __html: BURST_KEYFRAMES }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_120%,_color-mix(in_srgb,var(--flame)_30%,transparent),transparent_60%)]"
      />
      {/* rising embers */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-full">
        {embers.map((e, i) => (
          <span
            key={i}
            className="flame-ember absolute bottom-10 rounded-full bg-[var(--flame)]"
            style={{
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animation: `flame-ember-rise ${e.dur}s ${e.delay}s ease-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        <svg viewBox="0 0 64 64" className="mx-auto h-16 w-16" fill="none" stroke="var(--ember)" strokeWidth={3}>
          <circle cx="32" cy="32" r="29" className="opacity-30" />
          <path
            className="flame-check"
            d="M20 33 l8 8 l16 -18"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 60, strokeDashoffset: 60, animation: "flame-check-draw 0.7s 0.2s ease-out forwards" }}
          />
        </svg>
        <h2 className="font-display mt-8 text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl">Thank you</h2>
        {amountLabel ? <p className="micro mt-4 text-ember">{amountLabel} received</p> : null}
        <p className="font-serif mx-auto mt-5 max-w-md text-xl italic text-panel-ink/75">
          {message || "Your gift fuels the mission — here and beyond."}
        </p>
      </div>
    </div>
  );
}
