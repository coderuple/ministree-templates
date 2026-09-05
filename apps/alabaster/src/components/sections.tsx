import { MediaFrame } from "@ministree-templates/event-kit/media-frame";
import { EmbersCanvas } from "@ministree-templates/event-kit/embers-canvas";
import type { EventDay, EventVenue, Speaker } from "@ministree-templates/event-kit/event";

/**
 * Alabaster's spine, top to bottom. Every one of these is a server component:
 * the only client islands on the page are the nav, the ember canvases and
 * checkout. Motion is CSS reading the custom properties the scroll engine
 * writes, so nothing here re-renders as the reader scrolls.
 *
 * A section with nothing to show returns null rather than an empty frame.
 */

/** Splits a textarea into paragraphs on blank lines. */
function paragraphs(text: string | undefined | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Splits a textarea into lines, dropping the trailing blank one. */
export function lines(text: string | undefined | null): string[] {
  return (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Renders a phrase with one substring lit up.
 *
 * The church types the words they want emphasised rather than marking them up,
 * so this finds them wherever they fall — and renders the line unchanged when
 * they do not appear at all, which is what happens the moment someone edits
 * the quote and forgets this field.
 */
function Emphasise({ text, emphasis }: { text: string; emphasis?: string }) {
  const needle = emphasis?.trim();
  if (!needle) return <>{text}</>;
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <em>{text.slice(at, at + needle.length)}</em>
      {text.slice(at + needle.length)}
    </>
  );
}

/* --- Hero --------------------------------------------------------------- */

export function Hero({
  eyebrow,
  headline,
  accentMark,
  subhead,
  dateLabel,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  pullQuote,
  pullQuoteRef,
  image,
  imageBrief,
  embers,
}: {
  eyebrow: string;
  headline: string;
  accentMark?: string;
  subhead?: string;
  dateLabel: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  pullQuote?: string;
  pullQuoteRef?: string;
  image?: string | null;
  imageBrief?: string;
  embers: boolean;
}) {
  return (
    <section id="top" data-track="pin" className="hero">
      <div className="hero-pin">
        <div aria-hidden className="ember-bloom" />

        <div className="hero-portrait">
          <MediaFrame src={image} brief={imageBrief} alt="" priority sizes="100vw" />
          <div aria-hidden className="hero-scrim" />
        </div>

        {embers ? <EmbersCanvas className="hero-embers" /> : null}

        <div className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="hero-title">
            {headline}
            {accentMark ? <i>{accentMark}</i> : null}
          </h1>
          {subhead ? <p className="hero-sub">{subhead}</p> : null}
          {dateLabel ? <p className="hero-dates">{dateLabel}</p> : null}
          <div className="hero-actions">
            <a href={ctaHref} className="btn btn-primary">
              {ctaLabel}
            </a>
            {secondaryLabel ? (
              <a href={secondaryHref || "#about"} className="btn btn-outline">
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>

        {pullQuote ? (
          <blockquote className="hero-quote">
            <p>&ldquo;{pullQuote}&rdquo;</p>
            {pullQuoteRef ? <cite>{pullQuoteRef}</cite> : null}
          </blockquote>
        ) : null}

        <div aria-hidden className="scroll-cue">
          <span>Scroll</span>
          <span />
        </div>
      </div>
    </section>
  );
}

/* --- Manifesto ---------------------------------------------------------- */

export function Manifesto({
  eyebrow,
  headingA,
  headingB,
  lede,
  body,
  closingA,
  closingB,
  image,
  imageBrief,
  insetImage,
  insetBrief,
}: {
  eyebrow: string;
  headingA: string;
  headingB?: string;
  lede?: string;
  body?: string;
  closingA?: string;
  closingB?: string;
  image?: string | null;
  imageBrief?: string;
  insetImage?: string | null;
  insetBrief?: string;
}) {
  const paras = paragraphs(body);
  if (!lede && paras.length === 0) return null;

  return (
    <section id="about" data-track="cover" className="section manifesto">
      <div className="inner manifesto-grid">
        <div>
          <p className="eyebrow" data-reveal="up">
            {eyebrow}
          </p>
          <h2 className="display" data-reveal="up">
            {headingA}
            {headingB ? (
              <>
                <br />
                <em>{headingB}</em>
              </>
            ) : null}
          </h2>
          <div className="manifesto-copy">
            {lede ? (
              <p className="lede" data-reveal="up" style={{ "--reveal-delay": "60ms" } as React.CSSProperties}>
                {lede}
              </p>
            ) : null}
            {paras.map((p, i) => (
              <p
                key={p.slice(0, 24)}
                className="body"
                data-reveal="up"
                style={{ "--reveal-delay": `${140 + i * 80}ms` } as React.CSSProperties}
              >
                {p}
              </p>
            ))}
            {closingA || closingB ? (
              <p
                className="manifesto-close"
                data-reveal="up"
                style={{ "--reveal-delay": "300ms" } as React.CSSProperties}
              >
                {closingA}
                {closingB ? (
                  <>
                    <br />
                    <em>{closingB}</em>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>

        <div className="manifesto-figure" data-reveal="blur">
          <MediaFrame src={image} brief={imageBrief} alt="" aspect="3 / 4" sizes="(max-width: 760px) 100vw, 45vw" />
          {insetImage || insetBrief ? (
            <div className="manifesto-inset">
              <MediaFrame src={insetImage} brief={insetBrief} alt="" sizes="20vw" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* --- Catch / Rekindle / Fan --------------------------------------------- */

export interface Stage {
  eyebrow: string;
  word: string;
  phrase: string;
  body: string;
}

export function Stages({
  stages,
  image,
  imageBrief,
  embers,
}: {
  stages: Stage[];
  image?: string | null;
  imageBrief?: string;
  embers: boolean;
}) {
  if (stages.length === 0) return null;

  return (
    <section data-track="pin" className="stages">
      <div className="stages-pin">
        <div aria-hidden className="stages-heat" />
        <div aria-hidden className="stages-dim" />

        <div className="stages-backdrop">
          <MediaFrame src={image} brief={imageBrief} alt="" sizes="80vw" />
        </div>

        {embers ? <EmbersCanvas className="stages-embers" /> : null}

        <div className="stages-copy">
          {stages.map((stage, i) => (
            <div key={stage.word} data-stage={i} className={`stage stage-${i + 1}`}>
              <p className="eyebrow">{stage.eyebrow}</p>
              <h3 className="stage-word">{stage.word}</h3>
              <p className="stage-phrase">{stage.phrase}</p>
              <p className="stage-body">{stage.body}</p>
            </div>
          ))}
        </div>

        <div aria-hidden className="stage-dots">
          {stages.map((s) => (
            <span key={s.word} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Scripture ---------------------------------------------------------- */

export function Scripture({
  quote,
  emphasis,
  reference,
}: {
  quote: string;
  emphasis?: string;
  reference: string;
}) {
  if (!quote) return null;
  return (
    <section data-track="cover" className="section section-lg section-dark scripture">
      <div aria-hidden className="scripture-glow" />
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {reference}
        </p>
        <blockquote data-reveal="up" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          &ldquo;<Emphasise text={quote} emphasis={emphasis} />&rdquo;
        </blockquote>
        <span
          aria-hidden
          className="scripture-rule"
          data-reveal="up"
          style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
        />
      </div>
    </section>
  );
}

/* --- Speakers ----------------------------------------------------------- */

export function Speakers({
  eyebrow,
  headingA,
  headingB,
  speakers,
  briefs,
  placeholder,
}: {
  eyebrow: string;
  headingA: string;
  headingB?: string;
  speakers: Speaker[];
  /** Art direction for portraits a church has not uploaded yet. */
  briefs?: string[];
  placeholder?: {
    show: boolean;
    label: string;
    title: string;
    note?: string;
    linkLabel?: string;
    linkHref?: string;
  };
}) {
  const showPlaceholder = placeholder?.show !== false && Boolean(placeholder?.title);
  if (speakers.length === 0 && !showPlaceholder) return null;

  return (
    <section id="speakers" data-track="cover" className="section speakers">
      <div className="speakers-head">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <h2 className="display" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
          {headingA}
          {headingB ? (
            <>
              <br />
              <em>{headingB}</em>
            </>
          ) : null}
        </h2>
      </div>

      <div className="speakers-grid">
        {speakers.map((person, i) => (
          <article
            key={person.id}
            className="speaker"
            data-reveal="up"
            style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          >
            <MediaFrame
              src={person.image}
              brief={briefs?.[i]}
              alt={person.name}
              aspect="3 / 4"
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <div className="speaker-name">
              <h3>{person.name}</h3>
              <span className="speaker-index">{String(i + 1).padStart(2, "0")}</span>
            </div>
            {person.role ? <p className="speaker-role">{person.role}</p> : null}
            {person.bio ? <p className="small">{person.bio}</p> : null}
          </article>
        ))}

        {showPlaceholder && placeholder ? (
          <article
            className="speaker speaker-soon"
            data-reveal="up"
            style={{ "--reveal-delay": `${speakers.length * 90}ms` } as React.CSSProperties}
          >
            <div>
              <p className="eyebrow">{placeholder.label}</p>
              <h3>{placeholder.title}</h3>
              {placeholder.note ? <p className="small">{placeholder.note}</p> : null}
            </div>
            {placeholder.linkLabel ? (
              <a className="link" href={placeholder.linkHref || "#tickets"}>
                {placeholder.linkLabel} <span aria-hidden>→</span>
              </a>
            ) : null}
          </article>
        ) : null}
      </div>
    </section>
  );
}

/* --- The days ----------------------------------------------------------- */

export interface DayBeat {
  name?: string;
  description?: string;
  image?: string | null;
  imageBrief?: string;
}

export function Days({
  eyebrow,
  headingA,
  headingEm,
  headingB,
  days,
  beats,
}: {
  eyebrow: string;
  headingA: string;
  headingEm?: string;
  headingB?: string;
  days: EventDay[];
  beats: DayBeat[];
}) {
  if (days.length === 0) return null;

  return (
    <section id="schedule" data-track="cover" className="section section-parchment">
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <h2
          className="display"
          data-reveal="up"
          style={{ "--reveal-delay": "80ms", marginBottom: "clamp(36px,5cqi,80px)" } as React.CSSProperties}
        >
          {headingA} {headingEm ? <em>{headingEm}</em> : null} {headingB}
        </h2>

        {/* Capped at the number of dates the event actually has. A church can
            leave a beat unwritten — that day still shows its date — but they
            cannot add a fourth day the conference does not have. */}
        <div className="days-grid" data-reveal="up">
          {days.map((day, i) => {
            const beat = beats[i];
            return (
              <div key={day.id} className="day">
                <div className="day-head">
                  <span className="day-numeral">{day.numeral}</span>
                  <div>
                    <div className="day-weekday">{day.weekday}</div>
                    <div className="day-time">{day.time}</div>
                  </div>
                </div>
                <MediaFrame
                  src={beat?.image}
                  brief={beat?.imageBrief}
                  alt=""
                  aspect="4 / 3"
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
                {beat?.name || beat?.description ? (
                  <div>
                    {beat.name ? <div className="day-beat">{beat.name}</div> : null}
                    {beat.description ? <p className="small">{beat.description}</p> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --- Venue -------------------------------------------------------------- */

export function Venue({
  eyebrow,
  heading,
  blurb,
  venue,
  images,
  imageBrief,
}: {
  eyebrow: string;
  heading: string;
  blurb?: string;
  venue: EventVenue | null;
  images: string[];
  imageBrief?: string;
}) {
  if (!venue && images.length === 0) return null;

  return (
    <section id="venue" data-track="cover" className="section">
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <h2 className="display" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
          {heading}
        </h2>

        <div className="venue-grid">
          <div data-reveal="up">
            {venue?.name ? <p className="venue-name">{venue.name}</p> : null}
            {venue?.address ? <address className="body venue-address">{venue.address}</address> : null}
            {blurb ? <p className="body" style={{ marginTop: "1.2em" }}>{blurb}</p> : null}
            {venue?.directionsUrl ? (
              <a
                className="link"
                href={venue.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "clamp(20px,2.6cqi,36px)" }}
              >
                Get directions <span aria-hidden>→</span>
              </a>
            ) : null}
          </div>

          <div className="venue-images" data-reveal="blur">
            {(images.length > 0 ? images : [null]).map((src, i) => (
              <MediaFrame
                key={src ?? i}
                src={src}
                brief={src ? undefined : imageBrief}
                alt=""
                aspect="4 / 3"
                sizes="(max-width: 760px) 100vw, 25vw"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- The experience ----------------------------------------------------- */

export function Experience({
  eyebrow,
  headingA,
  headingEm,
  headingB,
  chips,
  images,
  briefs,
}: {
  eyebrow: string;
  headingA: string;
  headingEm?: string;
  headingB?: string;
  chips: string[];
  images: string[];
  briefs?: string[];
}) {
  return (
    <section id="experience" data-track="cover" className="section">
      <div className="inner">
        <div className="experience-head">
          <div>
            <p className="eyebrow" data-reveal="up">
              {eyebrow}
            </p>
            <h2 className="display" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
              {headingA} {headingEm ? <em>{headingEm}</em> : null} {headingB}
            </h2>
          </div>
          {chips.length > 0 ? (
            <div className="chips" data-reveal="up" style={{ "--reveal-delay": "140ms" } as React.CSSProperties}>
              {chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* The wrapper carries the reveal, not the frame: MediaFrame passes
            `style` to the frame itself, so a delay set there had nothing to
            delay and the pictures simply appeared. */}
        <div className="experience-frames">
          {(briefs ?? []).map((brief, i) => (
            <div
              key={brief}
              data-reveal="up"
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <MediaFrame
                src={images[i]}
                brief={brief}
                alt=""
                aspect="3 / 4"
                sizes="(max-width: 760px) 50vw, 22vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Different stories -------------------------------------------------- */

export function Stories({
  headingA,
  headingB,
  body,
  images,
  briefs,
}: {
  headingA: string;
  headingB: string;
  body: string;
  images: string[];
  briefs?: string[];
}) {
  return (
    <section data-track="cover" className="section stories">
      <div className="inner stories-grid">
        <div>
          <h2 data-reveal="up">{headingA}</h2>
          <h2 className="stories-em" data-reveal="up" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            {headingB}
          </h2>
          <p className="body" data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
            {body}
          </p>
        </div>
        <div className="stories-frames" data-reveal="blur">
          {(briefs ?? []).map((brief, i) => (
            <MediaFrame key={brief} src={images[i]} brief={brief} alt="" aspect="3 / 4" sizes="(max-width: 760px) 50vw, 22vw" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Final CTA ---------------------------------------------------------- */

export function FinalCta({
  eyebrow,
  headingA,
  headingB,
  body,
  ctaLabel,
  ctaHref,
  dateLabel,
  embers,
}: {
  eyebrow: string;
  headingA: string;
  headingB: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  dateLabel: string;
  embers: boolean;
}) {
  return (
    <section id="tickets" data-track="cover" className="section section-lg cta">
      {embers ? <EmbersCanvas className="cta-embers" /> : null}
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <h2 data-reveal="up" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
          {headingA}
          <br />
          <em>{headingB}</em>
        </h2>
        <p data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          {body}
        </p>
        <div className="cta-actions" data-reveal="up" style={{ "--reveal-delay": "280ms" } as React.CSSProperties}>
          <a href={ctaHref} className="btn btn-light">
            {ctaLabel}
          </a>
          {dateLabel ? <span className="cta-date">{dateLabel}</span> : null}
        </div>
      </div>
    </section>
  );
}

/* --- FAQ ---------------------------------------------------------------- */

export function Faq({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: string;
  items: Array<{ question: string; answer: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <section id="faq" data-track="cover" className="section">
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <h2 className="display" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
          {heading}
        </h2>
        <div className="faq-list" data-reveal="up">
          {items.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p className="body">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Footer ------------------------------------------------------------- */

export function Footer({
  logo,
  organisation,
  description,
  navLinks,
  socials,
  email,
  legal,
  year,
}: {
  logo: string | null;
  organisation: string;
  description: string;
  navLinks: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string; handle: string }>;
  email: string | null;
  legal: Array<{ label: string; href: string }>;
  year: number;
}) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          {logo ? (
            <span className="footer-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt={organisation} />
            </span>
          ) : (
            <span className="nav-wordmark">{organisation}</span>
          )}
          <div className="footer-org">{organisation}</div>
          <p>{description}</p>
        </div>

        <div className="footer-col">
          <span>Conference</span>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        {socials.length > 0 || email ? (
          <div className="footer-col">
            <span>Connect</span>
            {socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
          </div>
        ) : null}

        {legal.length > 0 ? (
          <div className="footer-col">
            <span>Legal</span>
            {legal.map((l) => (
              <a key={l.label} href={l.href || "#top"}>
                {l.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>

      {socials.length > 0 ? (
        <div className="footer-socials">
          {socials.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
              <span>{s.label}</span>
              <span>{s.handle}</span>
            </a>
          ))}
        </div>
      ) : null}

      <div className="footer-legal">
        <span>
          © {year} {organisation}
        </span>
      </div>
    </footer>
  );
}
