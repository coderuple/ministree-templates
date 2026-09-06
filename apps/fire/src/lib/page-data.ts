import { loadFeaturedEvent, toEventView, type EventView } from "@ministree-templates/event-kit/event";
import { resolveSocials, type SocialLink } from "@ministree-templates/event-kit/socials";
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
  email: string | null;
  logoLight: string;
  logoDark: string;
}

export async function loadPageData(): Promise<PageData> {
  const [content, settings, profile, locale] = await Promise.all([
    loadContent(),
    loadSettings(),
    loadProfile(),
    loadLocale(),
  ]);

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

  /* The demo dates are only ever a stand-in. A connected event brings its own,
     and they win — a church should never see last year's dates because the
     template shipped with them. */
  const dateLabel =
    event?.dateLabel ||
    formatDateRange("2027-03-18T19:30:00Z", "2027-03-20T18:00:00Z", locale);

  return {
    content,
    event,
    locale,
    church,
    eventTitle: event?.title || content.name,
    dateLabel,
    socials,
    email: profile?.email ?? null,
    /* The church's own logo once they have one. The Church Profile is the
       source of truth for identity; Site Settings only carries the website's
       override of it. The demo mark ships so the template does not open on an
       empty header.

       Two variants because the header sits on ivory and the footer on the dark
       ground — a single white logo disappears into one of them. */
    logoLight: profile?.logoUrl ?? settings?.logoUrl ?? "/images/uwc-logo-ink.png",
    logoDark:
      profile?.logoUrlDark ?? profile?.logoUrl ?? settings?.logoUrl ?? "/images/uwc-logo-white.png",
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
