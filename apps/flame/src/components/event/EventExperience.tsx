"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

import Preloader from "@/components/Preloader";
import EventHero from "@/components/event/sections/EventHero";
import EventFooter from "@/components/event/sections/EventFooter";
import EventNav from "@/components/event/EventNav";
import AmbientVideo from "@/components/AmbientVideo";
import { motionTier } from "@/lib/motion";

const EmberScene = dynamic(() => import("@/components/canvas/EmberScene"), { ssr: false });
import type { BackdropElement } from "@/lib/backdrop";

export interface EventExperienceProps {
  presenter: string | null;
  presenterUrl: string | null;
  title: string;
  tagline: string | null;
  year: string | null;
  dateLabel: string | null;
  venueLabel: string | null;
  keyart: string | null;
  /** A silent loop behind the whole page, in place of the key art. */
  backdropVideo: string | null;
  ticketsHref: string | null;
  ticketsLabel: string;
  hasTickets: boolean;
  /** The composed running order, rendered on the SERVER and passed down.
   *  This component is a client component and several section renderers are
   *  async server components, so it cannot build this itself. */
  blocks: React.ReactNode;
  nav: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string }>;
  summary: string | null;
  preloaderLabel: string;
  /** Which element the moving backdrop is made of, or null when it is off. */
  backdrop: BackdropElement | null;
  /** False inside the Customizer preview, or when the church turned the intro
   *  off — the hero then plays immediately rather than waiting for a curtain
   *  that never rises. */
  preloader: boolean;
  /** When the event starts, as an instant. Null turns the hero countdown off. */
  startAtMs: number | null;
  /** When it ends. The clock removes itself past this, for a tab left open
   *  across the event — the page's own 60s revalidation can't reach that one. */
  endAtMs: number | null;
}

/**
 * The key art, holding still behind the page while the content scrolls over it.
 *
 * Fades back rather than staying at full strength: at 1.6 screens of scroll the
 * sections are what matters, and a poster at full contrast underneath them is
 * a legibility problem dressed up as atmosphere.
 */
function Backdrop({ src, video }: { src: string | null; video: string | null }) {
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

  /* Same scrub, same wash, different media. The loop only plays where there is
     headroom for it: on a "lite" device — a phone, a low-memory machine — the
     key art is the backdrop, and on "still" AmbientVideo would refuse to fetch
     it anyway. Checked here as well so the <video> is never even mounted. */
  const playable = Boolean(video) && motionTier() === "full";

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {playable && video ? (
        <AmbientVideo src={video} poster={src} preload="auto" className="opacity-50" />
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          className="h-full w-full animate-slow-zoom object-cover opacity-50 motion-reduce:animate-none"
        />
      ) : null}
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
        {heavy !== null && (props.keyart || props.backdropVideo) ? (
          <Backdrop src={props.keyart} video={props.backdropVideo} />
        ) : null}
        {/* Gated on the church's own switch as well as the capability probe.
            This branch used to check only whether the browser COULD draw the
            scene, so turning the moving backdrop off left it running here — the
            setting worked on the home page and silently did nothing on an
            event site. */}
        {heavy === true && props.backdrop ? (
          <div className="absolute inset-0">
            <EmberScene element={props.backdrop} />
          </div>
        ) : null}
        {/* A veil between the backdrop and everything above it. Content is drawn
            straight over the particle scene, so a bright element behind bright
            type erased whole letters — "YOUTH NIGHT" came out with holes in it.
            Sits inside the fixed layer, so it dims the scene and the key art
            together without touching the text. */}
        <div
          className="absolute inset-0"
          style={{ background: `rgb(0 0 0 / var(--backdrop-scrim, 0.45))` }}
        />
      </div>

      <EventNav
        loaded={loaded}
        title={props.title}
        items={props.nav}
        ticketsHref={props.ticketsHref ?? "#top"}
        ticketsLabel={props.ticketsLabel}
        hasTickets={props.hasTickets}
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
          ticketsHref={props.hasTickets ? props.ticketsHref : null}
          ticketsLabel={props.ticketsLabel}
          startAtMs={props.startAtMs}
          endAtMs={props.endAtMs}
        />

        {/* Everything below the hero is the church's arrangement. The hero
            stays put because no section type carries a date + venue lockup with
            a countdown, and a page that can lose its own opening is not worth
            the flexibility. */}
        {props.blocks}
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
