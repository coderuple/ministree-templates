"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";
import MagneticButton from "@/components/MagneticButton";
import { revealsDisabled } from "@/lib/motion";

/** Label on the left, tappable value on the right. Kept local rather than
 *  widened out of `copy-value` — that one is a bare value with no label, and
 *  changing its shape would touch the giving pages that already use it. */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      data-cursor
      aria-label={`Copy ${label}: ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // No clipboard permission — the value is on screen to copy by hand.
        }
      }}
      className="group/copy flex w-full items-baseline justify-between gap-3 border-b border-line py-3 text-left transition-colors duration-300 last:border-b-0 hover:border-ember/50"
    >
      <span className="micro shrink-0 text-muted">{label}</span>
      <span className="text-right text-sm tracking-wide text-ink transition-colors duration-300 group-hover/copy:text-ember">
        {copied ? "Copied ✓" : value}
      </span>
    </button>
  );
}

export interface GiveCard {
  key: string;
  title: string;
  body: string | null;
  /** Tap-to-copy rows — bank details and the like. */
  rows?: Array<{ label: string; value: string }>;
  href?: string | null;
  cta?: string | null;
}

const ICONS: Record<string, React.ReactNode> = {
  text: (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M21 4H3v12h4v4l5-4h9V4z" />
      <path d="M7 10h.01M12 10h.01M17 10h.01" strokeLinecap="round" strokeWidth="2" />
    </svg>
  ),
  cash: (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="6.5" width="20" height="11" rx="1.5" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M5.5 9.5v.01M18.5 14.5v.01" strokeLinecap="round" strokeWidth="2" />
    </svg>
  ),
  online: (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 9.5h20M5.5 14.5h5" strokeLinecap="round" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9.5 12 4l9 5.5M5 9.5V19M9.7 9.5V19M14.3 9.5V19M19 9.5V19M3 19h18" />
    </svg>
  ),
};

export default function EventGive({
  cards,
  label,
  heading,
  strapline,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  cards: GiveCard[];
  label: string;
  heading: string;
  strapline: string | null;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = gridRef.current?.querySelectorAll(".give-card");
    if (!els?.length) return;
    // A `from` tween: leaving it unbuilt already lands the cards where they belong.
    if (revealsDisabled()) return;
    // gsap.context, not a bare kill(): killing a `from` mid-flight leaves the
    // cards at autoAlpha 0 on a strict-mode remount. Same fix as the lineup.
    const ctx = gsap.context(() => {
      gsap.from(els, {
        y: 56,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [cards.length]);

  if (cards.length === 0) return null;

  const base =
    "give-card flex flex-col gap-5 border border-line bg-surface/70 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-ember/50";

  return (
    <section id={anchor} className="relative px-[4vw] py-32">
      <SectionHead index="06" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>
      {strapline ? (
        <p className="font-serif mt-6 max-w-xl text-xl italic text-muted md:text-2xl">{strapline}</p>
      ) : null}

      {/* Sized to the cards that exist. A fixed four-column grid left a visible
          hole for every church that doesn't offer all four ways to give. */}
      <div
        ref={gridRef}
        className={`mt-16 grid gap-6 md:grid-cols-2 ${
          cards.length >= 4 ? "lg:grid-cols-4" : cards.length === 3 ? "lg:grid-cols-3" : ""
        }`}
      >
        {cards.map((card) => {
          // One card carries the accent so the eye lands on the fastest route to
          // giving; the rest stay quiet rather than all competing.
          const featured = card.key === "online";
          return (
            <div
              key={card.key}
              className={
                featured
                  ? "give-card relative flex flex-col gap-5 overflow-hidden bg-ember p-8 text-bg"
                  : base
              }
            >
              {featured ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-flame/40 blur-3xl"
                />
              ) : null}
              <span className={featured ? "relative" : "text-ember"}>{ICONS[card.key] ?? ICONS.online}</span>
              <h3 className={`font-display text-3xl uppercase leading-none ${featured ? "relative" : ""}`}>
                {card.title}
              </h3>
              {card.body ? (
                <p
                  className={`text-sm leading-relaxed ${featured ? "relative text-bg/75" : "text-muted"}`}
                >
                  {card.body}
                </p>
              ) : null}

              {card.rows?.length ? (
                <div className="mt-auto flex flex-col border-t border-line">
                  {card.rows.map((row) => (
                    <CopyRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              ) : null}

              {card.href ? (
                <div className={`mt-auto ${featured ? "relative" : ""}`}>
                  <MagneticButton href={card.href} variant={featured ? "dark" : "ghost"}>
                    {card.cta ?? "Give now"} <span aria-hidden>→</span>
                  </MagneticButton>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
