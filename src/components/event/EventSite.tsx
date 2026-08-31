import {
  getChurchProfile,
  hrefFor,
  type EventDetail,
} from "@ministree/template-sdk";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { Sections, type PageSection } from "@ministree/template-sdk";
import { defaults } from "@/lib/ministree";
import { flameEventSections, type EventSectionContext } from "@/sections/event";
import { loadContent, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { formatDateRange, type Locale } from "@/lib/format";
import EventExperience, { type EventExperienceProps } from "@/components/event/EventExperience";
import type { LineupPerson } from "@/components/event/sections/EventLineup";
import type { TimelineEntry } from "@/components/event/sections/EventTimeline";
import type { TicketTier } from "@/components/event/sections/EventTickets";

/**
 * The whole site, for one event.
 *
 * This file does the *mapping* and nothing else — it reads the event's record,
 * the church's profile and the Customizer's event-mode fields, and hands a
 * fully-resolved set of props to the client experience. Keeping the shaping on
 * the server is what lets every section below the hero stay static and cached:
 * a client component reaching for this data would make the whole page dynamic.
 *
 * Every string has a fallback, because an event in Ministree is not obliged to
 * carry a tagline, a venue blurb or an FAQ. A section with nothing to show
 * returns null rather than rendering an empty frame.
 */
export default async function EventSite({
  event,
  locale,
  currency,
}: {
  event: EventDetail;
  locale: Locale;
  currency: string;
}) {
  const [settings, content, slugs, profile, previewToken] = await Promise.all([
    loadSettings(),
    loadContent(),
    loadSlugs(),
    getChurchProfile(),
    getPreviewToken(),
  ]);

  const e = event as EventDetail & Record<string, unknown>;
  const ev = (content as { event?: Record<string, unknown> }).event ?? {};
  const str = (key: string): string | null => {
    const v = ev[key];
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };

  const church = siteName(settings);
  const title = (e.title ?? church) as string;
  const dateLabel = e.startAt
    ? formatDateRange(e.startAt as string, e.endAt as string | undefined, locale)
    : null;
  /* The outlined year sits under the lockup as a graphic. Plenty of events
     already carry it in their name ("Youth Retreat 2026"), and printing it
     again beside the title reads as a mistake rather than as a device. */
  const rawYear = e.startAt ? String(new Date(e.startAt as string).getFullYear()) : null;
  const year = rawYear && !((e.title as string) ?? "").includes(rawYear) ? rawYear : null;

  const venue = (e.locationJson ?? null) as {
    venueName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  } | null;
  const venueName = venue?.venueName ?? null;
  const address = [venue?.street, venue?.city, venue?.postalCode].filter(Boolean).join(", ") || null;
  const venueLabel = [venueName, venue?.city].filter(Boolean).join(" · ") || null;

  const heroImage = ((e.heroMedia as { url?: string } | null)?.url ??
    (e.coverImageUrl as string | null) ??
    null) as string | null;
  /* Extra venue photographs are a Customizer field: an event record carries one
     image, and the venue block is built for three. */
  const extraImages = Array.isArray(ev.venueImages)
    ? (ev.venueImages as unknown[]).filter((u): u is string => typeof u === "string" && Boolean(u))
    : [];
  const venueImages = [heroImage, ...extraImages].filter((u): u is string => Boolean(u));

  /* An event person is either a member of the church or a guest. A guest has no
     Person record at all — their name, title and photo live on the event's own
     row — so reading only the linked person dropped exactly the visiting
     speakers a one-event site is usually built around. The guest fields win
     when present, because that is where someone typed the billing they want. */
  const people: LineupPerson[] = ((e.people ?? []) as Array<Record<string, unknown>>)
    .map((entry, i) => {
      const person = (entry.person ?? null) as Record<string, unknown> | null;
      const linkedName = person
        ? [person.firstName, person.lastName].filter(Boolean).join(" ").trim()
        : "";
      const guestName = typeof entry.name === "string" ? entry.name.trim() : "";
      return {
        id: String(entry.id ?? person?.id ?? i),
        name: guestName || linkedName,
        role:
          (typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : null) ??
          (entry.role as { name?: string } | undefined)?.name ??
          null,
        image:
          (entry.photoUrl as string) ??
          (person?.portraitUrl as string) ??
          (person?.avatarUrl as string) ??
          null,
      };
    })
    .filter((p) => Boolean(p.name));

  const timeline: TimelineEntry[] = ((e.scheduleItems ?? []) as Array<Record<string, unknown>>).map(
    (item, i) => ({
      id: String(item.id ?? i),
      // The big type is the moment; the small type above it says what happens.
      // The schedule stores it the other way round, so they swap here.
      time: item.startAt
        ? new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(
            new Date(item.startAt as string),
          )
        : String(item.title ?? ""),
      label: String(item.title ?? ""),
    }),
  );

  const money = (price: unknown): string | null => {
    if (typeof price !== "number") return null;
    if (price === 0) return "Free";
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(price / 100);
  };
  const tiers: TicketTier[] = ((e.ticketTypes ?? []) as Array<Record<string, unknown>>).map(
    (t, i) => ({
      id: String(t.id ?? i),
      name: String(t.name ?? "Ticket"),
      price: money(t.price),
      description: (t.description as string | null) ?? null,
    }),
  );

  const givingHref = hrefFor(slugs, "giving");

  const social = profile?.socials ?? null;
  const socials = [
    { label: "Instagram", href: social?.instagram },
    { label: "Facebook", href: social?.facebook },
    { label: "YouTube", href: social?.youtube },
    { label: "X", href: social?.x },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  /* The running order the church arranged. `loadContent` has already merged the
     manifest defaults underneath, so this is normally present; the `??` covers
     a template deployed before the field existed. Undefined only — an EMPTY
     array is a church deliberately clearing the page, not an accident, and
     resurrecting the default order there would ignore them. */
  const stack = ((content as { eventSections?: { sections?: PageSection[] } }).eventSections
    ?.sections ?? (defaults.eventSections as { sections: PageSection[] }).sections) as PageSection[];

  /* The nav follows the ORDER ON THE PAGE, not a fixed list — a church who moves
     the venue above the lineup gets a bar that agrees with what they see.
     Anchors match the ids the Event* components render. A beat with nothing to
     show still resolves to null below, so the bar never points at an anchor
     that isn't there. */
  const NAV_BY_TYPE: Record<string, { label: string; href: string; has: boolean }> = {
    statement: { label: "Vision", href: "#vision", has: Boolean(e.description) },
    profileCards: { label: "Lineup", href: "#lineup", has: people.length > 0 },
    schedule: { label: "The night", href: "#night", has: timeline.length > 0 },
    location: { label: "Venue", href: "#venue", has: Boolean(venueName) || venueImages.length > 0 },
    cta: { label: "Tickets", href: "#tickets", has: tiers.length > 0 },
    givingMethods: { label: "Give", href: "#give", has: true },
    accordion: { label: "FAQ", href: "#faq", has: true },
  };
  const seen = new Set<string>();
  const nav = stack
    .map((section) => {
      const entry = NAV_BY_TYPE[section.type];
      if (!entry || !entry.has || seen.has(entry.href)) return null;
      seen.add(entry.href);
      /* The SHORT label, not the section's title. A nav bar wants "Vision", not
         "How the evening unfolds" — the title is the heading on the section
         itself, and putting it here made the bar wrap. */
      return { label: entry.label, href: entry.href };
    })
    .filter((n): n is { label: string; href: string } => n !== null);

  const tagline = str("tagline") ?? (e.description ? null : null);

  /* Everything the event itself knows, in the shape each beat wants. This is the
     FALLBACK layer: a section renders from here whenever its own props are
     empty, which is what stops a church having to retype their lineup into a
     section editor. See `flameEventSections`. */
  const evt: EventSectionContext = {
    keyart: heroImage,
    marquee: [tagline, dateLabel, venueName, venue?.city].filter((v): v is string => Boolean(v)),
    vision: e.description
      ? {
          body: e.description as string,
          label: "The vision",
          footnote: null,
        }
      : null,
    lineup: {
      people,
      label: "The lineup",
      heading: "Who you'll hear",
    },
    timeline: {
      entries: timeline,
      label: "The night",
      heading: "How the evening unfolds",
      note: null,
    },
    venue:
      venueName || venueImages.length > 0
        ? {
            label: "The venue",
            name: venueName ?? "Where",
            blurb: null,
            address,
            directionsUrl: address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [venueName, address].filter(Boolean).join(", "),
                )}`
              : null,
            images: venueImages,
          }
        : null,
    tickets: {
      tiers,
      label: "Tickets",
      heading: "Be in the room",
      href: `${hrefFor(slugs, "events")}/${e.slug as string}`,
      ctaLabel: str("ticketsCta") ?? "Get tickets",
      blurb: null,
      note: str("ticketsNote"),
    },
    givingHref,
    give: {
      cards: [],
      label: "Giving",
      heading: "Ways to give",
      strapline: null,
    },
    faq: {
      entries: [],
      label: "Know before you go",
      heading: "Good to know",
    },
  };

  /* Rendered HERE, on the server, and handed down as a ReactNode.
     `EventExperience` is a client component and seven of Flame's section
     renderers are async server components, so `<Sections>` cannot live inside
     it — but a ReactNode prop crosses the boundary exactly like `children`. */
  const blocks = (
    <Sections sections={stack} registry={flameEventSections} context={{ evt }} />
  );

  const props: EventExperienceProps = {
    presenter: str("presenter") ?? church,
    presenterUrl: profile?.website ?? null,
    title,
    tagline,
    year,
    dateLabel,
    venueLabel,
    keyart: heroImage,
    ticketsHref: evt.tickets?.href ?? null,
    ticketsLabel: evt.tickets?.ctaLabel ?? "Get tickets",
    hasTickets: tiers.length > 0,
    blocks,
    nav,
    socials,
    summary: (e.description as string | null) ?? null,
    preloaderLabel: title,
    /* Not in the Customizer preview: the curtain would wipe across the editor's
       preview pane on every draft reload, hiding the change they just made. */
    preloader:
      (content as { effects?: { preloader?: boolean } }).effects?.preloader !== false &&
      !previewToken,
  };

  return <EventExperience {...props} />;
}
