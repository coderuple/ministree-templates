"use client";

import { useEffect, useState } from "react";
import type { SocialLink } from "@ministree-templates/event-kit/socials";

/**
 * The header, and the index it opens.
 *
 * `mix-blend-mode: difference` in the stylesheet is what lets one header sit
 * legibly over the black opening, the ivory archive rail and the red closing
 * band without ever changing colour — so nothing here watches the scroll to
 * decide what shade to be.
 *
 * Client only for the open/closed state and the Escape key. The timecode is
 * text the rewind engine writes; this just leaves it an element to write into.
 */
export function Nav({
  links,
  wordmark,
  suffix,
  logo,
  menuLabel,
  ticketsHref,
  ticketsLabel,
  socials,
  sticky,
  showTimecode,
}: {
  links: Array<{ label: string; href: string; n: string }>;
  wordmark: string;
  suffix: string;
  logo: string | null;
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
            <img src={logo} alt={wordmark} />
          ) : (
            <>
              {wordmark}
              {suffix ? <span>&nbsp;/&nbsp;{suffix}</span> : null}
            </>
          )}
        </a>

        <div className="header-right">
          {showTimecode ? (
            /* Not announced: it is a decorative read-out of scroll position,
               and a screen reader would hear it change on every frame. */
            <span className="timecode" data-timecode aria-hidden="true">
              00:00:00:00
            </span>
          ) : null}
          <button
            type="button"
            className="chip"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {menuLabel}
          </button>
          {ticketsHref ? (
            <a href={ticketsHref} className="chip">
              {ticketsLabel}
            </a>
          ) : null}
        </div>
      </header>

      {open ? (
        <div className="index" role="dialog" aria-modal="true" aria-label="Index">
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

export default Nav;
