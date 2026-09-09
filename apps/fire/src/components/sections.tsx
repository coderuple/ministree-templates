import { MediaFrame } from "@ministree-templates/event-kit/media-frame";
import type { EventDay, EventVenue, Speaker } from "@ministree-templates/event-kit/event";

/**
 * Fire's spine, top to bottom. Every one of these is a server component — the
 * nav and checkout are the only client islands on the page.
 *
 * No section carries a background: they all float on the single sticky
 * backdrop, which is the concept. Everything that moves is CSS reading the
 * custom properties the scroll engine writes.
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

/* --- Hero: the portal --------------------------------------------------- */

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
  scrollLabel,
  image,
}: {
  eyebrow: string;
  headline: string;
  accentMark?: string;
  subhead?: string;
  dateLabel: string;
  ctaLabel: string;
  /** Null when there is nowhere to buy — the button hides. */
  ctaHref: string | null;
  secondaryLabel?: string;
  secondaryHref?: string;
  pullQuote?: string;
  pullQuoteRef?: string;
  scrollLabel?: string;
  image?: string | null;
}) {
  return (
    <section id="top" data-track="pin" className="hero">
      <div className="hero-pin">
        {/* The portal grows and rises as you scroll; the ring stays put at the
            portal's rest size, so the picture appears to swell inside it. */}
        <div className="hero-portal">
          <MediaFrame src={image} alt="" priority sizes="70vw" />
        </div>
        <div aria-hidden className="hero-ring" />

        <div className="hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="hero-title">
            {headline}
            {accentMark ? <i>{accentMark}</i> : null}
          </h1>
          {subhead ? <p className="hero-sub">{subhead}</p> : null}
          {dateLabel ? <p className="hero-dates">{dateLabel}</p> : null}
          <div className="hero-actions">
            {ctaHref ? (
              <a href={ctaHref} className="btn btn-primary">
                {ctaLabel}
              </a>
            ) : null}
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
          <span>{scrollLabel || "Let it carry you"}</span>
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
}: {
  eyebrow: string;
  headingA: string;
  headingB?: string;
  lede?: string;
  body?: string;
  closingA?: string;
  closingB?: string;
  image?: string | null;
}) {
  const paras = paragraphs(body);
  if (!lede && paras.length === 0) return null;

  return (
    <section id="about" data-track="cover" className="section manifesto">
      <div className="inner manifesto-grid">
        {/* The blob leads, on the left — this concept opens on a shape, not
            on a headline. */}
        <div className="manifesto-figure" data-reveal="blur">
          <MediaFrame src={image} alt="" size="1200 × 1600" sizes="(max-width: 760px) 100vw, 45vw" />
        </div>

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
      </div>
    </section>
  );
}

/* --- Portal crossfade ---------------------------------------------------- */

export interface Stage {
  eyebrow: string;
  word: string;
  phrase: string;
  body: string;
}

export function Stages({ stages, images }: { stages: Stage[]; images: string[] }) {
  if (stages.length === 0) return null;

  return (
    <section data-track="pin" data-stage-ramp="0.06" className="stages">
      <div className="stages-pin">
        {/* One portal per stage, stacked. Each drifts, settles a touch larger
            than the last and rotates as it lands, so the fire visibly grows
            across the three. --o comes from the engine; the rest is CSS. */}
        {stages.map((stage, i) => (
          <div key={`orb-${stage.word}`} data-stage={i} className={`orb orb-${i + 1}`} aria-hidden>
            <MediaFrame src={images[i]} alt="" size="1600 × 1600" sizes="60vw" />
          </div>
        ))}

        {stages.map((stage, i) => (
          <div key={stage.word} data-stage={i} className="stage">
            <p className="eyebrow">{stage.eyebrow}</p>
            <h3 className="stage-word">{stage.word}</h3>
            <p className="stage-phrase">{stage.phrase}</p>
            <p className="stage-body">{stage.body}</p>
          </div>
        ))}
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
    <section data-track="cover" className="section section-lg scripture">
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
  placeholder,
}: {
  eyebrow: string;
  headingA: string;
  headingB?: string;
  speakers: Speaker[];
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
      <div className="inner">
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

      <div className="inner speakers-grid">
        {speakers.map((person, i) => (
          <article
            key={person.id}
            className="speaker"
            data-reveal="up"
            style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          >
            <MediaFrame
              src={person.image}
              alt={person.name}
              size="1200 × 1600"
              sizes="(max-width: 760px) 100vw, 25vw"
            />
            <h3 className="speaker-name">{person.name}</h3>
            {person.role ? <p className="speaker-role">{person.role}</p> : null}
            {person.bio ? <p className="small">{person.bio}</p> : null}
          </article>
        ))}

        {showPlaceholder && placeholder ? (
          <article
            className="speaker-soon"
            data-reveal="up"
            style={{ "--reveal-delay": `${speakers.length * 90}ms` } as React.CSSProperties}
          >
            <p className="eyebrow">{placeholder.label}</p>
            <h3>{placeholder.title}</h3>
            {placeholder.note ? <p className="small">{placeholder.note}</p> : null}
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
                <MediaFrame
                  src={beat?.image}
                  alt=""
                  size="1600 × 1600"
                  sizes="(max-width: 760px) 100vw, 30vw"
                />
                <p className="day-numeral">{day.numeral}</p>
                <div className="day-weekday">{day.weekday}</div>
                <div className="day-time">{day.time}</div>
                {beat?.name ? <div className="day-beat">{beat.name}</div> : null}
                {beat?.description ? <p className="small">{beat.description}</p> : null}
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
}: {
  eyebrow: string;
  heading: string;
  blurb?: string;
  venue: EventVenue | null;
  images: string[];
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
                alt=""
                size="1600 × 1600"
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
  slots = 0,
}: {
  eyebrow: string;
  headingA: string;
  headingEm?: string;
  headingB?: string;
  chips: string[];
  images: string[];
  /** How many frames this section draws. Fixed by the design. */
  slots?: number;
}) {
  return (
    <section id="experience" data-track="cover" className="section">
      <div className="inner">
        <div className="experience-head">
          <p className="eyebrow" data-reveal="up">
            {eyebrow}
          </p>
          <h2 className="display" data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
            {headingA} {headingEm ? <em>{headingEm}</em> : null} {headingB}
          </h2>
        </div>

        {/* Circular frames, each carrying the word it stands for. */}
        <div className="experience-frames">
          {Array.from({ length: slots }, (_, i) => (
            <div
              key={i}
              data-reveal="blur"
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            >
              <MediaFrame src={images[i]} alt="" size="1600 × 1600" sizes="(max-width: 760px) 50vw, 18vw" />
              {chips[i] ? <span className="experience-caption">{chips[i]}</span> : null}
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
  slots = 0,
}: {
  headingA: string;
  headingB: string;
  body: string;
  images: string[];
  /** How many frames this section draws. Fixed by the design. */
  slots?: number;
}) {
  return (
    <section data-track="cover" className="section stories">
      <div className="inner">
        <h2 data-reveal="up">{headingA}</h2>
        <h2 className="stories-em" data-reveal="up" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
          {headingB}
        </h2>
        <p className="body" data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          {body}
        </p>
        {/* Overlapping circles with a ground-coloured border, so four
            portraits read as one connected group. */}
        <div className="stories-frames" data-reveal="blur">
          {Array.from({ length: slots }, (_, i) => (
            <MediaFrame key={i} src={images[i]} alt="" size="1600 × 1600" sizes="18vw" />
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
}: {
  eyebrow: string;
  headingA: string;
  headingB: string;
  body: string;
  ctaLabel: string;
  /** Null when there is nowhere to buy — the button hides. */
  ctaHref: string | null;
  dateLabel: string;
}) {
  return (
    <section id="tickets" data-track="cover" className="section section-lg cta">
      <div aria-hidden className="cta-bloom" />
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
          {ctaHref ? (
            <a href={ctaHref} className="btn btn-light">
              {ctaLabel}
            </a>
          ) : null}
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
