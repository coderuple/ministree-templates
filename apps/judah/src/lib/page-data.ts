import { loadFeaturedEvent, toEventView, type EventView } from "@ministree-templates/event-kit/event";
import { applyEventOverrides } from "@ministree-templates/event-kit/overrides";
import { resolveSocials, type SocialLink } from "@ministree-templates/event-kit/socials";
import {
  resolveTicketing,
  eventPageBaseFrom,
  type ResolvedTicketing,
} from "@ministree-templates/event-kit/ticketing";
import { formatDateRange } from "@ministree-templates/event-kit/format";
import { loadContent, loadLocale, loadProfile, loadSettings, siteName } from "@/lib/ministree";
import type { SiteContent } from "@/config/site";

/**
 * Everything the page and the tickets route both need, resolved once.
 *
 * The rule this file exists to enforce: the EVENT is the source of every fact,
 * and the Customizer supplies the words around them. Where there is no event —
 * a fresh deploy nobody has connected yet — the demo conference stands in, so
 * the template looks finished before a church touches it.
 */
export interface PageData {
  content: SiteContent;
  event: EventView | null;
  locale: string | undefined;
  church: string;
  /** The event's name, or the demo's. The header wordmark and the tab. */
  eventTitle: string;
  dateLabel: string;
  socials: SocialLink[];
  /** Where every ticket button on the site points, resolved once. */
  ticketing: ResolvedTicketing;
  email: string | null;
  /** The header mark: the conference's own logo when it brought one, else the
   *  church's. The footer keeps the church's either way — it signs the page. */
  navLogo: string | null;
  logoDark: string | null;
}

/* The demo conference's dates. Only ever a stand-in: a connected event brings
   its own and they win outright, so nobody sees these once connected. */
const DEMO_START = "2027-10-08T18:30:00Z";
const DEMO_END = "2027-10-09T21:00:00Z";

export async function loadPageData(): Promise<PageData> {
  const [content, settings, profile, locale] = await Promise.all([
    loadContent(),
    loadSettings(),
    loadProfile(),
    loadLocale(),
  ]);

  const record = await loadFeaturedEvent(content);
  /* The event is still the source of every fact. The Customizer gets the last
     word over any of them, one field at a time, for the cases the record
     cannot express — see `event-kit/overrides.ts`. */
  const event = applyEventOverrides(
    record ? toEventView(record, locale) : null,
    content.eventDetails,
    locale,
  );

  const church = siteName(settings);
  /* The church's own accounts are the fallback. A conference usually has its
     own handles — and lives on platforms the church profile has no field for —
     so the Customizer's list wins whenever it has anything in it. */
  const socials = resolveSocials(
    content.socialLinks as Array<{ label?: string; href?: string }> | undefined,
    (profile?.socials ?? null) as Record<string, string | null | undefined> | null,
  );

  const dateLabel = event?.dateLabel || formatDateRange(DEMO_START, DEMO_END, locale);

  /* One answer for the whole site. Resolved here rather than at each button so
     the header, the standard, the register band and the bar at the bottom can
     never disagree about where tickets are sold. */
  const ticketing = resolveTicketing(content.tickets.ticketing, {
    tickets: event?.tickets ?? [],
    eventSlug: event?.slug ?? "",
    /* This template is the conference's site, not the church's, so a relative
       /events path would 404. The church profile's website is the only thing
       that knows where their event pages live. */
    eventPageBase: eventPageBaseFrom(profile?.website ?? null),
    paymentMethods: event?.paymentMethods,
  });

  return {
    content,
    event,
    locale,
    church,
    eventTitle: event?.title || content.name,
    dateLabel,
    socials,
    ticketing,
    email: profile?.email ?? null,
    /* The Church Profile is the source of truth for identity; Site Settings
       only carries the website's override. No bundled mark to fall back on —
       a placeholder logo is the one asset a church would never want left in
       by accident, so the header prints the conference name instead. */
    navLogo: content.nav.logo || (profile?.logoUrlDark ?? profile?.logoUrl ?? settings?.logoUrl ?? null),
    logoDark: profile?.logoUrlDark ?? profile?.logoUrl ?? settings?.logoUrl ?? null,
  };
}

/**
 * The index, built from the scenes that will actually render.
 *
 * Numbered, because the menu is styled as a tape index — a gap in the numbers
 * would give away that a section was switched off.
 */
export function indexLinks(content: SiteContent, event: EventView | null) {
  const hasVenue = Boolean(event?.venue) || Boolean(content.venue.image);
  return [
    { label: "The rewind", href: "#top" },
    content.tension.enabled !== false && { label: "The tension", href: "#tension" },
    content.archive.enabled !== false && { label: "The archive", href: "#archive" },
    content.scripture.enabled !== false && { label: "Scripture", href: "#scripture" },
    { label: "The standard", href: "#standard" },
    content.speakers.enabled !== false && { label: "The voices", href: "#speakers" },
    content.venue.enabled !== false && hasVenue && { label: "Venue", href: "#venue" },
    { label: "Tickets", href: "#register" },
  ]
    .filter((l): l is { label: string; href: string } => Boolean(l))
    .map((l, i) => ({ ...l, n: String(i + 1).padStart(2, "0") }));
}

/**
 * The demo conference's venue — used only while no event is connected, the
 * same way the demo lineup and the demo dates stand in. A connected event's
 * own address wins outright.
 */
export function demoVenue(content: SiteContent) {
  const d = content.venue.demo;
  return d.name || d.address
    ? {
        name: d.name || null,
        address: d.address || null,
        city: null,
        directionsUrl: d.address
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [d.name, d.address].filter(Boolean).join(", "),
            )}`
          : null,
      }
    : null;
}

/** "18–20 October 2027" split into the four facts the info grid prints. */
export function facts(
  content: SiteContent,
  event: EventView | null,
  dateLabel: string,
  ticketPrice: string | null,
) {
  const c = content.facts;
  const venue = event?.venue ?? demoVenue(content);
  return [
    { label: c.whenLabel, value: dateLabel, note: c.whenNote },
    {
      label: c.whereLabel,
      value: venue?.name || venue?.city || "To be announced",
      note: venue?.address ? `${venue.address}. ${c.whereNote}` : c.whereNote,
    },
    { label: c.whoLabel, value: c.whoHeading, note: c.whoNote },
    { label: c.ticketsLabel, value: ticketPrice ?? "On sale soon", note: c.ticketsNote },
  ];
}

/** Splits a textarea into lines, dropping the blanks. */
export function lines(value: string | undefined | null): string[] {
  return (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
