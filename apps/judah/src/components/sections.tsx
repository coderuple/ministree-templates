import { MediaFrame } from "@ministree-templates/event-kit/media-frame";
import type { EventVenue, Speaker } from "@ministree-templates/event-kit/event";
import type { SocialLink } from "@ministree-templates/event-kit/socials";
import type { SiteContent } from "@/config/site";

/**
 * Judah's sections. Every one is a server component — the only client code on
 * the page is the scroll engine, the rewind read-out and the index menu.
 *
 * A pinned scene is a tall `<section data-track="pin">` with a `100svh` sticky
 * child. `data-track` is all the shared engine needs; what each scene DOES
 * with the `--p` it writes lives entirely in the stylesheet.
 */

type Content = SiteContent;

/* ── 01 · NOISE ────────────────────────────────────────────────────────── */
export function Noise({
  content,
  eyebrow,
  image,
}: {
  content: Content["hero"];
  /** The conference's own name, above the question. */
  eyebrow: string;
  image: string | null;
}) {
  return (
    <section id="top" className="scene noise" data-track="pin">
      <div className="pin">
        <div className="plate">
          <MediaFrame src={image} alt="" priority sizes="100vw" />
        </div>

        {/* The culture's voice, not the church's: four columns of what a man
            is told, drifting upward and blurring with the reader's own scroll
            speed until the question takes the screen. */}
        <div className="noise-storm" aria-hidden="true">
          {content.noise.map((col, i) => (
            <div className="noise-col" key={i}>
              {i % 2 === 0 ? (
                <div className="noise-card">
                  <div className="mono-xs" style={{ opacity: 0.4 }}>
                    {col.label}
                  </div>
                  <div className="noise-shout" style={{ marginBottom: 0, marginTop: 8 }}>
                    {col.shout}
                  </div>
                </div>
              ) : (
                <>
                  <div className="noise-shout">{col.shout}</div>
                  <div className="noise-meta mono-sm">{col.label}</div>
                </>
              )}
              <div className="noise-card">
                <div className="bars hatch" />
              </div>
              {col.serif ? <div className="noise-serif">{col.serif}</div> : null}
            </div>
          ))}
        </div>

        <div className="centre">
          <div>
            <div className="noise-eyebrow">{eyebrow}</div>
            <h1 className="noise-question">
              {content.headline}
              {content.headlineItalic ? (
                <>
                  <br />
                  <em>{content.headlineItalic}</em>
                </>
              ) : null}
            </h1>
            {content.strapline ? <div className="noise-answer">{content.strapline}</div> : null}
          </div>
        </div>

        {content.scrollLabel ? <div className="scroll-cue">{content.scrollLabel}</div> : null}
      </div>
    </section>
  );
}

/* ── 02 · INTERRUPT ────────────────────────────────────────────────────── */
export function Interrupt({ content }: { content: Content["tension"] }) {
  return (
    <section id="tension" className="scene interrupt" data-track="pin">
      <div className="pin">
        <div className="plate">
          <MediaFrame src={content.image} alt="" sizes="100vw" />
        </div>
        <div className="tape-lines" aria-hidden="true" />
        <div className="tape-sweep" aria-hidden="true" />

        <div className="interrupt-body">
          {content.badge ? <div className="badge">{content.badge}</div> : null}
          <h2>
            {content.headingA}
            <br />
            {content.headingB}
            {content.headingAccent ? (
              <>
                <br />
                <span>{content.headingAccent}</span>
              </>
            ) : null}
          </h2>
          {content.body ? <p>{content.body}</p> : null}
        </div>
      </div>
    </section>
  );
}

/* ── 03 · ARCHIVE ──────────────────────────────────────────────────────── */
export function Archive({ content }: { content: Content["archive"] }) {
  return (
    <section id="archive" className="scene archive" data-track="pin" data-archive>
      <div className="pin">
        <div className="archive-scan" aria-hidden="true" />

        <div className="archive-head mono-sm">
          <span>{content.eyebrow}</span>
          {/* Written by the rewind engine as the years wind back. */}
          <span data-era>{content.marks[0]?.era ?? ""}</span>
        </div>

        <div className="archive-rail-wrap">
          <div className="archive-rail">
            {content.frames.map((frame, i) => (
              <figure className="archive-frame" key={i}>
                <div className="shot hatch">
                  <MediaFrame src={frame.image} alt="" sizes="50vw" />
                  {i === 0 ? <span className="rec mono-xs">● REC</span> : null}
                </div>
                <figcaption className="mono-xs">
                  <span>{frame.caption}</span>
                  {frame.tag ? <span>{frame.tag}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="archive-year" aria-hidden="true">
          <span data-year>{content.marks[0]?.year ?? ""}</span>
        </div>

        <div className="archive-foot">
          <div className="archive-scrub" />
          <div className="archive-caption mono-xs">
            <span data-caption>{content.captions[0] ?? ""}</span>
            <span>{content.footer}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 04 · SCRIPTURE ────────────────────────────────────────────────────── */
export function Scripture({ content }: { content: Content["scripture"] }) {
  const verses = content.verses;
  const books = [...verses.map((v) => v.book), content.origin].filter(Boolean);

  return (
    <section
      id="scripture"
      className="scene scripture"
      data-track="pin"
      /* One number drives all of it. `--n` is how many slots the read-head
         crosses, so adding a verse in the Customizer re-times the whole
         descent without a line of JavaScript. */
      style={{ "--n": verses.length } as React.CSSProperties}
    >
      <div className="pin">
        <div className="scripture-scan" aria-hidden="true" />

        <div className="book-rail" aria-hidden="true">
          {books.map((book, i) => (
            <span key={book + i} style={{ display: "contents" }}>
              <span className="book" style={{ "--i": i } as React.CSSProperties}>
                {book}
              </span>
              {i < books.length - 1 ? <span className="sep">◀</span> : null}
            </span>
          ))}
        </div>

        <div className="verses">
          {verses.map((verse, i) => (
            <blockquote className="verse" key={i} style={{ "--i": i } as React.CSSProperties}>
              <span className="quote">{verse.quote}</span>
              <cite className="ref">{verse.reference}</cite>
            </blockquote>
          ))}
        </div>

        {content.footer ? <div className="scene-foot">{content.footer}</div> : null}
      </div>
    </section>
  );
}

/* ── 05 · STILLNESS ────────────────────────────────────────────────────── */
export function Stillness({ content }: { content: Content["stillness"] }) {
  return (
    <section className="scene stillness" data-track="pin">
      <div className="pin">
        <div className="horizon" aria-hidden="true" />
        <div className="stillness-body">
          <blockquote>
            {content.quote}
            {content.quoteItalic ? (
              <>
                {"\n"}
                <em>{content.quoteItalic}</em>
              </>
            ) : null}
          </blockquote>
          {content.reference ? <div className="ref">{content.reference}</div> : null}
        </div>
      </div>
    </section>
  );
}

/* ── 06 · THE STANDARD ─────────────────────────────────────────────────── */
export function Standard({
  content,
  facts,
  ctaHref,
}: {
  content: Content["standard"];
  /** Name, dates, venue — three lines, all from the event. */
  facts: string[];
  ctaHref: string | null;
}) {
  return (
    <section id="standard" className="standard">
      <div className="standard-eyebrow">{content.eyebrow}</div>
      <h2 data-reveal>
        {content.headingA}
        <br />
        {content.headingB}
      </h2>
      <div className="standard-foot">
        <p>{content.strapline}</p>
        <div className="standard-facts">
          {facts.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        {ctaHref ? (
          <a href={ctaHref} className="btn">
            {content.ctaLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}

/* ── 06b · TEASER FILM ─────────────────────────────────────────────────── */
export function Film({ content, wordmark }: { content: Content["film"]; wordmark: string }) {
  const body = (
    <>
      <span className="film-play" aria-hidden="true">
        ▶
      </span>
      <span className="film-title">{content.label}</span>
      {content.note ? <span className="film-note">{content.note}</span> : null}
    </>
  );

  return (
    <section id="film" className="film">
      <div className="film-frame hatch">
        <div className="plate">
          <MediaFrame src={content.image} alt="" sizes="100vw" />
        </div>
        {content.videoUrl ? (
          <a className="film-body" href={content.videoUrl} target="_blank" rel="noreferrer noopener">
            {body}
          </a>
        ) : (
          <div className="film-body">{body}</div>
        )}
        {content.timecode ? (
          <span className="film-tc mono-xs" aria-hidden="true">
            {content.timecode}
          </span>
        ) : null}
        <span className="film-mark mono-xs" aria-hidden="true">
          {wordmark}
        </span>
      </div>
    </section>
  );
}

/* ── 06c · CONTACT SHEET ───────────────────────────────────────────────── */
export function ContactSheet({ content }: { content: Content["contactSheet"] }) {
  return (
    <section className="sheet">
      <div className="sheet-head">
        <h3 className="head-condensed">{content.heading}</h3>
        {content.note ? <span className="mono-sm" style={{ opacity: 0.5 }}>{content.note}</span> : null}
      </div>

      <div className="sheet-grid">
        {content.frames.map((frame, i) => (
          <figure key={i}>
            <div className="shot hatch">
              <MediaFrame src={frame.image} alt="" sizes="(max-width: 760px) 50vw, 16vw" />
            </div>
            {frame.caption ? <figcaption className="mono-xs">{frame.caption}</figcaption> : null}
          </figure>
        ))}
      </div>

      <div className="sheet-wide hatch">
        <MediaFrame src={content.wideImage} alt="" sizes="100vw" />
        {content.wideCaption ? (
          <span className="mono-sm">[ {content.wideCaption} ]</span>
        ) : null}
      </div>
    </section>
  );
}

/* ── 07 · THE FOUR FACTS ───────────────────────────────────────────────── */
export function Facts({
  facts,
}: {
  facts: Array<{ label: string; value: string; note: string }>;
}) {
  return (
    <section className="facts">
      {facts.map((fact) => (
        <div className="fact" key={fact.label} data-reveal>
          <div className="fact-label">{fact.label}</div>
          <div className="fact-value">{fact.value}</div>
          {fact.note ? <p className="mono-md">{fact.note}</p> : null}
        </div>
      ))}
    </section>
  );
}

/* ── 08 · SPEAKERS ─────────────────────────────────────────────────────── */
export function Speakers({
  content,
  speakers,
}: {
  content: Content["speakers"];
  speakers: Speaker[];
}) {
  return (
    <section id="speakers" className="speakers">
      <div className="speakers-head">
        <h3 className="head-condensed">{content.heading}</h3>
        {/* Only when there is nobody yet: a lineup that IS announced should
            not carry a note saying it is not. */}
        {speakers.length === 0 && content.note ? (
          <span className="speakers-note">{content.note}</span>
        ) : null}
      </div>

      {speakers.length > 0 ? (
        <div className="speakers-grid">
          {speakers.map((person) => (
            <figure className="speaker" key={person.id} data-reveal>
              <div className="shot hatch">
                <MediaFrame
                  src={person.image}
                  alt={person.name}
                  sizes="(max-width: 760px) 50vw, 20vw"
                />
              </div>
              <figcaption>
                <span className="name">{person.name}</span>
                {person.role ? (
                  <>
                    <br />
                    <span className="role">{person.role}</span>
                  </>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ── 09 · EXPERIENCE ───────────────────────────────────────────────────── */
export function Experience({ content }: { content: Content["experience"] }) {
  return (
    <section className="experience">
      <h3>{content.heading}</h3>
      <div className="experience-rows">
        {content.items.map((item, i) => (
          <div className="experience-row" key={i} data-reveal>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <span className="t">{item.title}</span>
            <span className="d mono-md">{item.body}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 10 · VENUE + FAQ ──────────────────────────────────────────────────── */
export function VenueFaq({
  venueContent,
  faqContent,
  venue,
}: {
  venueContent: Content["venue"];
  faqContent: Content["faq"];
  venue: EventVenue | null;
}) {
  const showVenue = venueContent.enabled !== false && (Boolean(venue) || Boolean(venueContent.image));
  const questions = faqContent.enabled !== false ? faqContent.items : [];
  if (!showVenue && questions.length === 0) return null;

  return (
    <section id="venue" className="venue-faq">
      {showVenue ? (
        <div>
          <div className="col-label">{venueContent.label}</div>
          <div className="venue-shot hatch">
            <MediaFrame src={venueContent.image} alt="" sizes="(max-width: 760px) 100vw, 45vw" />
          </div>
          <p className="venue-body mono-md">
            {/* The address is the event's. Only the sentence after it is typed
                in the Customizer — a church should never type their venue
                twice. */}
            {venue?.name ? <strong>{venue.name}</strong> : null}
            {venue?.address ? ` — ${venue.address}. ` : venue?.name ? ". " : ""}
            {venueContent.note}
            {venue?.directionsUrl ? (
              <>
                {" "}
                <a href={venue.directionsUrl} target="_blank" rel="noreferrer noopener">
                  Directions
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {questions.length > 0 ? (
        <div>
          <div className="col-label">{faqContent.label}</div>
          {questions.map((item, i) => (
            <details className="faq-item" key={i}>
              <summary>{item.question}</summary>
              <p className="mono-md">{item.answer}</p>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* ── 11 · REGISTER ─────────────────────────────────────────────────────── */
export function Register({
  content,
  dateLabel,
  ctaLabel,
  ctaHref,
}: {
  content: Content["register"];
  dateLabel: string;
  ctaLabel: string;
  ctaHref: string | null;
}) {
  return (
    <section id="register" className="register">
      <div className="register-eyebrow">
        {dateLabel}
        {content.eyebrow ? ` · ${content.eyebrow}` : ""}
      </div>
      <h3>
        {content.headingA}
        <br />
        {content.headingB}
      </h3>
      {ctaHref ? (
        <a href={ctaHref} className="btn btn-invert">
          {ctaLabel} →
        </a>
      ) : null}
    </section>
  );
}

/* ── FOOTER ────────────────────────────────────────────────────────────── */
export function Footer({
  content,
  church,
  logo,
  socials,
}: {
  content: Content["footer"];
  church: string;
  logo: string | null;
  socials: SocialLink[];
}) {
  const legal = content.legal.filter((l) => l.label && l.href);
  return (
    <footer className="footer">
      <div className="footer-mark">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={content.organisation || church} />
        ) : (
          <span className="name">{(content.organisation || church).toUpperCase()}</span>
        )}
        {content.tagline ? <span>{content.tagline}</span> : null}
      </div>

      <div className="footer-right">
        {socials.length > 0 ? (
          <div className="footer-socials">
            {socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer noopener">
                {s.label.toUpperCase()}
              </a>
            ))}
          </div>
        ) : null}
        {legal.length > 0 ? (
          <div className="footer-links">
            {legal.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label.toUpperCase()}
              </a>
            ))}
          </div>
        ) : null}
        <span>© {new Date().getFullYear()} {content.organisation || church}</span>
      </div>
    </footer>
  );
}
