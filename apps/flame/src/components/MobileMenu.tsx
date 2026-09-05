"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@ministree/template-sdk";
import { gsap } from "@/lib/gsap";
import { lenisStore } from "@/lib/state";

/**
 * Navigation for phones and tablets.
 *
 * The header hides the desktop nav below `md`, so without this a visitor on a
 * phone had a logo and nothing else — no way to reach sermons, events or giving.
 *
 * Unlike the inspiration this was modelled on, flame is a multi-page site: links
 * are real routes, so the menu closes on navigation rather than scrolling to an
 * anchor, and a nav item's children render as an indented sub-list instead of a
 * hover dropdown (there is no hover on a touch screen).
 */
export default function MobileMenu({
  items,
  giveHref,
}: {
  items: NavNode[];
  giveHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close on navigation. Without this the overlay stays up over the new page,
  // because a route change doesn't unmount the header.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Lenis keeps scrolling the page underneath an overlay unless it's stopped;
    // the body class is the belt-and-braces for browsers without it running.
    if (open) {
      lenisStore.current?.stop();
      document.body.classList.add("overflow-hidden");
    } else {
      lenisStore.current?.start();
      document.body.classList.remove("overflow-hidden");
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(overlay, { display: "flex" });
        if (reduced) {
          gsap.set(overlay, { autoAlpha: 1 });
          gsap.set(overlay.querySelectorAll(".menu-link"), { yPercent: 0, autoAlpha: 1 });
          return;
        }
        gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
        gsap.fromTo(
          overlay.querySelectorAll(".menu-link"),
          { yPercent: 120 },
          { yPercent: 0, duration: 0.85, stagger: 0.06, ease: "expo.out", delay: 0.08 },
        );
      } else {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: reduced ? 0 : 0.3,
          onComplete: () => gsap.set(overlay, { display: "none" }),
        });
      }
    }, overlay);

    return () => ctx.revert();
  }, [open]);

  /* Send focus back to the trigger when the menu closes, so keyboard users
     aren't dropped at the top of the document. This used to call blur(), which
     does the opposite of what the line above it promised — it dropped focus to
     <body> and the next Tab restarted from the top of the page. Guarded on a
     real close, or the button would grab focus on first mount. */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!open && wasOpen.current) buttonRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  useEffect(
    () => () => {
      document.body.classList.remove("overflow-hidden");
      lenisStore.current?.start();
    },
    [],
  );

  return (
    <>
      {/* The name stays "Menu" and `aria-expanded` carries the state. It used to
          flip to "Close menu", which put two identically-named controls on the
          page — and this one sits underneath the overlay, so that name pointed
          at the button you cannot reach. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="flame-mobile-menu"
        aria-label="Menu"
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

      {/* Portalled to <body> deliberately. The site header sets `backdrop-blur`,
          and a backdrop-filter makes an element a CONTAINING BLOCK for its
          `position: fixed` descendants — so an overlay rendered inside the
          header resolved `inset-0` against the header's own box and appeared as
          a strip across the top instead of covering the screen. */}
      {mounted
        ? createPortal(
            <div
              id="flame-mobile-menu"
              ref={overlayRef}
              hidden={!open}
              className="invisible fixed inset-0 z-[100] hidden flex-col justify-center overflow-y-auto bg-bg/95 px-[6vw] py-24 backdrop-blur-xl md:hidden"
            >
              {/* The overlay is portalled to <body> and sits above the header,
                  so the header's own toggle is buried underneath it — without
                  this the only way out is the Escape key. */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-[6vw] top-6 flex h-10 w-10 items-center justify-center text-ink"
              >
                <span className="relative block h-5 w-5" aria-hidden>
                  <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
                  <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
                </span>
              </button>

              <nav aria-label="Menu">
          <ul className="flex flex-col gap-1">
            {items.map((item, i) => (
              <li key={`${item.label}-${item.href}`} className="overflow-hidden">
                <Link
                  href={item.href || "#"}
                  className="menu-link flex items-baseline gap-4 py-1"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-display text-sm text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
                    {item.label}
                  </span>
                </Link>

                {item.children?.length ? (
                  <ul className="mb-2 ml-10 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <li key={`${child.label}-${child.href}`} className="overflow-hidden">
                        <Link
                          href={child.href || "#"}
                          className="menu-link block py-1 text-[11px] uppercase tracking-[0.18em] text-muted"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        {/* The header's Give button is hidden below `sm`, so the menu carries it. */}
              <Link
                href={giveHref}
                onClick={() => setOpen(false)}
                className="menu-link mt-10 inline-block w-max rounded-full bg-ember px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-bg"
              >
                Give
              </Link>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
