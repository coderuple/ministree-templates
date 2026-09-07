import { ScrollEngine } from "@ministree-templates/event-kit/scroll-engine";
import type { EventDay, Speaker } from "@ministree-templates/event-kit/event";
import { loadPageData, navLinks } from "@/lib/page-data";
import { Nav } from "@/components/nav";
import {
  Days,
  Experience,
  Faq,
  FinalCta,
  Footer,
  Hero,
  Manifesto,
  Scripture,
  Speakers,
  Stages,
  Stories,
  Venue,
  lines,
} from "@/components/sections";

/* Five minutes. The conference itself barely changes; the ticket counts that
   do change are read live in the checkout, not baked into this page. */
export const revalidate = 300;

export default async function Home() {
  const { content, event, church, eventTitle, dateLabel, socials, ticketing, email, logoLight, logoDark } =
    await loadPageData();

  const c = content;
  const ticketsHref = ticketing.href;
  const embers = c.effects.embers !== false;

  /* The event's own people, or the demo lineup while nobody is connected. A
     church that connects an event with no speakers on it yet gets the "still
     to come" card alone, which is the honest answer rather than three
     invented names. */
  const speakers: Speaker[] = event
    ? event.speakers
    : c.speakers.demo.map((s, i) => ({
        id: String(i),
        slug: String(i),
        name: s.name,
        role: s.role,
        image: null,
        bio: s.bio,
      }));

  const days: EventDay[] = event
    ? event.days
    : c.days.demoDates.map((d, i) => ({
        id: String(i),
        numeral: d.numeral,
        weekday: d.weekday,
        time: d.time,
        startAt: null,
        cancelled: false,
      }));

  const stages = [c.stages.one, c.stages.two, c.stages.three];

  return (
    <ScrollEngine>
      <Nav
        links={navLinks(c, event)}
        ticketsHref={ticketsHref}
        ticketsLabel={c.tickets.ctaLabel}
        logo={logoLight}
        wordmark={eventTitle}
        socials={socials}
        sticky={c.nav.stickyHeader !== false}
      />

      <Hero
        eyebrow={eventTitle}
        headline={c.hero.headline}
        accentMark={c.hero.accentMark}
        subhead={c.hero.subhead}
        dateLabel={dateLabel}
        ctaLabel={c.hero.ctaLabel}
        ctaHref={ticketsHref}
        secondaryLabel={c.hero.secondaryLabel}
        secondaryHref={c.hero.secondaryHref}
        pullQuote={c.hero.pullQuote}
        pullQuoteRef={c.hero.pullQuoteRef}
        image={c.hero.image || event?.heroImage}
        embers={embers}
      />

      {c.manifesto.enabled !== false ? (
        <Manifesto
          eyebrow={c.manifesto.eyebrow}
          headingA={c.manifesto.headingA}
          headingB={c.manifesto.headingB}
          lede={c.manifesto.lede}
          /* Empty inherits from the event's own description — a church should
             not have to type their conference blurb twice. */
          body={c.manifesto.body || event?.description || ""}
          closingA={c.manifesto.closingA}
          closingB={c.manifesto.closingB}
          image={c.manifesto.image}
          insetImage={c.manifesto.insetImage}
        />
      ) : null}

      {c.stages.enabled !== false ? (
        <Stages
          stages={stages}
          image={c.stages.image}
          embers={embers}
        />
      ) : null}

      {c.scripture.enabled !== false ? (
        <Scripture
          quote={c.scripture.quote}
          emphasis={c.scripture.emphasis}
          reference={c.scripture.reference}
        />
      ) : null}

      {c.speakers.enabled !== false ? (
        <Speakers
          eyebrow={c.speakers.eyebrow}
          headingA={c.speakers.headingA}
          headingB={c.speakers.headingB}
          speakers={speakers}
          placeholder={c.speakers.placeholder}
        />
      ) : null}

      {c.days.enabled !== false ? (
        <Days
          eyebrow={c.days.eyebrow}
          headingA={c.days.headingA}
          headingEm={c.days.headingEm}
          headingB={c.days.headingB}
          days={days}
          beats={[...c.days.beats]}
        />
      ) : null}

      {c.venue.enabled !== false ? (
        <Venue
          eyebrow={c.venue.eyebrow}
          heading={c.venue.heading}
          blurb={c.venue.blurb}
          venue={event?.venue ?? null}
          images={[...(c.venue.images ?? [])]}
        />
      ) : null}

      {c.experience.enabled !== false ? (
        <Experience
          eyebrow={c.experience.eyebrow}
          headingA={c.experience.headingA}
          headingEm={c.experience.headingEm}
          headingB={c.experience.headingB}
          chips={lines(c.experience.chips)}
          images={[...(c.experience.images ?? [])]}
          slots={c.experience.slots}
        />
      ) : null}

      {c.stories.enabled !== false ? (
        <Stories
          headingA={c.stories.headingA}
          headingB={c.stories.headingB}
          body={c.stories.body}
          images={[...(c.stories.images ?? [])]}
          slots={c.stories.slots}
        />
      ) : null}

      <FinalCta
        eyebrow={c.finalCta.eyebrow}
        headingA={c.finalCta.headingA}
        headingB={c.finalCta.headingB}
        body={c.finalCta.body}
        ctaLabel={c.finalCta.ctaLabel}
        ctaHref={ticketsHref}
        dateLabel={dateLabel}
        embers={embers}
      />

      {c.faq.enabled !== false ? (
        <Faq eyebrow={c.faq.eyebrow} heading={c.faq.heading} items={[...(c.faq.items ?? [])]} />
      ) : null}

      <Footer
        logo={logoDark}
        organisation={c.footer.organisation || church}
        description={c.footer.description}
        navLinks={navLinks(c, event)}
        socials={socials}
        email={email}
        legal={[...c.footer.legal]}
        year={new Date().getFullYear()}
      />

      {c.nav.showTicketBar !== false && ticketsHref ? (
        <div className="ticket-bar">
          <a href={ticketsHref}>
            {c.tickets.stickyLabel} · {dateLabel}
          </a>
        </div>
      ) : null}
    </ScrollEngine>
  );
}
