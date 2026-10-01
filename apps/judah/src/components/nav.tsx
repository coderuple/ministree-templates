"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { SocialLink } from "@ministree-templates/event-kit/socials";

/**
 * The header, and the index it opens.
 *
 * A solid bar on the page's own ground, so the filled ticket button keeps its
 * colour over every scene — nothing here watches the scroll to decide what
 * shade to be.
 *
 * Client only for the open/closed state, the Escape key and the light/dark
 * switch. The timecode is text the rewind engine writes; this just leaves it
 * an element to write into.
 */
export function Nav({
  links,
  wordmark,
  suffix,
  logo,
  logoDark,
  scheme,
  menuLabel,
  ticketsHref,
  ticketsLabel,
  socials,
  sticky,
  showTimecode,
}: {
  links: Array<{ label: string; href: string; n: string; inBar?: boolean }>;
  wordmark: string;
  suffix: string;
  logo: string | null;
  /** The mark for a dark header, when it differs from `logo`. */
  logoDark: string | null;
  /** The church's pick — what the switch shows before the visitor's loads. */
  scheme: string;
  menuLabel: string;
  ticketsHref: string | null;
  ticketsLabel: string;
  socials: SocialLink[];
  sticky: boolean;
  showTimecode: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    /* The index covers the page, so the page behind it must not scroll under
       it — and the width the scrollbar leaves behind must not shift the
       header sideways as it opens. */
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="header" data-chrome data-sticky={sticky ? undefined : "off"}>
        <a href="#top" className="wordmark">
          {logo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={wordmark} className={logoDark && logoDark !== logo ? "on-light" : undefined} />
              {logoDark && logoDark !== logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoDark} alt={wordmark} className="on-dark" />
              ) : null}
            </>
          ) : (
            <>
              {wordmark}
              {suffix ? <span>&nbsp;/&nbsp;{suffix}</span> : null}
            </>
          )}
        </a>

        {/* Wide screens only — below that the menu button opens the index. */}
        <nav className="header-links" aria-label="Sections">
          {links
            .filter((link) => link.inBar)
            .map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
        </nav>

        <div className="header-right">
          {showTimecode ? (
            /* Not announced: it is a decorative read-out of scroll position,
               and a screen reader would hear it change on every frame. */
            <span className="timecode" data-timecode aria-hidden="true">
              00:00:00:00
            </span>
          ) : null}
          <SchemeToggle initial={scheme} />
          <button
            type="button"
            className="chip menu-chip"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {menuLabel}
          </button>
          {ticketsHref ? (
            <a href={ticketsHref} className="cta">
              {ticketsLabel}
            </a>
          ) : null}
        </div>
      </header>

      {open ? (
        <div className="index inverse" role="dialog" aria-modal="true" aria-label="Index">
          <div className="index-head mono-sm">
            <span>
              {wordmark}
              {suffix ? ` / ${suffix}` : ""} — INDEX
            </span>
            <button type="button" className="chip" onClick={() => setOpen(false)}>
              ✕ CLOSE
            </button>
          </div>

          <nav className="index-nav">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="index-link" onClick={() => setOpen(false)}>
                <span className="n">{link.n}</span>
                <span className="t">{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="index-foot mono-sm">
            {socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

type Scheme = "light" | "dark" | "auto";
const NEXT: Record<Scheme, Scheme> = { light: "dark", dark: "auto", auto: "light" };
const LABEL: Record<Scheme, string> = { light: "Light", dark: "Dark", auto: "Auto" };

/* The scheme lives on <html data-scheme>, where the layout's inline script
   put the visitor's stored pick before first paint. This is the one writer
   after that, so a plain listener set is all the store needs. */
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const readScheme = (): Scheme => {
  const s = document.documentElement.dataset.scheme;
  return s === "dark" || s === "auto" ? s : "light";
};
const applyScheme = () => {
  const s = readScheme();
  document.documentElement.classList.toggle(
    "dark",
    s === "dark" || (s === "auto" && matchMedia("(prefers-color-scheme: dark)").matches),
  );
};

/** Light → dark → automatic, remembered on the visitor's device. */
function SchemeToggle({ initial }: { initial: string }) {
  const server: Scheme = initial === "dark" || initial === "auto" ? initial : "light";
  const scheme = useSyncExternalStore(subscribe, readScheme, () => server);

  /* Automatic follows the device live — a phone that turns dark at sunset
     takes the page with it. A no-op in the other two. */
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applyScheme);
    return () => mq.removeEventListener("change", applyScheme);
  }, []);

  const next = NEXT[scheme];
  return (
    <button
      type="button"
      className="chip scheme"
      data-state={scheme}
      aria-label={`Colours: ${LABEL[scheme]}. Switch to ${LABEL[next]}.`}
      title={`Switch to ${LABEL[next].toLowerCase()}`}
      onClick={() => {
        document.documentElement.dataset.scheme = next;
        try {
          localStorage.setItem("judah-scheme", next);
        } catch {
          /* Private mode: the switch still works for this visit. */
        }
        applyScheme();
        listeners.forEach((fn) => fn());
      }}
    >
      {LABEL[scheme].toUpperCase()}
    </button>
  );
}

export default Nav;
