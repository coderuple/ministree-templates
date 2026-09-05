"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import MagneticButton from "@/components/MagneticButton";
import Countdown from "@/components/event/Countdown";
import { revealsDisabled } from "@/lib/motion";

/**
 * The opening lockup.
 *
 * thealtar's hero is built around one four-letter word with a cross for its T,
 * measured in `em` against a single font-size so the whole arrangement scales
 * as one object. An event title from Ministree can be any length, so the
 * treatment is kept — centred stack, script tagline under-left, outlined year
 * under-right, everything em-based — while the size is driven off the title's
 * own character count. A ten-word conference name and "ALTAR" both fill the
 * screen instead of one overflowing and the other looking lost.
 */
export default function EventHero({
  loaded,
  presenter,
  title,
  tagline,
  year,
  dateLabel,
  venueLabel,
  ticketsHref,
  ticketsLabel,
  startAtMs,
  endAtMs,
}: {
  loaded: boolean;
  /** The start instant, resolved server-side. Null when the church has turned
   *  the countdown off, or the event has no start time to count to. */
  startAtMs: number | null;
  endAtMs: number | null;
  presenter: string | null;
  title: string;
  tagline: string | null;
  year: string | null;
  dateLabel: string | null;
  venueLabel: string | null;
  ticketsHref: string | null;
  ticketsLabel: string;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    /* Both halves gate together, and this one matters most: it is the effect
       that HIDES the hero ahead of the entrance. Skip the entrance but keep the
       hiding and the page opens on an empty screen forever. */
    if (revealsDisabled()) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-lockup", {
        autoAlpha: 0,
        scale: 0.86,
        filter: "blur(16px)",
        transformOrigin: "50% 55%",
      });
      gsap.set(".hero-fade", { autoAlpha: 0, y: 24 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!loaded || revealsDisabled()) return;
    const ctx = gsap.context(() => {
      // The lockup breathes in from a soft blur; everything else follows it in,
      // overlapping so the section never reads as a sequence of separate cues.
      const tl = gsap.timeline({ delay: 0.15 });
      tl.to(".hero-lockup", {
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 3.2,
        ease: "power2.out",
      }).to(
        ".hero-fade",
        { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" },
        "-=1.7",
      );
    }, rootRef);
    return () => ctx.revert();
  }, [loaded]);

  // Longest word decides the size: the lockup is centred and unbroken, so it is
  // the longest single word — not the whole string — that can overflow.
  const longest = title.split(/\s+/).reduce((a, w) => Math.max(a, w.length), 0);
  const scale =
    longest <= 5
      ? "text-[23vw] md:text-[17vw]"
      : longest <= 8
        ? "text-[16vw] md:text-[12vw]"
        : longest <= 12
          ? "text-[11vw] md:text-[8vw]"
          : "text-[8vw] md:text-[5.5vw]";

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex min-h-svh flex-col justify-between px-[4vw] pb-10 pt-32"
    >
      <div className="flex flex-col items-center text-center">
        {presenter ? (
          <span className="hero-fade micro block text-muted">{presenter} presents</span>
        ) : null}

        <div
          className={`hero-lockup font-display mt-10 w-max max-w-full uppercase leading-none text-ink ${scale}`}
        >
          <h1 className="text-balance">{title}</h1>
          {tagline || year ? (
            <div className="mt-[-0.06em] flex items-end justify-between gap-[0.2em] px-[0.015em]">
              {tagline ? (
                /* Floored at 12px. Sized purely in `em` these track the lockup,
                   which shrinks for a long title — a seven-word conference name
                   on a phone drove the tagline down to about five pixels. The
                   `em` still does the scaling; clamp only stops it disappearing. */
                <span className="font-serif block pb-[0.01em] text-[length:clamp(12px,0.082em,26px)] normal-case italic leading-tight tracking-normal text-ink/90 [text-shadow:0_1px_20px_rgb(0_0_0/0.7)]">
                  {tagline}
                </span>
              ) : (
                <span />
              )}
              {year ? (
                <span className="text-outline-ember block text-[length:clamp(16px,0.16em,52px)]">
                  {year}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {startAtMs !== null ? (
        <div className="hero-fade mt-14 flex justify-center">
          <Countdown startAtMs={startAtMs} endAtMs={endAtMs} flood />
        </div>
      ) : null}

      <div className="mt-16 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="hero-fade flex flex-col gap-1">
          {dateLabel ? <span className="micro text-ink">{dateLabel}</span> : null}
          {venueLabel ? <span className="micro text-muted">{venueLabel}</span> : null}
        </div>

        <div className="hero-fade hidden flex-col items-center gap-3 md:flex">
          <span className="micro text-muted">Scroll</span>
          <span className="relative block h-14 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-hint_1.8s_ease-in-out_infinite] bg-ember motion-reduce:animate-none" />
          </span>
        </div>

        {ticketsHref ? (
          <div className="hero-fade">
            <MagneticButton href={ticketsHref}>
              {ticketsLabel} <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}
