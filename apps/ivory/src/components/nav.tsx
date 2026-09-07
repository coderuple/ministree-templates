"use client";

import { useEffect, useState } from "react";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * The sticky nav, and the panel it becomes on a phone.
 *
 * `data-chrome` marks it for the scroll engine, which measures it into
 * --chrome so the pinned hero starts below it rather than under it.
 *
 * Client, because the menu opens and closes. The desktop/mobile swap is NOT
 * decided here — that is a container query in the stylesheet, so the right one
 * paints on the first frame instead of after hydration.
 */
export function Nav({
  links,
  ticketsHref,
  ticketsLabel,
  logo,
  wordmark,
  socials,
  sticky = true,
}: {
  links: NavLink[];
  /** Null when tickets have nowhere to be bought — the CTA hides. */
  ticketsHref: string | null;
  ticketsLabel: string;
  logo: string | null;
  wordmark: string;
  socials: Array<{ label: string; href: string }>;
  sticky?: boolean;
}) {
  const [open, setOpen] = useState(false);

  /* An open panel over a scrolling page is a scroll trap. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav data-chrome="1" className={sticky ? "nav" : "nav nav-static"}>
      <a href="#top" className="nav-logo" aria-label={wordmark}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={wordmark} />
        ) : (
          <span className="nav-wordmark">{wordmark}</span>
        )}
      </a>

      <div className="nav-links">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
        {ticketsHref ? (
          <a href={ticketsHref} className="nav-cta">
            {ticketsLabel}
          </a>
        ) : null}
      </div>

      <div className="nav-mobile">
        {ticketsHref ? (
          <a href={ticketsHref} className="nav-cta">
            Tickets
          </a>
        ) : null}
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden className="nav-toggle-bars">
            <span />
            <span />
          </span>
        </button>
      </div>

      {open ? (
        <div id="menu" className="menu">
          <div className="menu-links">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
                <span aria-hidden>→</span>
              </a>
            ))}
          </div>
          <div className="menu-foot">
            {ticketsHref ? (
              <a href={ticketsHref} className="btn btn-primary" onClick={() => setOpen(false)}>
                {ticketsLabel}
              </a>
            ) : null}
            {socials.length > 0 ? (
              <div className="menu-socials">
                {socials.map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}

/**
 * The issue line under the nav. Its own [data-chrome] element, so the engine
 * measures BOTH bars into --chrome and the pinned hero starts below the pair.
 * Sticky at --navh, which is the nav's height alone.
 */
export function IssueBar({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div data-chrome="1" className="issue-bar">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export default Nav;
