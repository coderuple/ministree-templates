"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

import Preloader from "@/components/Preloader";
import Marquee from "@/components/Marquee";
import EventHero from "@/components/event/sections/EventHero";
import EventVision from "@/components/event/sections/EventVision";
import EventLineup, { type LineupPerson } from "@/components/event/sections/EventLineup";
import EventTimeline, { type TimelineEntry } from "@/components/event/sections/EventTimeline";
import EventVenue from "@/components/event/sections/EventVenue";
import EventTickets, { type TicketTier } from "@/components/event/sections/EventTickets";
import EventGive, { type GiveCard } from "@/components/event/sections/EventGive";
import EventFaq, { type FaqEntry } from "@/components/event/sections/EventFaq";
import EventFooter from "@/components/event/sections/EventFooter";
import EventNav from "@/components/event/EventNav";

const EmberScene = dynamic(() => import("@/components/canvas/EmberScene"), { ssr: false });

export interface EventExperienceProps {
  presenter: string | null;
  presenterUrl: string | null;
  title: string;
  tagline: string | null;
  year: string | null;
  dateLabel: string | null;
  venueLabel: string | null;
  keyart: string | null;
  marquee: string[];
  marqueeSecondary: string[];
  vision: { body: string; label: string; footnote: string | null } | null;
  lineup: { people: LineupPerson[]; label: string; heading: string };
  timeline: { entries: TimelineEntry[]; label: string; heading: string; note: string | null };
  venue: {
    label: string;
    name: string;
    blurb: string | null;
    address: string | null;
    directionsUrl: string | null;
    images: string[];
  } | null;
  tickets: {
    tiers: TicketTier[];
    label: string;
    heading: string;
    href: string;
    ctaLabel: string;
    blurb: string | null;
    note: string | null;
  };
  give: { cards: GiveCard[]; label: string; heading: string; strapline: string | null };
  faq: { entries: FaqEntry[]; label: string; heading: string };
  nav: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string }>;
  summary: string | null;
  preloaderLabel: string;
  /** False inside the Customizer preview, or when the church turned the intro
   *  off — the hero then plays immediately rather than waiting for a curtain
   *  that never rises. */
  preloader: boolean;
}

/**
 * The key art, holding still behind the page while the content scrolls over it.
 *
 * Fades back rather than staying at full strength: at 1.6 screens of scroll the
 * sections are what matters, and a poster at full contrast underneath them is
 * a legibility problem dressed up as atmosphere.
 */
function Poster({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 1 },
      {
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.6}`,
          scrub: 0.4,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="h-full w-full animate-slow-zoom object-cover opacity-50 motion-reduce:animate-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/30 to-bg" />
    </div>
  );
}

/**
 * Single-event mode: the whole site is one gathering.
 *
 * A fixed cinematic backdrop with the page scrolling over it, rather than a
 * sequence of bordered sections — that single decision is most of what makes
 * this read as an event site instead of a church site with an event on it.
 *
 * Everything here comes from the event's own record in Ministree, so a church
 * maintains one event and gets this for free.
 */
export default function EventExperience(props: EventExperienceProps) {
  const [loaded, setLoaded] = useState(!props.preloader);
  const [heavy, setHeavy] = useState<boolean | null>(null);

  useEffect(() => {
    // Two gates, both required. Reduced motion is a stated preference; WebGL is
    // a capability — a machine without it throws on context creation rather
    // than degrading, which is how the flame took the whole page down once.
    const wantsMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    let webgl = false;
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
    /* Neither answer exists during render: `matchMedia` and a WebGL context are
       both browser-only, and probing them on the server would throw or lie.
       One state change on mount by design — `heavy` starts null and the
       backdrop stays empty until it resolves. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHeavy(wantsMotion && webgl);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    // Sticky and scrubbed triggers measured against a page that still had the
    // curtain over it; once it lifts the real heights are known.
    ScrollTrigger.refresh();
  }, [loaded]);

  return (
    <>
      {/* SmoothScroll, Cursor, grain and vignette come from the root layout —
          they are site-wide, and mounting a second Lenis here would give the
          page two things fighting over its scroll position. */}
      {props.preloader ? (
        <Preloader label={props.preloaderLabel} onDone={() => setLoaded(true)} />
      ) : null}

      <div className="fixed inset-0 z-0" aria-hidden>
        {heavy !== null && props.keyart ? <Poster src={props.keyart} /> : null}
        {heavy === true ? (
          <div className="absolute inset-0">
            <EmberScene />
          </div>
        ) : null}
      </div>

      <EventNav
        loaded={loaded}
        title={props.title}
        items={props.nav}
        ticketsHref={props.tickets.href}
        ticketsLabel={props.tickets.ctaLabel}
      />

      <main className="relative z-10">
        <EventHero
          loaded={loaded}
          presenter={props.presenter}
          title={props.title}
          tagline={props.tagline}
          year={props.year}
          dateLabel={props.dateLabel}
          venueLabel={props.venueLabel}
          ticketsHref={props.tickets.tiers.length > 0 ? props.tickets.href : null}
          ticketsLabel={props.tickets.ctaLabel}
        />

        {props.marquee.length > 0 ? <Marquee items={props.marquee} /> : null}

        {props.vision ? (
          <EventVision
            body={props.vision.body}
            label={props.vision.label}
            footnote={props.vision.footnote}
            backdrop={props.keyart}
          />
        ) : null}

        <EventLineup {...props.lineup} />
        <EventTimeline {...props.timeline} />

        {props.marqueeSecondary.length > 0 ? (
          <Marquee items={props.marqueeSecondary} speed="slow" />
        ) : null}

        {props.venue ? <EventVenue {...props.venue} /> : null}
        <EventTickets {...props.tickets} />
        <EventGive {...props.give} />
        <EventFaq {...props.faq} />
      </main>

      <EventFooter
        title={props.title}
        year={props.year}
        presenter={props.presenter}
        presenterUrl={props.presenterUrl}
        summary={props.summary}
        nav={props.nav}
        socials={props.socials}
        dateLabel={props.dateLabel}
        venueLabel={props.venueLabel}
      />
    </>
  );
}
