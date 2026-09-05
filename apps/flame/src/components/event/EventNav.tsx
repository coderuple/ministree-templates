"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { lenisStore } from "@/lib/state";
import MagneticButton from "@/components/MagneticButton";
import { reducedMotion, revealsDisabled } from "@/lib/motion";

/**
 * The event site's own bar — the church header would be wrong here, because in
 * this mode there is no church site to navigate to.
 *
 * Drops in only once the curtain has lifted, and the links scroll rather than
 * route: single-event mode is one page, so every destination is an anchor.
 */
export default function EventNav({
  loaded,
  title,
  items,
  ticketsHref,
  ticketsLabel,
  hasTickets,
}: {
  loaded: boolean;
  title: string;
  items: Array<{ label: string; href: string }>;
  ticketsHref: string;
  ticketsLabel: string;
  /** The hero already hides its button when nothing is on sale; the bar used
   *  to keep one that scrolled to the top of the page it was already on. */
  hasTickets: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    /* autoAlpha, not yPercent alone. Translated off-screen the bar is still
       painted and still focusable, so tabbing from the address bar walked
       through the whole nav and the tickets button while the curtain was up.
       autoAlpha carries visibility: hidden, which takes them out of the tab
       order until the bar actually arrives. */
    if (!revealsDisabled()) gsap.set(barRef.current, { yPercent: -110, autoAlpha: 0 });
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!loaded || revealsDisabled()) return;
    gsap.to(barRef.current, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "expo.out", delay: 0.15 });
  }, [loaded]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (open) {
      lenisStore.current?.stop();
      /* Lenis intercepts wheel and touch — not the keyboard. Arrow keys, Space
         and PageDown still scrolled the page behind the open menu, so the
         overflow lock has to be set as well, not instead. */
      document.documentElement.style.overflow = "hidden";
      // Every duration collapses to 0 under reduced motion: the menu appears,
      // rather than fading and sliding in. Same idiom as the cursor.
      const d = reducedMotion() ? 0 : 1;
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 * d });
      gsap.fromTo(
        overlay.querySelectorAll(".menu-link"),
        { yPercent: 120 },
        { yPercent: 0, duration: 0.9 * d, stagger: 0.07 * d, ease: "expo.out", delay: 0.1 * d },
      );
      overlay.querySelector<HTMLElement>(".menu-link")?.focus();
    } else {
      lenisStore.current?.start();
      document.documentElement.style.overflow = "";
      // Only after a real close, or the hamburger would steal focus on mount.
      if (wasOpen.current) burgerRef.current?.focus({ preventScroll: true });
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: reducedMotion() ? 0 : 0.35,
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
    }
    wasOpen.current = open;
  }, [open]);

  /* Unmount with the menu open — a preview reload, a route change — used to
     leave the page permanently unscrollable. Unconditional, because the cost of
     starting an already-started Lenis is nothing and the cost of missing one is
     a frozen page. */
  useEffect(
    () => () => {
      lenisStore.current?.start();
      document.documentElement.style.overflow = "";
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setOpen(false);
    lenisStore.current?.scrollTo(href, { duration: 1.6 });
  };

  return (
    <>
      <header
        ref={barRef}
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[4vw] py-5 transition-colors duration-500 ${
          scrolled ? "bg-bg/70 backdrop-blur-xl" : ""
        }`}
      >
        <a href="#top" onClick={(e) => goTo(e, "#top")} className="font-display text-sm uppercase tracking-[0.2em] text-ink">
          {title}
        </a>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => goTo(e, item.href)}
              data-cursor
              className="micro text-muted transition-colors duration-300 hover:text-ember"
            >
              {item.label}
            </a>
          ))}
          {hasTickets ? (
            <MagneticButton href={ticketsHref} className="px-6 py-2.5 text-[11px]">
              {ticketsLabel}
            </MagneticButton>
          ) : null}
        </nav>

        {/* The name stays "Menu" and aria-expanded carries the state — flipping
            it to "Close" puts a second identically-named control on the page,
            and this one sits under the overlay where nobody can reach it. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="event-menu"
          aria-label="Menu"
          ref={burgerRef}
          className="relative z-50 flex h-10 w-10 items-center justify-center text-ink md:hidden"
        >
          <span className="relative block h-3 w-6" aria-hidden>
            <span
              className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "translate-y-[5.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-300 ${
                open ? "translate-y-[-5.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </header>

      <div
        id="event-menu"
        ref={overlayRef}
        hidden={!open}
        className="invisible fixed inset-0 z-40 hidden flex-col justify-center gap-2 bg-bg/95 px-[6vw] backdrop-blur-xl md:hidden"
      >
        {items.map((item, i) => (
          <div key={item.href} className="overflow-hidden">
            <a
              href={item.href}
              onClick={(e) => goTo(e, item.href)}
              className="menu-link flex items-baseline gap-4 py-1"
            >
              <span className="font-display text-sm text-ember">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
                {item.label}
              </span>
            </a>
          </div>
        ))}
        {hasTickets ? (
          <a
            href={ticketsHref}
            onClick={(e) => goTo(e, ticketsHref)}
            className="menu-link mt-10 inline-block w-max rounded-full bg-ember px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-bg"
          >
            {ticketsLabel}
          </a>
        ) : null}
      </div>
    </>
  );
}
