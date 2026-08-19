"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";

export interface LineupPerson {
  id: string;
  name: string;
  role: string | null;
  image: string | null;
}

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
}: {
  people: LineupPerson[];
  label: string;
  heading: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const float = floatRef.current;
    if (!wrap || !float) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(float, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.6, ease: "power3" });
    const rTo = gsap.quickTo(float, "rotation", { duration: 0.8, ease: "power3" });

    let lastX = 0;
    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
      // Tilt with the direction of travel, so the portrait has weight.
      rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.5));
      lastX = e.clientX;
    };
    wrap.addEventListener("mousemove", onMove, { passive: true });
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    gsap.to(floatRef.current, {
      autoAlpha: active === null ? 0 : 1,
      scale: active === null ? 0.85 : 1,
      duration: 0.45,
      ease: "power3.out",
    });
  }, [active]);

  useEffect(() => {
    const rows = rowsRef.current?.querySelectorAll(".lineup-row");
    if (!rows?.length) return;
    const tween = gsap.from(rows, {
      y: 48,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.08,
      ease: "expo.out",
      scrollTrigger: { trigger: rowsRef.current, start: "top 80%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [people.length]);

  if (people.length === 0) return null;

  return (
    <section id="lineup" className="relative px-[4vw] py-32">
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
              onMouseEnter={() => setActive(i)}
              className="lineup-row group flex items-baseline gap-8 border-t border-line py-7 last:border-b"
            >
              <span className="font-display text-sm text-muted transition-colors duration-300 group-hover:text-ember">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-[5vw] uppercase leading-none text-ink transition-all duration-300 group-hover:translate-x-3 group-hover:text-ember">
                {person.name}
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
          <figure key={person.id} className="w-[70vw] shrink-0 snap-center">
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
          </figure>
        ))}
      </div>
    </section>
  );
}
