import { loadFeaturedEvent, toEventView, type EventView } from "@ministree-templates/event-kit/event";
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
  /** The event's name, or the demo's. Sits ABOVE the headline, as the eyebrow. */
  eventTitle: string;
  dateLabel: string;
  socials: SocialLink[];
  /** Where every ticket button on the site points, resolved once. */
  ticketing: ResolvedTicketing;
  email: string | null;
  logoLight: string | null;
  /** The header mark: the conference's own logo when it brought one, else the
   *  church's. The footer keeps the church's either way — it signs the page. */
  navLogo: string | null;
  logoDark: string | null;
}

export async function loadPageData(): Promise<PageData> {
  const [content, settings, profile, locale] = await Promise.all([
    loadContent(),
    loadSettings(),
    loadProfile(),
    loadLocale(),
  ]);

  /* Already resolved against the Customizer's choice of source — the picked
     event as it is, the picked event with details changed, or details typed
     by hand. See `event-kit/overrides.ts`. */
  const record = await loadFeaturedEvent(content);
  const event = record ? toEventView(record, locale) : null;

  const church = siteName(settings);
  /* The church's own four are the fallback. A conference usually has its own
     handles — and lives on platforms the church profile has no field for — so
     the Customizer's list wins whenever it has anything in it. */
  const socials = resolveSocials(
    content.socialLinks as Array<{ label?: string; href?: string }> | undefined,
    (profile?.socials ?? null) as Record<string, string | null | undefined> | null,
  );

  /* The demo dates are only ever a stand-in, for NO event. An event brings its
     own and they win — including an event with no dates, which prints none
     rather than borrowing last year's from the template. */
  const dateLabel = event
    ? event.dateLabel
    : formatDateRange("2027-03-18T19:30:00Z", "2027-03-20T18:00:00Z", locale);

  /* One answer for the whole site. Resolved here rather than at each button
     so the header, the hero, the closing call and the bar at the bottom can
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
    /* The church's own logo, or nothing. The Church Profile is the source of
       truth for identity; Site Settings only carries the website's override.

       No bundled mark to fall back on: the template ships no images at all, and
       a placeholder logo is the one asset a church would never want left in by
       accident. `Nav` and `Footer` print the event name instead.

       Two variants because the header sits on the light ground and the footer
       on the dark one, and a single white mark disappears into one of them. */
    logoLight: profile?.logoUrl ?? settings?.logoUrl ?? null,
    logoDark: profile?.logoUrlDark ?? profile?.logoUrl ?? settings?.logoUrl ?? null,
    navLogo: content.nav.logo || (profile?.logoUrlDark ?? profile?.logoUrl ?? settings?.logoUrl ?? null),
  };
}

/** The nav, built from the sections that will actually render. */
export function navLinks(content: SiteContent, event: EventView | null) {
  const hasVenue = Boolean(event?.venue) || (content.venue.images?.length ?? 0) > 0;
  return [
    content.manifesto.enabled !== false && { label: "About", href: "#about" },
    content.speakers.enabled !== false && { label: "Speakers", href: "#speakers" },
    content.experience.enabled !== false && { label: "Experience", href: "#experience" },
    content.days.enabled !== false && { label: "Schedule", href: "#schedule" },
    content.venue.enabled !== false && hasVenue && { label: "Venue", href: "#venue" },
    content.faq.enabled !== false &&
      (content.faq.items?.length ?? 0) > 0 && { label: "FAQ", href: "#faq" },
  ].filter((l): l is { label: string; href: string } => Boolean(l));
}
