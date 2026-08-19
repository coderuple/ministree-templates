import {
  getChurchProfile,
  getGiving,
  hrefFor,
  type EventDetail,
} from "@ministree/template-sdk";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { loadContent, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { formatDateRange, type Locale } from "@/lib/format";
import EventExperience, { type EventExperienceProps } from "@/components/event/EventExperience";
import type { LineupPerson } from "@/components/event/sections/EventLineup";
import type { TimelineEntry } from "@/components/event/sections/EventTimeline";
import type { TicketTier } from "@/components/event/sections/EventTickets";
import type { GiveCard } from "@/components/event/sections/EventGive";
import type { FaqEntry } from "@/components/event/sections/EventFaq";

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
  const [settings, content, slugs, profile, giving, previewToken] = await Promise.all([
    loadSettings(),
    loadContent(),
    loadSlugs(),
    getChurchProfile(),
    getGiving(),
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

  const giveCards: GiveCard[] = [];
  const givingHref = hrefFor(slugs, "giving");
  if (giving) {
    giveCards.push({
      key: "online",
      title: str("giveOnlineTitle") ?? "Online",
      body:
        str("giveOnlineBody") ??
        "The fastest way to give — securely, from anywhere, before or after the night.",
      href: givingHref,
      cta: "Give now",
    });
  }
  for (const key of ["text", "cash", "bank"] as const) {
    const body = str(`give${key[0].toUpperCase()}${key.slice(1)}Body`);
    if (!body) continue;
    giveCards.push({
      key,
      title: str(`give${key[0].toUpperCase()}${key.slice(1)}Title`) ?? key,
      body,
    });
  }

  const faqs: FaqEntry[] = Array.isArray(ev.faqs)
    ? (ev.faqs as Array<Record<string, unknown>>)
        .filter((f) => typeof f.q === "string" && typeof f.a === "string")
        .map((f) => ({
          q: f.q as string,
          a: f.a as string,
          linkHref: (f.linkHref as string) ?? null,
          linkLabel: (f.linkLabel as string) ?? null,
        }))
    : [];

  const social = profile?.socials ?? null;
  const socials = [
    { label: "Instagram", href: social?.instagram },
    { label: "Facebook", href: social?.facebook },
    { label: "YouTube", href: social?.youtube },
    { label: "X", href: social?.x },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

  // Only sections that will actually render get a link, so the bar never points
  // at an anchor that isn't on the page.
  const nav = [
    e.description ? { label: "Vision", href: "#vision" } : null,
    people.length > 0 ? { label: "Lineup", href: "#lineup" } : null,
    timeline.length > 0 ? { label: "The night", href: "#night" } : null,
    venueImages.length > 0 || venueName ? { label: "Venue", href: "#venue" } : null,
    tiers.length > 0 ? { label: "Tickets", href: "#tickets" } : null,
    giveCards.length > 0 ? { label: "Give", href: "#give" } : null,
    faqs.length > 0 ? { label: "FAQ", href: "#faq" } : null,
  ].filter((n): n is { label: string; href: string } => n !== null);

  const tagline = str("tagline") ?? (e.description ? null : null);

  const props: EventExperienceProps = {
    presenter: str("presenter") ?? church,
    presenterUrl: profile?.website ?? null,
    title,
    tagline,
    year,
    dateLabel,
    venueLabel,
    keyart: heroImage,
    marquee: [tagline, dateLabel, venueName, venue?.city].filter((v): v is string => Boolean(v)),
    marqueeSecondary: [title, dateLabel].filter((v): v is string => Boolean(v)),
    vision: e.description
      ? {
          body: e.description as string,
          label: str("visionLabel") ?? "The vision",
          footnote: str("visionFootnote"),
        }
      : null,
    lineup: {
      people,
      label: str("lineupLabel") ?? "The lineup",
      heading: str("lineupHeading") ?? "Who you'll hear",
    },
    timeline: {
      entries: timeline,
      label: str("timelineLabel") ?? "The night",
      heading: str("timelineHeading") ?? "How the evening unfolds",
      note: str("timelineNote"),
    },
    venue:
      venueName || venueImages.length > 0
        ? {
            label: str("venueLabel") ?? "The venue",
            name: venueName ?? "Where",
            blurb: str("venueBlurb"),
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
      label: str("ticketsLabel") ?? "Tickets",
      heading: str("ticketsHeading") ?? "Be in the room",
      href: `${hrefFor(slugs, "events")}/${e.slug as string}`,
      ctaLabel: str("ticketsCta") ?? "Get tickets",
      blurb: str("ticketsBlurb"),
      note: str("ticketsNote"),
    },
    give: {
      cards: giveCards,
      label: str("giveLabel") ?? "Giving",
      heading: str("giveHeading") ?? "Ways to give",
      strapline: str("giveStrapline"),
    },
    faq: {
      entries: faqs,
      label: str("faqLabel") ?? "Know before you go",
      heading: str("faqHeading") ?? "Good to know",
    },
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
