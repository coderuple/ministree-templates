import { ScrollEngine } from "@ministree-templates/event-kit/scroll-engine";
import type { Speaker } from "@ministree-templates/event-kit/event";
import { Nav } from "@/components/nav";
import { RewindEngine } from "@/components/rewind";
import {
  Archive,
  ContactSheet,
  Experience,
  Facts,
  Film,
  Footer,
  Interrupt,
  Noise,
  Register,
  Scripture,
  Speakers,
  Standard,
  Stillness,
  VenueFaq,
} from "@/components/sections";
import { demoVenue, facts, indexLinks, loadPageData } from "@/lib/page-data";

/* Five minutes. The conference itself barely changes; the ticket counts that
   do change are read live in the checkout, not baked into this page. */
export const revalidate = 300;

export default async function Home() {
  const { content, event, church, eventTitle, dateLabel, socials, ticketing, navLogo } =
    await loadPageData();

  const c = content;
  const ticketsHref = ticketing.href;

  /* The event's own people, or the demo lineup while nobody is connected. A
     church that connects an event with no speakers on it yet gets the "to be
     announced" note alone, which is the honest answer rather than six
     invented names. */
  const speakers: Speaker[] = event
    ? event.speakers
    : c.speakers.demo.map((s, i) => ({
        id: String(i),
        slug: String(i),
        name: s.name,
        role: s.role,
        image: s.image || null,
        bio: s.bio || null,
      }));

  /* The cheapest tier that can actually be bought, for the fourth fact. */
  const fromPrice = (event?.tickets ?? [])
    .filter((t) => t.onSale && !t.soldOut && t.price)
    .sort((a, b) => (a.priceMinor ?? 0) - (b.priceMinor ?? 0))[0];

  const standardVenue = event ? event.venue : demoVenue(c);
  const venueLine = standardVenue?.name || standardVenue?.city || "";

  return (
    <ScrollEngine reveals={c.effects.scrollReveals !== false}>
      {c.effects.grain !== false ? <div className="grain" aria-hidden="true" /> : null}
      {c.effects.vignette !== false ? <div className="vignette" aria-hidden="true" /> : null}
      <div className="progress" aria-hidden="true" />

      <Nav
        links={indexLinks(c, event)}
        wordmark={c.hero.wordmark || eventTitle}
        suffix={c.hero.wordmarkSuffix}
        logo={navLogo}
        menuLabel={c.nav.menuLabel}
        ticketsHref={ticketsHref}
        ticketsLabel={c.tickets.ctaLabel}
        socials={socials}
        sticky={c.nav.stickyHeader !== false}
        showTimecode={c.effects.timecode !== false}
      />

      <RewindEngine marks={c.archive.marks} captions={c.archive.captions} />

      <Noise
        content={c.hero}
        eyebrow={eventTitle.toUpperCase()}
        image={c.hero.image || event?.heroImage || null}
      />

      {c.tension.enabled !== false ? <Interrupt content={c.tension} /> : null}
      {c.archive.enabled !== false && c.archive.marks.length > 0 ? (
        <Archive content={c.archive} />
      ) : null}
      {c.scripture.enabled !== false && c.scripture.verses.length > 0 ? (
        <Scripture content={c.scripture} />
      ) : null}
      {c.stillness.enabled !== false ? <Stillness content={c.stillness} /> : null}

      <Standard
        content={c.standard}
        facts={[eventTitle.toUpperCase(), dateLabel.toUpperCase(), venueLine.toUpperCase()].filter(
          Boolean,
        )}
        ctaHref={ticketsHref}
      />

      {c.film.enabled !== false ? <Film content={c.film} wordmark={c.hero.wordmark || church} /> : null}
      {c.contactSheet.enabled !== false ? <ContactSheet content={c.contactSheet} /> : null}
      {c.facts.enabled !== false ? (
        <Facts facts={facts(c, event, dateLabel, fromPrice?.price ?? null)} />
      ) : null}
      {c.speakers.enabled !== false ? <Speakers content={c.speakers} speakers={speakers} /> : null}
      {c.experience.enabled !== false && c.experience.items.length > 0 ? (
        <Experience content={c.experience} />
      ) : null}

      <VenueFaq venueContent={c.venue} faqContent={c.faq} venue={event ? event.venue : demoVenue(c)} />

      <Register
        content={c.register}
        dateLabel={dateLabel.toUpperCase()}
        ctaLabel={c.tickets.ctaLabel}
        ctaHref={ticketsHref}
      />

      <Footer content={c.footer} church={church} logo={navLogo} socials={socials} />

      {/* A way in that stays on screen the whole way down. The stylesheet
          fades it in once the reader is past the opening — before that it has
          nothing to offer, and it sat on top of the scroll cue. */}
      {c.nav.showTicketBar !== false && ticketsHref ? (
        <div className="ticket-bar">
          <a href={ticketsHref}>{c.tickets.stickyLabel}</a>
        </div>
      ) : null}
    </ScrollEngine>
  );
}
