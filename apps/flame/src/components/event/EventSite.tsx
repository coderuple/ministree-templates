import {
  getChurchProfile,
  hrefFor,
  type EventDetail,
} from "@ministree/template-sdk";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { Sections, type PageSection } from "@ministree/template-sdk";
import { defaults } from "@/lib/ministree";
import { flameEventSections, type EventSectionContext } from "@/sections/event";
import { backdropElement, backdropEnabled, loadContent, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { formatDateRange, type Locale } from "@/lib/format";
import { resolveSocials } from "@/lib/socials";
import { resolveTicketsHref, ticketsCtaLabel, type TicketingConfig } from "@/lib/ticketing";
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
  /* A label the Customizer typed ("October 2026 · dates on release") is printed
     in place of the range; the real dates still drive the countdown below. */
  const typedDateLabel =
    typeof e.dateLabel === "string" && e.dateLabel.trim() ? e.dateLabel.trim() : null;
  const dateLabel =
    typedDateLabel ??
    (e.startAt ? formatDateRange(e.startAt as string, e.endAt as string | undefined, locale) : null);
  /* The outlined year sits under the lockup as a graphic. Plenty of events
     already carry it in their name ("Youth Retreat 2026"), and printing it
     again beside the title reads as a mistake rather than as a device. */
  /* Resolved here, on the server, and passed as a number. `new Date(iso)` on a
     string with no UTC offset is parsed as the READER's local time, so a
     visitor in another country would see a clock hours out. Ministree sends an
     offset; this only stays correct because it is computed once.
     ponytail: if a church ever reports drift, the event's own `timezone` field
     is the input to an Intl-based fix — not a timezone library. */
  const startAtMs = e.startAt ? new Date(e.startAt as string).getTime() : NaN;
  const endAtMs = e.endAt ? new Date(e.endAt as string).getTime() : null;
  /* Whether the event has already finished is deliberately NOT decided here.
     "Now" on the server is the moment the page was last revalidated, not the
     moment someone is reading it — and `Date.now()` in a component body is an
     impure render either way. `Countdown` has a live clock and takes itself off
     the page past `endAtMs`; one place owns the question. */
  const countdownOn = ev.countdown !== false;
  const heroCountdown = countdownOn && !Number.isNaN(startAtMs) ? startAtMs : null;

  const rawYear = e.startAt ? String(new Date(e.startAt as string).getFullYear()) : null;
  const year = rawYear && !((e.title as string) ?? "").includes(rawYear) ? rawYear : null;

  const venue = (e.locationJson ?? null) as {
    venueName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    address?: string;
    directionsUrl?: string;
  } | null;
  const venueName = venue?.venueName ?? null;
  /* A full address typed in the Customizer is printed exactly as typed. */
  const address =
    venue?.address?.trim() ||
    [venue?.street, venue?.city, venue?.postalCode].filter(Boolean).join(", ") ||
    null;
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
  /* Names collide — two Smiths, a father and son on the same bill. The second
     one takes a -2 so a shared ?speaker= link always resolves to one card.
     React still keys off `id`; this exists only for the URL. */
  const usedSlugs = new Map<string, number>();
  const slugify = (name: string) => {
    const base =
      name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "speaker";
    const seenCount = (usedSlugs.get(base) ?? 0) + 1;
    usedSlugs.set(base, seenCount);
    return seenCount === 1 ? base : `${base}-${seenCount}`;
  };

  const people: LineupPerson[] = ((e.people ?? []) as Array<Record<string, unknown>>)
    .map((entry, i) => {
      const person = (entry.person ?? null) as Record<string, unknown> | null;
      const linkedName = person
        ? [person.firstName, person.lastName].filter(Boolean).join(" ").trim()
        : "";
      const guestName = typeof entry.name === "string" ? entry.name.trim() : "";
      const name = guestName || linkedName;
      return {
        id: String(entry.id ?? person?.id ?? i),
        slug: slugify(name),
        name,
        role:
          (typeof entry.title === "string" && entry.title.trim() ? entry.title.trim() : null) ??
          (entry.role as { name?: string } | undefined)?.name ??
          null,
        image:
          (entry.photoUrl as string) ??
          (person?.portraitUrl as string) ??
          (person?.avatarUrl as string) ??
          null,
        /* Already in the payload, and until now thrown away. A guest's bio is
           typed on the event row itself; a member's lives on their Person
           record. The SDK's types name neither, which is why this file reads
           the whole entry as a record — the data has always been here. */
        bio:
          (typeof entry.bio === "string" && entry.bio.trim() ? entry.bio.trim() : null) ??
          (typeof person?.bio === "string" && person.bio.trim() ? person.bio.trim() : null) ??
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

  const ticketing = (content as { event?: { ticketing?: TicketingConfig } }).event?.ticketing;

  /* The event's own handles when it has them, else the church's four. A
     conference on TikTok or WhatsApp had nowhere to say so before: the church
     profile stores exactly four platforms and nothing else. */
  const socials = resolveSocials(
    (content as { event?: { socialLinks?: Array<{ label?: string; href?: string }> } }).event
      ?.socialLinks,
    (profile?.socials ?? null) as Record<string, string | null | undefined> | null,
  );

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
  /* The menu is built from the sections themselves, not from a list of types.
     It used to be a hardcoded map of seven types to seven fixed labels, so a
     section a church ADDED could never get a link, a second FAQ was silently
     deduped, and the anchors only lined up because the same strings were typed
     on both sides. Now every section carries an anchor — its own if the church
     set one, else this template's default — and that is what the bar links to.

     Beats that fall back to the event record are dropped when the event has
     nothing to show, so the bar never points at a section that rendered null. */
  const EMPTY_WITHOUT: Record<string, boolean> = {
    statement: !e.description,
    profileCards: people.length === 0,
    schedule: timeline.length === 0,
    location: !venueName && venueImages.length === 0,
    cta: tiers.length === 0,
  };
  const DEFAULT_ANCHORS: Record<string, string> = {
    statement: 'vision',
    profileCards: 'lineup',
    schedule: 'night',
    location: 'venue',
    cta: 'tickets',
    givingMethods: 'give',
    accordion: 'faq',
    video: 'trailer',
    features: 'stripping',
    links: 'share',
  };
  /** "the-night" → "The night". Short by nature, which a nav bar needs — the
   *  section's own title is a heading ("How the evening unfolds") and wrapped. */
  const labelFromAnchor = (a: string) =>
    a.replace(/[-_]+/g, ' ').replace(/^\s*\w/, (c) => c.toUpperCase()).trim();

  const seen = new Set<string>();
  const nav = stack
    .map((section) => {
      if (EMPTY_WITHOUT[section.type]) return null;
      const raw = (section as { anchorId?: string }).anchorId?.trim().replace(/^#/, '');
      const anchor = raw || DEFAULT_ANCHORS[section.type];
      // A section with no anchor and no built-in one — a decorative marquee, or
      // something generic a church dropped in — is on the page but not in the bar.
      if (!anchor || seen.has(anchor)) return null;
      seen.add(anchor);
      return { label: labelFromAnchor(anchor), href: `#${anchor}` };
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
            directionsUrl:
              venue?.directionsUrl?.trim() ||
              (address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [venueName, address].filter(Boolean).join(", "),
                  )}`
                : null),
            images: venueImages,
          }
        : null,
    tickets: {
      tiers,
      label: "Tickets",
      heading: "Be in the room",
      /* One answer for every ticket button on the site — header, hero, sticky
         bar, this section. A church selling through Eventbrite moves all of
         them at once instead of leaving one pointing at a page that no longer
         takes orders. */
      /* Details typed by hand have no event behind them, so there is no event
         page to fall back to — only an address the church typed can take a
         button. */
      href: resolveTicketsHref(ticketing, e.slug ? `${hrefFor(slugs, "events")}/${e.slug as string}` : ""),
      ctaLabel: ticketsCtaLabel(ticketing, str("ticketsCta") ?? "Get tickets"),
      blurb: null,
      note: str("ticketsNote"),
      // One per line, the way it is typed. Blank lines dropped so a stray
      // return at the end doesn't render an empty numbered row.
      perks: (str("ticketPerks") ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      phone: str("ticketsPhone"),
    },
    share: {
      // The church's chosen flyer, else the event's own picture — the thing
      // someone would have screenshotted anyway.
      flyerUrl: str("flyerUrl") ?? heroImage,
      filename: `${(e.slug as string) || "event"}.jpg`,
      title,
      text: [title, dateLabel, venueName].filter(Boolean).join(" · ") || null,
      socials,
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
    /* The poster wins over the event's own image when a church set one — the
       loop's first frame and the key art are rarely the same picture, and a
       mismatch shows as a flash when playback starts. */
    keyart: str("backdropPoster") ?? heroImage,
    backdropVideo: str("backdropVideo"),
    ticketsHref: evt.tickets?.href ?? null,
    ticketsLabel: evt.tickets?.ctaLabel ?? "Get tickets",
    /* Tiers to show — or, for details typed by hand, which never have any, an
       address the church gave for wherever tickets are actually sold. A real
       event with no tiers still shows no ticket button. */
    hasTickets: tiers.length > 0 || (!e.slug && Boolean(evt.tickets?.href)),
    blocks,
    nav,
    socials,
    summary: (e.description as string | null) ?? null,
    preloaderLabel: title,
    startAtMs: heroCountdown,
    endAtMs,
    backdrop: backdropEnabled(content) ? backdropElement(content) : null,
    /* Not in the Customizer preview: the curtain would wipe across the editor's
       preview pane on every draft reload, hiding the change they just made. */
    preloader:
      (content as { effects?: { preloader?: boolean } }).effects?.preloader !== false &&
      !previewToken,
  };

  return <EventExperience {...props} />;
}
