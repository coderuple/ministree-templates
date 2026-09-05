"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Endless scrolling band of short phrases.
 *
 * The keyframe translates the track by exactly -50%, so with two identical
 * halves the second is in position the instant the first leaves. That part was
 * always right. What was wrong is that the halves were a FIXED number of
 * repetitions (three here, one in the section renderer) - a bet about how wide
 * the screen is. Lose the bet - short tagline, wide monitor - and the band
 * visibly runs out, a gap chasing the words across the screen.
 *
 * So the component measures instead of betting: one sequence is rendered, its
 * width compared to the container's, and the sequence repeated until a half
 * can cover the viewport. A ResizeObserver re-measures on resize and on the
 * display font swapping in, both of which change the answer.
 *
 * Duration scales with the measured width - constant pixels-per-second - so a
 * two-word band and a ten-item band drift at the same pace instead of the
 * short one whipping past in the same fixed 28s.
 */
export default function Marquee({
  items,
  className = "border-y border-line py-5",
  speed = "normal",
  separator = "\u2020",
  direction = "left",
}: {
  items: string[];
  /** Band chrome. Callers inside a SectionWrapper pass their own (or none). */
  className?: string;
  speed?: "normal" | "slow" | "fast";
  separator?: string;
  direction?: "left" | "right";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLDivElement>(null);
  // Three is the server-rendered guess (the old constant); the truth replaces
  // it after the first client measure.
  const [reps, setReps] = useState(3);
  const [duration, setDuration] = useState<number | null>(null);

  const itemsKey = items.join(" ");
  useEffect(() => {
    const container = containerRef.current;
    const seq = seqRef.current;
    if (!container || !seq) return;
    const pxPerSecond = speed === "slow" ? 28 : speed === "fast" ? 90 : 50;

    const measure = () => {
      const seqWidth = seq.scrollWidth;
      const containerWidth = container.clientWidth;
      if (!seqWidth || !containerWidth) return;
      const needed = Math.max(1, Math.ceil(containerWidth / seqWidth));
      setReps(needed);
      setDuration((seqWidth * needed) / pxPerSecond);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(seq);
    return () => ro.disconnect();
  }, [itemsKey, separator, speed]);

  if (items.length === 0) return null;

  const sequence = (withRef: boolean) => (
    <div ref={withRef ? seqRef : undefined} className="flex w-max shrink-0 items-center">
      {items.map((item, i) => (
        <span
          key={i}
          className="font-display flex items-center whitespace-nowrap text-2xl uppercase tracking-wide md:text-4xl"
        >
          <span className="px-6">{item}</span>
          <span className="text-ember">{separator}</span>
        </span>
      ))}
    </div>
  );

  const half = (hidden: boolean) => (
    <div className="flex w-max shrink-0 items-center" aria-hidden={hidden || undefined}>
      {Array.from({ length: reps }, (_, r) => (
        <div key={r} className="contents">
          {/* Only the very first sequence is measured. */}
          {sequence(!hidden && r === 0)}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`select-none overflow-hidden ${className}`}
      role="presentation"
    >
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{
          animationDuration: duration ? `${duration}s` : undefined,
          animationDirection: direction === "right" ? "reverse" : undefined,
        }}
      >
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}
