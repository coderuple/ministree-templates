"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";

export interface TimelineEntry {
  id: string;
  time: string;
  label: string;
}

/**
 * How the evening unfolds — a rail that fills as you scroll past it.
 *
 * Two separate mechanisms on purpose: the rail is *scrubbed*, so it tracks the
 * scroll position continuously, while each item rises in *once* and then holds.
 * A scrubbed entrance would rewind on the way back up, which reads as a glitch
 * rather than as choreography.
 */
export default function EventTimeline({
  entries,
  label,
  heading,
  note,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  entries: TimelineEntry[];
  label: string;
  heading: string;
  note: string | null;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        railRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list, start: "top 75%", end: "bottom 45%", scrub: 0.4 },
        },
      );

      gsap.utils.toArray<HTMLElement>(".night-item").forEach((item) => {
        gsap.from(item, {
          x: -32,
          autoAlpha: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: item, start: "top 78%", once: true },
        });
        // Marks whichever item is in the reading band, so the dot and the time
        // light up together as it passes.
        gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: "top 62%",
            end: "bottom 30%",
            toggleClass: { targets: item, className: "is-active" },
          },
        });
      });
    }, list);
    return () => ctx.revert();
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <section id={anchor} className="relative px-[4vw] py-32">
      <SectionHead index="03" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>

      <ol ref={listRef} className="relative ml-1 mt-16 max-w-3xl border-l border-line">
        <span
          ref={railRef}
          aria-hidden
          className="absolute -left-px top-0 h-full w-px origin-top bg-ember"
        />
        {entries.map((item) => (
          <li key={item.id} className="night-item group relative py-9 pl-10">
            <span
              aria-hidden
              className="absolute -left-[5px] top-[4.4rem] size-[9px] rounded-full bg-line transition-all duration-500 group-[.is-active]:bg-flame group-[.is-active]:shadow-[0_0_14px_var(--flame)]"
            />
            <span className="micro text-muted">{item.label}</span>
            <div className="font-display mt-1 text-5xl uppercase leading-none text-ink transition-colors duration-500 group-[.is-active]:text-ember md:text-7xl">
              {item.time}
            </div>
          </li>
        ))}
      </ol>

      {note ? <p className="micro mt-10 text-muted">{note}</p> : null}
    </section>
  );
}
