import { MediaFrame } from "@ministree-templates/event-kit/media-frame";
import type { EventDay, EventVenue, Speaker } from "@ministree-templates/event-kit/event";

/**
 * Ivory's spine. Same facts as the other two concepts, a different magazine.
 *
 * The two signatures live here: the masthead that crosses from crimson into
 * bone as the hero scrolls, and the three-panel spread that moves sideways
 * while the reader scrolls down. Both are CSS reading --p; nothing re-renders.
 */

function paragraphs(text: string | undefined | null): string[] {
  return (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export function lines(text: string | undefined | null): string[] {
  return (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
}

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

/** The rule-and-numeral row that heads each section of the issue. */
export function Marker({ marker, eyebrow }: { marker?: string; eyebrow?: string }) {
  if (!marker && !eyebrow) return null;
  return (
    <div className="marker" data-reveal="up">
      {marker ? <span>{marker}</span> : null}
      {eyebrow ? <span>{eyebrow}</span> : null}
    </div>
  );
}

/* --- Hero --------------------------------------------------------------- */

export function Hero({
  eyebrow,
  headline,
  accentMark,
  subhead,
  dateLabel,
  intro,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  scriptureRef,
  image,
}: {
  eyebrow: string;
  headline: string;
  accentMark?: string;
  subhead?: string;
  dateLabel: string;
  intro?: string;
  ctaLabel: string;
  /** Null when there is nowhere to buy — the button hides. */
  ctaHref: string | null;
  secondaryLabel?: string;
  secondaryHref?: string;
  scriptureRef?: string;
  image?: string | null;
}) {
  return (
    <section id="top" data-track="pin" className="hero">
      <div className="hero-pin">
        <div aria-hidden className="hero-block" />

        <div className="hero-portrait">
          <MediaFrame src={image} alt="" priority sizes="40vw" />
        </div>

        <div className="hero-eyebrow">
          <p className="eyebrow">{eyebrow}</p>
          {subhead ? <p className="hero-kicker">{subhead}</p> : null}
        </div>

        <h1 className="masthead">
          {headline}
          {accentMark ? <i>{accentMark}</i> : null}
        </h1>

        <div className="hero-foot">
          <div className="hero-foot-copy">
            {intro ? <p className="body">{intro}</p> : null}
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
          {dateLabel ? <p className="hero-dates">{dateLabel}</p> : null}
        </div>

        {scriptureRef ? <span className="hero-scripture">{scriptureRef}</span> : null}
      </div>
    </section>
  );
}

/* --- Marquee ------------------------------------------------------------ */

export function Marquee({ phrases }: { phrases: string[] }) {
  if (phrases.length === 0) return null;
  /* Duplicated so the 50% translate loops seamlessly. aria-hidden: it is a
     decorative repetition of copy the page already states. */
  const run = (
    <span>
      {phrases.map((p) => (
        <span key={p}>
          {p}
          <span className="marquee-star" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {run}
        {run}
      </div>
    </div>
  );
}

/* --- Manifesto ---------------------------------------------------------- */

export function Manifesto({
  marker,
  eyebrow,
  headingA,
  headingB,
  lede,
  body,
  pullLine,
  image,
  insetImage,
}: {
  marker?: string;
  eyebrow: string;
  headingA: string;
  headingB?: string;
  lede?: string;
  body?: string;
  pullLine?: string;
  image?: string | null;
  insetImage?: string | null;
}) {
  const paras = paragraphs(body);
  if (!lede && paras.length === 0) return null;

  return (
    <section id="about" data-track="cover" className="section">
      <div className="inner">
        <Marker marker={marker} eyebrow={eyebrow} />
        <h2 className="display" data-reveal="up">
          {headingA}
        </h2>
        {headingB ? (
          <h2
            className="display display-b"
            data-reveal="up"
            style={{ "--reveal-delay": "100ms" } as React.CSSProperties}
          >
            <em>{headingB}</em>
          </h2>
        ) : null}

        {/* Three columns: drop-capped copy, a portrait, and a stacked pair. */}
        <div className="manifesto-grid">
          <div data-reveal="up" style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>
            {lede ? <p className="body dropcap">{lede}</p> : null}
            {paras.map((p) => (
              <p key={p.slice(0, 24)} className="body" style={{ marginTop: "1em" }}>
                {p}
              </p>
            ))}
          </div>

          <MediaFrame
            src={image}
            alt=""
            aspect="4 / 5"
            sizes="(max-width: 760px) 100vw, 33vw"
          />

          <div className="manifesto-stack">
            <MediaFrame
              src={insetImage}
              alt=""
              aspect="1 / 1"
              sizes="(max-width: 760px) 100vw, 33vw"
            />
            {pullLine ? <p className="manifesto-pull">{pullLine}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- The horizontal three-spread ---------------------------------------- */

export interface Stage {
  eyebrow: string;
  word: string;
  phrase: string;
  body: string;
}

export function Stages({
  stages,
  images,
  slots = 0,
}: {
  stages: Stage[];
  images: string[];
  /** How many frames this section draws. Fixed by the design. */
  slots?: number;
}) {
  if (stages.length === 0) return null;

  return (
    <section data-track="pin" className="stages">
      <div className="stages-pin">
        {/* Legible across ink, crimson and orange from one rule, because the
            label is composited in difference mode rather than coloured. */}
        <div className="stages-progress" aria-hidden>
          {stages.map((s) => (
            <span key={s.word}>{s.word}</span>
          ))}
        </div>

        <div className="stages-row">
          {stages.map((stage, i) => (
            <article key={stage.word} data-stage={i} className={`stage stage-${i + 1}`}>
              <div className="stage-copy">
                <p className="eyebrow">{stage.eyebrow}</p>
                <h3 className="stage-word">{stage.word}</h3>
                <p className="stage-phrase">{stage.phrase}</p>
                <p className="stage-body">{stage.body}</p>
              </div>
              <div className="stage-figure">
                <MediaFrame src={images[i]} alt="" size="1600 × 1200" sizes="50vw" />
              </div>
            </article>
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
    <section data-track="cover" className="section section-lg scripture">
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {reference}
        </p>
        <blockquote data-reveal="up" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
          <Emphasise text={quote} emphasis={emphasis} />
        </blockquote>
      </div>
    </section>
  );
}

/* --- Speakers: alternating full-width rows ------------------------------ */

export function Speakers({
  marker,
  eyebrow,
  headingA,
  headingB,
  speakers,
  slots = 0,
  note,
}: {
  marker?: string;
  eyebrow: string;
  headingA: string;
  headingB?: string;
  speakers: Speaker[];
  /** How many frames this section draws. Fixed by the design. */
  slots?: number;
  note?: string;
}) {
  if (speakers.length === 0) return null;

  return (
    <section id="speakers" data-track="cover" className="section section-ink">
      <div className="inner">
        <Marker marker={marker} eyebrow={eyebrow} />
        <h2 className="display" data-reveal="up">
          {headingA}
        </h2>
        {headingB ? (
          <h2 className="display display-b" data-reveal="up" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
            <em>{headingB}</em>
          </h2>
        ) : null}

        <div className="speakers-rows">
          {speakers.map((person, i) => (
            <article
              key={person.id}
              className="speaker"
              data-reveal={i % 2 === 0 ? "right" : "left"}
            >
              <div className="speaker-figure">
                <MediaFrame
                  src={person.image}
                  alt={person.name}
                  size="1280 × 1600"
                  sizes="(max-width: 760px) 100vw, 30vw"
                />
              </div>
              <div className="speaker-copy">
                <div className="speaker-meta">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {person.role ? <span>{person.role}</span> : null}
                </div>
                <h3 className="speaker-name">{person.name}</h3>
                {person.bio ? <p className="body speaker-bio">{person.bio}</p> : null}
              </div>
            </article>
          ))}
        </div>

        {note ? <p className="speakers-note">{note}</p> : null}
      </div>
    </section>
  );
}

/* --- Three days: colour-blocked panels ---------------------------------- */

export interface DayBeat {
  name?: string;
  description?: string;
  image?: string | null;
}

export function Days({
  marker,
  eyebrow,
  headingA,
  headingEm,
  headingB,
  days,
  beats,
}: {
  marker?: string;
  eyebrow: string;
  headingA: string;
  headingEm?: string;
  headingB?: string;
  days: EventDay[];
  beats: DayBeat[];
}) {
  if (days.length === 0) return null;

  return (
    <section id="schedule" data-track="cover" className="section">
      <div className="inner">
        <Marker marker={marker} eyebrow={eyebrow} />
        <h2 className="display" data-reveal="up">
          {headingA} {headingEm ? <em>{headingEm}</em> : null} {headingB}
        </h2>

        <div className="days-grid" data-reveal="up">
          {days.map((day, i) => {
            const beat = beats[i];
            return (
              <article key={day.id} className="day">
                <div className="day-head">
                  <span>{day.weekday}</span>
                  <span>{day.time}</span>
                </div>
                <p className="day-numeral">{day.numeral}</p>
                {beat?.name || beat?.description ? (
                  <div className="day-beat">
                    {beat.name ? <h3>{beat.name}</h3> : null}
                    {beat.description ? <p>{beat.description}</p> : null}
                  </div>
                ) : null}
              </article>
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
        <Marker eyebrow={eyebrow} />
        <div className="venue-grid">
          <div data-reveal="up">
            <p className="venue-name">{venue?.name ?? heading}</p>
            {venue?.address ? <address className="body venue-address">{venue.address}</address> : null}
            {blurb ? <p className="body" style={{ marginTop: "1.2em" }}>{blurb}</p> : null}
            {venue?.directionsUrl ? (
              <a
                className="link"
                href={venue.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "clamp(18px,2.4cqi,32px)" }}
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

/* --- Experience: the contact strip -------------------------------------- */

export function Experience({
  marker,
  eyebrow,
  headingA,
  headingEm,
  headingB,
  chips,
  images,
  slots = 0,
}: {
  marker?: string;
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
    <section id="experience" data-track="cover" className="section section-ink">
      <div className="inner">
        <Marker marker={marker} eyebrow={eyebrow} />
        <div className="experience-head">
          <h2 className="display" data-reveal="up">
            {headingA} {headingEm ? <em>{headingEm}</em> : null} {headingB}
          </h2>
          {chips.length > 0 ? (
            <div className="chips" data-reveal="up" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
              {chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="experience-strip" data-reveal="up">
          {Array.from({ length: slots }, (_, i) => (
            <MediaFrame key={i} src={images[i]} alt="" size="1070 × 1600" sizes="20vw" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Different stories --------------------------------------------------- */

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
    <section data-track="cover" className="section">
      <div className="inner">
        <h2 className="display" data-reveal="up">
          {headingA}
        </h2>
        <h2 className="display display-b" data-reveal="up" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
          <em>{headingB}</em>
        </h2>

        {/* Four portraits and, in the fifth cell, the paragraph — bottom
            aligned, so the text reads as one more column of the contact sheet. */}
        <div className="stories-row" data-reveal="up">
          {Array.from({ length: slots }, (_, i) => (
            <MediaFrame key={i} src={images[i]} alt="" size="1070 × 1600" sizes="20vw" />
          ))}
          <p className="body stories-note">{body}</p>
        </div>
      </div>
    </section>
  );
}

/* --- Final CTA ----------------------------------------------------------- */

export function FinalCta({
  eyebrow,
  lineOne,
  lineTwo,
  lineThree,
  ctaLabel,
  ctaHref,
  dateLabel,
  watermark,
}: {
  eyebrow: string;
  lineOne: string;
  lineTwo: string;
  lineThree: string;
  ctaLabel: string;
  /** Null when there is nowhere to buy — the button hides. */
  ctaHref: string | null;
  dateLabel: string;
  watermark?: string;
}) {
  return (
    <section id="tickets" data-track="cover" className="section section-lg section-crimson cta">
      {watermark ? (
        <p className="cta-watermark" aria-hidden>
          {watermark}
        </p>
      ) : null}
      <div className="inner">
        <p className="eyebrow" data-reveal="up">
          {eyebrow}
        </p>
        <div className="cta-lines" data-reveal="up" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
          <h2>{lineOne}</h2>
          <h2>{lineTwo}</h2>
          <h2>{lineThree}</h2>
        </div>
        <div className="cta-foot" data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
          {dateLabel ? <p className="cta-date">{dateLabel}</p> : null}
          {ctaHref ? (
            <a href={ctaHref} className="btn btn-light">
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* --- FAQ ----------------------------------------------------------------- */

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
        <Marker eyebrow={eyebrow} />
        <h2 className="display" data-reveal="up">
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

/* --- Footer -------------------------------------------------------------- */

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
