'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { scrollProgress, stageOpacity } from './format.ts';

/**
 * The scroll engine, ported from the three UWC prototypes.
 *
 * One rAF loop, one ref, and everything it computes leaves as a **CSS custom
 * property**. No React state, so no section re-renders while you scroll — which
 * is why the prototypes scrub smoothly in both directions, and why every page
 * that uses this can stay a server component with only this one island.
 *
 * What it writes:
 *   --p     on each [data-track]        0→1 through that section
 *   --pg    on the frame                0→1 through the whole page
 *   --o     on each [data-stage]        that stage's crossfade opacity
 *   --s0..N on the stages' host track   the same values, addressable by siblings
 *                                       (progress dots, drifting orbs)
 *   --len   on [data-thread]            an SVG path's length, for a draw-on scroll
 *   --chrome / --navh  on the frame     measured sticky-header heights
 *   data-seen on [data-reveal]          once, when it enters the viewport
 *
 * Nothing here decides what any of that LOOKS like. Each concept's stylesheet
 * reads the same properties and expresses its own motion, which is how one
 * engine serves three deliberately different designs without averaging them.
 *
 * Deliberately NOT here:
 * - The 760px breakpoint. The frame is `container-type: inline-size`, so that
 *   is `@container (max-width: 760px)` in CSS. The prototype only used JS
 *   because its runtime had no stylesheet, and doing it in JS costs a
 *   hydration flash where the desktop nav paints before JS decides otherwise.
 * - Reveal delays. Set `--reveal-delay` inline on the element; CSS owns the
 *   easing. JS reading `data-delay` to write a transition string put three
 *   sets of magic numbers in here for no gain.
 */
export function ScrollEngine({
  children,
  className,
  /** Boundaries for the three-stage crossfade, as fractions of the host's --p. */
  stageSegments = [
    [0, 0.32],
    [0.34, 0.64],
    [0.66, 1],
  ],
}: {
  children: ReactNode;
  className?: string;
  stageSegments?: ReadonlyArray<readonly [number, number]>;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracks = Array.from(frame.querySelectorAll<HTMLElement>('[data-track]'));
    const stages = Array.from(frame.querySelectorAll<HTMLElement>('[data-stage]'));
    const stageHost = stages[0]?.closest<HTMLElement>('[data-track]') ?? null;
    const ramp = Number(stageHost?.dataset.stageRamp) || 0.05;

    /* An SVG path that draws itself as the page scrolls. Measured once — its
       length in user units doesn't change with the viewport, because the path
       is `vector-effect: non-scaling-stroke` inside a fixed viewBox. */
    const thread = frame.querySelector<SVGPathElement>('[data-thread]');
    if (thread && typeof thread.getTotalLength === 'function') {
      frame.style.setProperty('--len', String(Math.round(thread.getTotalLength())));
    }

    /* The sticky nav overlaps a pinned hero unless something accounts for it.
       --chrome is every sticky bar (ivory has two); --navh is the nav alone,
       because the mobile menu hangs off the nav's bottom edge, not the stack's. */
    const chromeEls = Array.from(frame.querySelectorAll<HTMLElement>('[data-chrome]'));
    const measureChrome = () => {
      const total = chromeEls.reduce((sum, el) => sum + el.offsetHeight, 0);
      frame.style.setProperty('--chrome', `${total}px`);
      frame.style.setProperty('--navh', `${chromeEls[0]?.offsetHeight ?? 0}px`);
    };
    measureChrome();

    let chromeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined' && chromeEls.length) {
      chromeObserver = new ResizeObserver(measureChrome);
      chromeEls.forEach((el) => chromeObserver!.observe(el));
    }

    const tick = () => {
      const vh = window.innerHeight || 800;

      const fr = frame.getBoundingClientRect();
      frame.style.setProperty(
        '--pg',
        scrollProgress('pin', fr, vh).toFixed(4),
      );

      for (const el of tracks) {
        const p = scrollProgress(el.dataset.track ?? 'cover', el.getBoundingClientRect(), vh);
        el.style.setProperty('--p', p.toFixed(4));
      }

      if (stageHost && stages.length) {
        const p = Number(stageHost.style.getPropertyValue('--p')) || 0;
        stages.forEach((el, i) => {
          const o = stageOpacity(p, i, stageSegments, ramp);
          el.style.setProperty('--o', o.toFixed(3));
          stageHost.style.setProperty(`--s${i}`, o.toFixed(3));
        });
      }
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };
    tick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* Reveals fire once and are then unobserved — they must never re-hide on
       the way back up. Under reduced motion we don't observe at all; the
       stylesheet already renders them at rest, so the page is complete without
       this ever running. Scroll mapping above still runs either way. */
    let revealObserver: IntersectionObserver | undefined;
    if (!reduced) {
      const revealEls = Array.from(frame.querySelectorAll<HTMLElement>('[data-reveal]'));
      if (revealEls.length) {
        revealObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              (entry.target as HTMLElement).dataset.seen = '';
              revealObserver!.unobserve(entry.target);
            }
          },
          { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
        );
        revealEls.forEach((el) => revealObserver!.observe(el));
      }
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
      chromeObserver?.disconnect();
      revealObserver?.disconnect();
    };
  }, [stageSegments]);

  return (
    <div ref={frameRef} className={className} data-frame>
      {children}
    </div>
  );
}

export default ScrollEngine;
