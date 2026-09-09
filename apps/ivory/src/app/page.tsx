import { ScrollEngine } from "@ministree-templates/event-kit/scroll-engine";
import type { EventDay, Speaker } from "@ministree-templates/event-kit/event";
import { loadPageData, navLinks } from "@/lib/page-data";
import { IssueBar, Nav } from "@/components/nav";
import {
  Days,
  Experience,
  Faq,
  FinalCta,
  Footer,
  Hero,
  Manifesto,
  Marquee,
  Scripture,
  Speakers,
  Stages,
  Stories,
  Venue,
  lines,
} from "@/components/sections";

export const revalidate = 300;

export default async function Home() {
  const { content, event, church, eventTitle, dateLabel, socials, ticketing, email, logoDark, navLogo } =
    await loadPageData();

  const c = content;
  const ticketsHref = ticketing.href;

  const speakers: Speaker[] = event
    ? event.speakers
    : c.speakers.demo.map((s, i) => ({
        id: String(i),
        slug: String(i),
        name: s.name,
        role: s.role,
        image: s.image ?? null,
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
    <ScrollEngine reveals={c.effects.scrollReveals !== false}>
      {/* The nav is ink, so it takes the light logo in both places. */}
      <Nav
        links={navLinks(c, event)}
        ticketsHref={ticketsHref}
        ticketsLabel={c.tickets.ctaLabel}
        logo={navLogo}
        wordmark={eventTitle}
        socials={socials}
        sticky={c.nav.stickyHeader !== false}
      />
      <IssueBar items={[c.issue.label, c.issue.number, dateLabel].filter(Boolean)} />

      <Hero
        eyebrow={eventTitle}
        headline={c.hero.headline}
        accentMark={c.hero.accentMark}
        subhead={c.hero.subhead}
        dateLabel={dateLabel}
        intro={c.hero.intro}
        ctaLabel={c.hero.ctaLabel}
        ctaHref={ticketsHref}
        secondaryLabel={c.hero.secondaryLabel}
        secondaryHref={c.hero.secondaryHref}
        scriptureRef={c.hero.pullQuoteRef}
        image={c.hero.image || event?.heroImage}
      />

      {c.marquee.enabled !== false ? <Marquee phrases={lines(c.marquee.phrases)} /> : null}

      {c.manifesto.enabled !== false ? (
        <Manifesto
          marker={c.manifesto.marker}
          eyebrow={c.manifesto.eyebrow}
          headingA={c.manifesto.headingA}
          headingB={c.manifesto.headingB}
          lede={c.manifesto.lede}
          body={c.manifesto.body || event?.description || ""}
          pullLine={c.manifesto.pullLine}
          image={c.manifesto.image}
          insetImage={c.manifesto.insetImage}
        />
      ) : null}

      {c.stages.enabled !== false ? (
        <Stages
          stages={stages}
          images={[...(c.stages.images ?? [])]}
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
          marker={c.speakers.marker}
          eyebrow={c.speakers.eyebrow}
          headingA={c.speakers.headingA}
          headingB={c.speakers.headingB}
          speakers={speakers}
          note={c.speakers.note}
        />
      ) : null}

      {c.days.enabled !== false ? (
        <Days
          marker={c.days.marker}
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
          marker={c.experience.marker}
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
        lineOne={c.finalCta.lineOne}
        lineTwo={c.finalCta.lineTwo}
        lineThree={c.finalCta.lineThree}
        ctaLabel={c.finalCta.ctaLabel}
        ctaHref={ticketsHref}
        dateLabel={dateLabel}
        watermark={c.finalCta.watermark}
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
