import type {
  AccordionProps,
  CtaProps,
  GivingMethodsProps,
  LocationProps,
  MarqueeProps,
  FeaturesProps,
  LinksProps,
  ProfileCardsProps,
  ScheduleProps,
  SectionComponentProps,
  SectionRegistry,
  StatementProps,
  VideoProps,
} from "@ministree/template-sdk";
import { flameSections } from "@/sections";
import Marquee from "@/components/Marquee";
import EventVision from "@/components/event/sections/EventVision";
import EventLineup, { type LineupPerson } from "@/components/event/sections/EventLineup";
import EventTimeline, { type TimelineEntry } from "@/components/event/sections/EventTimeline";
import EventVenue from "@/components/event/sections/EventVenue";
import EventFaq, { type FaqEntry } from "@/components/event/sections/EventFaq";
import EventGive, { type GiveCard } from "@/components/event/sections/EventGive";
import EventTickets, { type TicketTier } from "@/components/event/sections/EventTickets";
import EventTrailer from "@/components/event/sections/EventTrailer";
import EventStripping from "@/components/event/sections/EventStripping";
import EventShare from "@/components/event/sections/EventShare";

/**
 * The event page's own treatment of ordinary section types.
 *
 * Single-event mode used to render a fixed running order, so a church could not
 * move a block, drop one, or add anything of their own. Making those beats real
 * sections buys drag-and-drop, interleaving and the whole generic library from
 * machinery that already exists — but only if the altar's look survives, and it
 * would not if `statement` rendered as the church site's pull-quote.
 *
 * So the mode is expressed as a REGISTRY, not a flag. `{ ...flameSections }`
 * plus seven overrides: the other twenty-one types keep the church treatment,
 * which is the right default for a section someone deliberately added. A
 * `context.eventMode` branch inside each renderer would have meant editing
 * seven files and keeping a second source of truth for a fact the registry
 * choice already states.
 *
 * ── The rule that makes this work ──
 * A section's props normally carry its content — `statement.props.statement` is
 * required, `schedule.props.items` IS the agenda. But in single-event mode the
 * content lives in the event record, and not duplicating it is the entire point
 * of the mode. So: **empty props inherit from the event.** Leave a schedule's
 * items alone and it renders the event's run of show; fill them and you have
 * deliberately overridden it. One `??` per beat, no new section type, and a
 * church never retypes their own lineup.
 */
/**
 * The id this section answers to.
 *
 * A church can set an anchor on any section, and the menu is built from those.
 * These components each hardcoded their own id ("vision", "night"), so a church
 * that named one got a menu link pointing at an element that did not exist.
 * Their anchor wins; the built-in stays as the default so existing links hold.
 */
function anchorOf(section: { anchorId?: string }, fallback: string): string {
  const a = section.anchorId?.trim();
  return a ? a.replace(/^#/, '') : fallback;
}

export interface EventSectionContext {
  vision: { body: string; label: string; footnote: string | null } | null;
  lineup: { people: LineupPerson[]; label: string; heading: string };
  timeline: { entries: TimelineEntry[]; label: string; heading: string; note: string | null };
  venue: {
    label: string;
    name: string;
    blurb: string | null;
    address: string | null;
    directionsUrl: string | null;
    images: string[];
  } | null;
  give: { cards: GiveCard[]; label: string; heading: string; strapline: string | null };
  tickets: {
    tiers: TicketTier[];
    label: string;
    heading: string;
    href: string;
    ctaLabel: string;
    blurb: string | null;
    note: string | null;
    perks: string[];
    phone: string | null;
  } | null;
  faq: { entries: FaqEntry[]; label: string; heading: string };
  share: {
    flyerUrl: string | null;
    filename: string;
    title: string;
    text: string | null;
    socials: Array<{ label: string; href: string }>;
  };
  marquee: string[];
  keyart: string | null;
  /** Where "Give now" points when a giving method doesn't name its own link. */
  givingHref: string;
}

/** The event-derived fallbacks, as put on the context by `EventSite`. */
function evt(context: SectionComponentProps["context"]): EventSectionContext {
  return (context.evt ?? {}) as EventSectionContext;
}

const text = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

function EventVisionSection({ section, props, context }: SectionComponentProps) {
  const p = props as StatementProps;
  const base = evt(context).vision;
  const body = text(p.statement) ?? base?.body;
  if (!body) return null;
  return (
    <EventVision
      anchor={anchorOf(section, "vision")}
      body={body}
      label={text(section.title) ?? text(p.eyebrow) ?? base?.label ?? "The vision"}
      footnote={text(p.attribution) ?? base?.footnote ?? null}
      backdrop={evt(context).keyart ?? null}
    />
  );
}

function EventLineupSection({ section, props, context }: SectionComponentProps) {
  const p = props as ProfileCardsProps;
  const base = evt(context).lineup;
  // `source: 'people'` means "pull from the church directory" — in event mode
  // the event's own billing is the better answer, so only hand-entered cards
  // override it.
  const cards = p.source === "static" ? p.cards : undefined;
  const people: LineupPerson[] = cards?.length
    ? cards.map((c, i) => ({
        id: `card-${i}`,
        // Hand-entered cards get a slug too, so they are as linkable as the
        // event's own billing. Index-suffixed: two cards may share a name.
        slug: `${(c.name ?? "speaker").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "speaker"}-${i + 1}`,
        name: c.name,
        role: c.subtitle ?? null,
        image: c.imageUrl ?? null,
        bio: c.description ?? null,
      }))
    : (base?.people ?? []);
  return (
    <EventLineup
      anchor={anchorOf(section, "lineup")}
      people={people}
      label={text(p.eyebrow) ?? base?.label ?? "The lineup"}
      heading={text(section.title) ?? base?.heading ?? "Who you'll hear"}
      // Read off the venue beat rather than added to the lineup context — it is
      // one line on a card, not a thing a church would ever set separately.
      venueLabel={evt(context).venue?.name ?? null}
    />
  );
}

/* The trailer. Rides `video` because that section's editor is a real video
   picker — a Customizer field would be a box to paste a URL into, which is a
   worse control for the same value. The cost is small: an event page loses the
   generic bordered 16:9 frame, and keeps the feature. */
function EventTrailerSection({ section, props }: SectionComponentProps) {
  const p = props as VideoProps;
  if (!p.url) return null;
  return (
    <EventTrailer
      anchor={anchorOf(section, "trailer")}
      url={p.url}
      poster={p.posterUrl ?? null}
      label={text(section.subtitle) ?? "The trailer"}
      heading={text(section.title)}
      title={text(section.title) ?? "Trailer"}
    />
  );
}

/* The manifesto. Rides `features` — its `items[].title` are the words to strike
   out, `props.heading` is the one left standing, and the section's subtitle is
   the line under it. The cost: an event page can't have a plain three-column
   feature grid. It is the most redundant generic on this page, since the lineup
   and the run of show are both already numbered lists of their own. */
function EventStrippingSection({ section, props }: SectionComponentProps) {
  const p = props as FeaturesProps;
  const noise = (p.items ?? []).map((i) => i.title).filter(Boolean);
  if (noise.length === 0) return null;
  return (
    <EventStripping
      anchor={anchorOf(section, "stripping")}
      noise={noise}
      kept={text(p.heading) ?? text(section.title)}
      coda={text(section.subtitle)}
      label={text(section.title) ?? "The stripping"}
    />
  );
}

/* Sharing. Rides `links` — its items are the social pills, falling back to the
   church's own profile when a church leaves them empty. This is the priciest of
   the three overrides: an event page can't have a plain link grid. If that trade
   stops being worth it, delete this override and the Share button in the footer
   still covers the actual feature. */
function EventShareSection({ section, props, context }: SectionComponentProps) {
  const base = evt(context).share;
  const p = props as LinksProps;
  const items = (p.items ?? [])
    .map((i) => ({ label: i.label, href: i.href ?? i.url ?? "" }))
    .filter((i) => i.label && i.href);
  return (
    <EventShare
      anchor={anchorOf(section, "share")}
      flyerUrl={base?.flyerUrl ?? null}
      filename={base?.filename ?? "flyer.jpg"}
      title={base?.title ?? "Share"}
      text={base?.text ?? null}
      socials={items.length ? items : (base?.socials ?? [])}
      label={text(section.subtitle) ?? "Share it"}
      heading={text(section.title) ?? text(p.heading) ?? "Tell someone"}
      blurb={text(p.description)}
    />
  );
}

function EventTimelineSection({ section, props, context }: SectionComponentProps) {
  const p = props as ScheduleProps;
  const base = evt(context).timeline;
  const entries: TimelineEntry[] = p.items?.length
    ? p.items.map((i, idx) => ({ id: `item-${idx}`, time: i.time, label: i.label }))
    : (base?.entries ?? []);
  return (
    <EventTimeline
      anchor={anchorOf(section, "night")}
      entries={entries}
      label={text(p.eyebrow) ?? base?.label ?? "The night"}
      heading={text(section.title) ?? text(p.heading) ?? base?.heading ?? "How the evening unfolds"}
      note={text(p.note) ?? base?.note ?? null}
    />
  );
}

function EventVenueSection({ section, props, context }: SectionComponentProps) {
  const p = props as LocationProps;
  const base = evt(context).venue;
  const name = text(p.location?.venue) ?? base?.name;
  if (!name) return null;
  // A hand-set map image leads; otherwise the event's own photographs do.
  const images = text(p.mapImageUrl) ? [p.mapImageUrl as string] : (base?.images ?? []);
  return (
    <EventVenue
      anchor={anchorOf(section, "venue")}
      label={text(section.title) ?? text(p.heading) ?? base?.label ?? "The venue"}
      name={name}
      blurb={text(p.serviceTimes) ?? base?.blurb ?? null}
      address={text(p.location?.address) ?? base?.address ?? null}
      directionsUrl={base?.directionsUrl ?? null}
      images={images}
    />
  );
}

function EventFaqSection({ section, props, context }: SectionComponentProps) {
  const p = props as AccordionProps;
  const base = evt(context).faq;
  const entries: FaqEntry[] = p.items?.length
    ? p.items
        // A rich-text answer has no place in this treatment's plain paragraph,
        // and rendering "[object Object]" would be worse than dropping it.
        .filter((i) => typeof i.content === "string")
        .map((i) => ({ q: i.title, a: i.content as string }))
    : (base?.entries ?? []);
  return (
    <EventFaq
      anchor={anchorOf(section, "faq")}
      entries={entries}
      label={text(p.eyebrow) ?? base?.label ?? "Know before you go"}
      heading={text(section.title) ?? base?.heading ?? "Good to know"}
    />
  );
}

function EventGiveSection({ section, props, context }: SectionComponentProps) {
  const p = props as GivingMethodsProps;
  const base = evt(context).give;
  const cards: GiveCard[] = p.methods?.length
    ? p.methods.map((m, i) => ({
        key: m.kind ?? `method-${i}`,
        title: m.title,
        body: m.description ?? null,
        rows: m.rows?.map((r) => ({ label: r.label, value: r.value })),
        // A seeded "Online" method can't know the church's giving address, so
        // fall back to it rather than rendering a button that goes nowhere.
        href: m.ctaUrl ?? (m.kind === "online" ? evt(context).givingHref : null) ?? null,
        cta: m.ctaLabel ?? null,
      }))
    : (base?.cards ?? []);
  return (
    <EventGive
      anchor={anchorOf(section, "give")}
      cards={cards}
      label={text(p.eyebrow) ?? base?.label ?? "Giving"}
      heading={text(section.title) ?? text(p.heading) ?? base?.heading ?? "Ways to give"}
      strapline={text(p.description) ?? base?.strapline ?? null}
    />
  );
}

/**
 * Tickets ride on `cta`.
 *
 * There is no ticket section type in Ministree, and leaving tickets as a fixed
 * block below the stack would have moved it after the FAQ — a visible change to
 * every live event site on the day this shipped. `cta` is the closest honest
 * fit (a call to action with a heading and a button), so in event mode it
 * renders the ticket tiers, which come from the event's own record because
 * there is no prop shape that could carry a price list.
 *
 * The cost, stated plainly: a church in event mode cannot have a plain generic
 * CTA. Nothing else in the library was closer.
 */
function EventTicketsSection({ section, props, context }: SectionComponentProps) {
  const p = props as CtaProps;
  const base = evt(context).tickets;
  if (!base || base.tiers.length === 0) return null;
  return (
    <EventTickets
      anchor={anchorOf(section, "tickets")}
      tiers={base.tiers}
      label={text(p.eyebrow) ?? base.label}
      heading={text(section.title) ?? text(p.heading) ?? base.heading}
      href={base.href}
      ctaLabel={base.ctaLabel}
      blurb={text(p.description) ?? base.blurb}
      note={base.note}
      perks={base.perks}
      phone={base.phone}
      /* `ctas` is already on this section type and the renderer ignored it.
         The event's own link stays the primary; anything a church adds here is
         a second place to buy. Free — no new field, no new type. */
      outlets={(p.ctas ?? [])
        .map((c) => ({ label: c.label, href: c.href ?? c.url ?? "" }))
        .filter((c) => c.label && c.href)}
    />
  );
}

function EventMarqueeSection({ props, context }: SectionComponentProps) {
  const p = props as MarqueeProps;
  const items = p.items?.length
    ? p.items.map((i) => i.text).filter(Boolean)
    : (evt(context).marquee ?? []);
  if (items.length === 0) return null;
  return <Marquee items={items} speed={p.speed === "slow" ? "slow" : "normal"} />;
}

export const flameEventSections: SectionRegistry = {
  ...flameSections,
  statement: EventVisionSection,
  profileCards: EventLineupSection,
  schedule: EventTimelineSection,
  location: EventVenueSection,
  accordion: EventFaqSection,
  cta: EventTicketsSection,
  givingMethods: EventGiveSection,
  marquee: EventMarqueeSection,
  video: EventTrailerSection,
  features: EventStrippingSection,
  links: EventShareSection,
};
