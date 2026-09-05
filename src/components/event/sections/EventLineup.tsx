"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";
import { reducedMotion, revealsDisabled } from "@/lib/motion";
import SpeakerModal from "@/components/event/SpeakerModal";

export interface LineupPerson {
  id: string;
  /** URL-safe name, so a card can be linked to as ?speaker=<slug>. */
  slug: string;
  name: string;
  role: string | null;
  image: string | null;
  /** Ministree already sends this on every event person, guests included. */
  bio: string | null;
}

/** Whether a card is worth opening. A row that opens an empty modal is worse
 *  than a row that does nothing, so this decides whether it is a button. */
const hasCard = (p: LineupPerson) => Boolean(p.bio);

/**
 * Who's on — a typographic list on desktop, swipeable cards on a phone.
 *
 * The portrait tracks the cursor rather than sitting in a grid: the names are
 * the composition, and the picture is what the pointer uncovers. `quickTo`
 * rather than a fresh tween per mousemove — one interpolator retargeted on each
 * event, instead of hundreds of overlapping tweens fighting for the same
 * property.
 *
 * Guarded on `(pointer: fine)`. On a touch screen there is no hover to follow,
 * and the mobile branch below carries the same people as real cards.
 */
export default function EventLineup({
  people,
  label,
  heading,
  venueLabel,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  people: LineupPerson[];
  label: string;
  heading: string;
  /** Where they're appearing, for the card's footer line. */
  venueLabel?: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<LineupPerson | null>(null);

  /* A shared ?speaker=<slug> link opens straight onto that card. Read once on
     mount rather than watched: after this the modal owns the parameter, and
     re-reading it would fight the history.replaceState the modal does on close. */
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("speaker");
    if (!slug) return;
    const match = people.find((p) => p.slug === slug);
    /* The URL is the external system here, and it cannot be read during render
       — this component is server-rendered and `window` does not exist there.
       Same shape as the clock in Countdown.tsx, disabled the same way. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match && hasCard(match)) setOpen(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const float = floatRef.current;
    if (!wrap || !float) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    /* The portrait keeps tracking the pointer under reduced motion — that is
       direct manipulation, the same as a tooltip, and dropping it would leave a
       desktop visitor with names and no faces. What goes is the *lag* and the
       tilt: the picture sits under the cursor exactly, with no easing or sway. */
    const still = reducedMotion();
    const lag = still ? 0 : 1;
    const xTo = gsap.quickTo(float, "x", { duration: 0.6 * lag, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.6 * lag, ease: "power3" });
    const rTo = gsap.quickTo(float, "rotation", { duration: 0.8 * lag, ease: "power3" });

    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
      // Tilt with the direction of travel, so the portrait has weight.
      rTo(still ? 0 : gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.5));
      lastX = e.clientX;
    };
    wrap.addEventListener("mousemove", onMove, { passive: true });
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    gsap.to(floatRef.current, {
      autoAlpha: active === null ? 0 : 1,
      scale: active === null ? 0.85 : 1,
      duration: reducedMotion() ? 0 : 0.45,
      ease: "power3.out",
    });
  }, [active]);

  useEffect(() => {
    const rows = rowsRef.current?.querySelectorAll(".lineup-row");
    if (!rows?.length) return;
    // A `from` tween: leaving it unbuilt already lands the rows where they belong.
    if (revealsDisabled()) return;
    /* gsap.context, not a bare kill(). Killing a `from` mid-flight leaves its
       target at the *from* state — autoAlpha: 0 — so a strict-mode double mount
       used to leave the whole lineup invisible. revert() puts the inline styles
       back the way they were found. */
    const ctx = gsap.context(() => {
      gsap.from(rows, {
        y: 48,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: rowsRef.current, start: "top 80%", once: true },
      });
    }, rowsRef);
    return () => ctx.revert();
  }, [people.length]);

  if (people.length === 0) return null;

  return (
    <section id={anchor} className="relative px-[4vw] py-32">
      <SectionHead index="02" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>

      <div ref={wrapRef} className="relative mt-16 hidden md:block" onMouseLeave={() => setActive(null)}>
        <div ref={rowsRef}>
          {people.map((person, i) => (
            <div
              key={person.id}
              data-cursor
              onMouseEnter={() => {
                /* Touch browsers fire mouseenter on tap. Without this the
                   floating portrait appeared on a phone, where nothing is
                   tracking the pointer, and sat in the corner until you
                   tapped elsewhere. */
                if (window.matchMedia("(pointer: fine)").matches) setActive(i);
              }}
              className="lineup-row group flex w-full items-baseline gap-8 border-t border-line py-7 text-left last:border-b"
            >
              <span className="font-display text-sm text-muted transition-colors duration-300 group-hover:text-ember">
                {String(i + 1).padStart(2, "0")}
              </span>
              {/* The button wraps the name rather than the row: a <button> may
                  only contain phrasing content, so a row-sized one would put an
                  <h3> inside it and lose the heading. The name is the biggest
                  thing on the row anyway, so the target is not small. */}
              <h3 className="font-display text-[5vw] uppercase leading-none text-ink transition-all duration-300 group-hover:translate-x-3 group-hover:text-ember">
                {hasCard(person) ? (
                  <button
                    type="button"
                    onClick={() => setOpen(person)}
                    className="text-left uppercase"
                  >
                    {person.name}
                  </button>
                ) : (
                  person.name
                )}
              </h3>
              {person.role ? <span className="micro ml-auto text-muted">{person.role}</span> : null}
            </div>
          ))}
        </div>

        <div
          ref={floatRef}
          className="pointer-events-none invisible absolute left-0 top-0 z-10 aspect-[3/4] w-72 -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-0"
        >
          {people.map((person, i) =>
            person.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={person.id}
                src={person.image}
                alt=""
                aria-hidden
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  active === i ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null,
          )}
        </div>
      </div>

      {/* Phones get the portraits as cards — there is no hover to reveal them. */}
      <div className="mx-[-4vw] mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[4vw] pb-4 md:hidden">
        {people.map((person, i) => (
          <figure key={person.id} className="relative w-[70vw] shrink-0 snap-center">
            <div className="aspect-[3/4] overflow-hidden border border-line">
              {person.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.image}
                  alt={person.role ? `${person.name} — ${person.role}` : person.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-surface" />
              )}
            </div>
            <figcaption className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-xs text-ember">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-2xl uppercase leading-none">{person.name}</span>
            </figcaption>
            {person.role ? <p className="micro mt-2 text-muted">{person.role}</p> : null}
            {/* A transparent overlay rather than wrapping the card: the card is
                a figure full of flow content, which cannot live inside a button. */}
            {hasCard(person) ? (
              <button
                type="button"
                onClick={() => setOpen(person)}
                aria-label={`About ${person.name}`}
                className="absolute inset-0"
              />
            ) : null}
          </figure>
        ))}
      </div>

      <SpeakerModal
        person={open}
        people={people}
        venueLabel={venueLabel ?? null}
        onClose={() => setOpen(null)}
      />
    </section>
  );
}
