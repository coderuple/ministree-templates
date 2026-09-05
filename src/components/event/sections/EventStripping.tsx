"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import { reducedMotion } from "@/lib/motion";

/**
 * A wall of words struck through one at a time under the reader's thumb, until
 * one is left standing.
 *
 * The rhetorical shape a church already uses — strip away the noise, and here is
 * what remains — given a scroll track to happen on. The strike itself is a CSS
 * pseudo-element toggled by a class, so the whole wall costs one scroll handler
 * rather than a tween per word, and no text is split or measured.
 *
 * `h-[250vh]` outer with a `sticky` inner rather than a GSAP pin: a pin-spacer
 * fights the mobile address bar as it collapses, and `motion-reduce` can undo a
 * sticky layout in CSS alone.
 */
export default function EventStripping({
  noise,
  kept,
  coda,
  label,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  /** What gets struck out, in order. */
  noise: string[];
  /** The word left standing. */
  kept: string | null;
  coda: string | null;
  label: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wall = wallRef.current;
    if (!root || !wall) return;
    const words = Array.from(wall.querySelectorAll<HTMLElement>(".strike-word"));

    /* No pin: every strike applies at once and the whole thing reads in flow.
       The classes on the markup collapse the sticky layout to match. */
    if (reducedMotion()) {
      words.forEach((w) => w.classList.add("struck"));
      return;
    }

    const ctx = gsap.context(() => {
      // The wall is struck across the first 72% of the track — one word per
      // step — which leaves the last quarter for what is left to arrive in.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const struck = Math.floor(Math.min(self.progress / 0.72, 1) * words.length);
          words.forEach((word, i) => word.classList.toggle("struck", i < struck));
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.3 },
        defaults: { ease: "none" },
      });
      tl.to(wall, { autoAlpha: 0.05, duration: 0.06 }, 0.72)
        .fromTo(
          "[data-kept]",
          { autoAlpha: 0, scale: 0.92 },
          { autoAlpha: 1, scale: 1, duration: 0.1 },
          0.76,
        )
        .fromTo(
          "[data-coda]",
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.08 },
          0.88,
        );
    }, root);
    return () => ctx.revert();
  }, [noise.length]);

  if (noise.length === 0) return null;

  return (
    <section id={anchor} ref={rootRef} className="relative h-[250vh] motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center px-[4vw] motion-reduce:static motion-reduce:h-auto motion-reduce:py-28">
        <SectionHead index="09" label={label} />

        <div
          ref={wallRef}
          className="font-display mt-10 flex max-w-6xl flex-wrap justify-center gap-x-[2.4vw] gap-y-2 text-center text-[8vw] uppercase leading-[1.02] lg:text-[4.4vw]"
        >
          {noise.map((word, i) => (
            <span key={`${word}-${i}`} className="strike-word">
              {word}
            </span>
          ))}
        </div>

        {kept || coda ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-8 px-[4vw] text-center motion-reduce:static motion-reduce:inset-auto motion-reduce:mt-16">
            {kept ? (
              <p
                data-kept
                className="font-display text-[min(22vw,38svh)] uppercase leading-none text-ink [text-shadow:0_0_80px_rgb(0_0_0/0.6)]"
              >
                {kept}
              </p>
            ) : null}
            {coda ? (
              <p
                data-coda
                className="font-serif max-w-xl text-2xl italic leading-snug text-ember lg:text-3xl"
              >
                {coda}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
