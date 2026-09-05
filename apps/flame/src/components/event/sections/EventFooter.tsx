"use client";

import { lenisStore } from "@/lib/state";

/**
 * The drifting outlined wordmark is the sign-off. Sized in `vw` so it stays a
 * full-bleed graphic rather than a heading, and marked `aria-hidden` — it is
 * the event name repeated, and a screen reader has already heard it.
 */
export default function EventFooter({
  title,
  year,
  presenter,
  presenterUrl,
  summary,
  nav,
  socials,
  dateLabel,
  venueLabel,
}: {
  title: string;
  year: string | null;
  presenter: string | null;
  presenterUrl: string | null;
  summary: string | null;
  nav: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string }>;
  dateLabel: string | null;
  venueLabel: string | null;
}) {
  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    // Lenis owns the scroll position; window.scrollTo would fight it.
    lenisStore.current?.scrollTo(href, { duration: 1.6 });
  };

  return (
    <footer className="relative z-10 border-t border-line bg-surface/60">
      <div className="select-none overflow-hidden py-12" aria-hidden>
        <div className="flex w-max animate-marquee-slow motion-reduce:animate-none">
          {[0, 1].map((half) => (
            <div key={half} className="flex w-max shrink-0 items-center">
              {[0, 1].map((rep) => (
                <span key={rep} className="flex items-baseline gap-8 pr-16">
                  <span className="font-display text-outline text-[14vw] uppercase leading-none">
                    {title}
                  </span>
                  {year ? (
                    <span className="font-display text-[14vw] uppercase leading-none text-ember/20">
                      {year}
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-12 px-[4vw] pb-16 md:grid-cols-12">
        <div className="md:col-span-5">
          {summary ? <p className="max-w-sm leading-relaxed text-muted">{summary}</p> : null}
          {presenter && presenterUrl ? (
            <a
              href={presenterUrl}
              className="micro mt-4 inline-block text-ember"
            >
              {presenter}
            </a>
          ) : presenter ? (
            <p className="micro mt-4 text-muted">{presenter}</p>
          ) : null}
        </div>

        {nav.length > 0 ? (
          <nav className="md:col-span-3" aria-label="Footer">
            <h4 className="micro text-muted">Navigate</h4>
            <ul className="mt-5 flex flex-col gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => goTo(e, item.href)}
                    className="text-sm uppercase tracking-wider text-ink transition-colors duration-300 hover:text-ember"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {socials.length > 0 ? (
          <div className="md:col-span-4">
            <h4 className="micro text-muted">Follow</h4>
            <ul className="mt-5 flex flex-col gap-3">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm uppercase tracking-wider text-ink transition-colors duration-300 hover:text-ember"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 border-t border-line px-[4vw] py-6 md:flex-row md:items-center md:justify-between">
        <span className="micro text-muted">
          {year ? `© ${year} ` : ""}
          {presenter ?? title}
        </span>
        <span className="micro text-muted">
          {[dateLabel, venueLabel].filter(Boolean).join(" — ")}
        </span>
      </div>
    </footer>
  );
}
