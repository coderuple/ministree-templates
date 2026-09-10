/**
 * The Customizer's last word over the event's facts.
 *
 * The event stays the source of every fact — that rule is why `page-data.ts`
 * exists in each app. This is the escape hatch for the times a church needs
 * the SITE to say something the RECORD cannot:
 *
 *   - the conference has a public name ("REWIND 26") and an internal one
 *   - dates are announced as "October 2026, exact dates on release"
 *   - the venue is "central London, revealed to ticket holders"
 *   - two speakers are confirmed but not yet on the event record
 *
 * Blank inherits, filled wins — the same rule the description and the hero
 * image have always followed here, applied to the rest of the facts.
 *
 * Two deliberate limits:
 *
 * 1. **Only on top of a connected event.** With nothing connected the demo
 *    conference still stands in, as it always did. Synthesising an event out
 *    of overrides alone would hand `/tickets` an event with no tiers and no
 *    id — a checkout that renders and cannot possibly take an order.
 *
 * 2. **Never the price.** Checkout posts the event's real `ticketTypeId`s to
 *    the orders API, so a price typed here would be shown and not charged.
 *    Tier names and blurbs are display-only and safe; the number is not.
 */

import { speakerSlugger, type EventDay, type EventVenue, type EventView, type Speaker, type TicketTier } from './event.ts';
import { formatDateRange, formatDayNumeral, formatTimeRange, formatWeekday, type Locale } from './format.ts';

/** What the Customizer stores. Every key optional — an untouched group is `{}`. */
export interface EventOverrides {
  title?: string;
  description?: string;
  /** `YYYY-MM-DD` from a `date` field. Moves the countdown and the SEO dates. */
  startAt?: string;
  endAt?: string;
  /** Free text that beats the formatted range: "October 2026 · dates TBC". */
  dateLabel?: string;
  heroImage?: string;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    directionsUrl?: string;
  };
  /** Any row with a date replaces the event's own dates, in this order. */
  days?: Array<{ date?: string; time?: string }>;
  /** Any row with a name replaces the event's whole lineup. */
  speakers?: Array<{ name?: string; role?: string; image?: string; bio?: string }>;
  /** Positional, like `days.beats`: row 1 renames tier 1. Extra rows are ignored. */
  tickets?: Array<{ name?: string; description?: string }>;
}

const text = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : null;

/**
 * A `date` field gives a bare `YYYY-MM-DD`, which `new Date()` reads as UTC
 * midnight — so a server running west of Greenwich formats it as the day
 * before. Pin it to local noon, where no offset on earth can move the date.
 * Anything already carrying a time is left exactly as it arrived.
 */
function atNoon(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
}

function mapsUrl(name: string | null, address: string | null): string | null {
  const query = [name, address].filter(Boolean).join(', ');
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : null;
}

/**
 * `null` in, `null` out — see limit 1 above, and no override group at all
 * hands back the very same event object.
 */
export function applyEventOverrides(
  event: EventView | null,
  overrides: EventOverrides | undefined | null,
  locale: Locale,
): EventView | null {
  if (!event || !overrides) return event;

  const startAt = atNoon(text(overrides.startAt));
  const endAt = atNoon(text(overrides.endAt));
  const venue = overrideVenue(event.venue, overrides.venue);
  const days = overrideDays(event.days, overrides.days, startAt, endAt, locale);
  const speakers = overrideSpeakers(event.speakers, overrides.speakers);
  const tickets = overrideTickets(event.tickets, overrides.tickets);

  /* An overridden start with no end is a one-day answer, not a range that
     still ends on the record's old date. Only reach for the event's end when
     the start was left alone too. */
  const dateLabel =
    text(overrides.dateLabel) ??
    (startAt ? formatDateRange(startAt, endAt, locale) : event.dateLabel);

  return {
    ...event,
    title: text(overrides.title) ?? event.title,
    description: text(overrides.description) ?? event.description,
    heroImage: text(overrides.heroImage) ?? event.heroImage,
    dateLabel,
    startAtMs: startAt ? new Date(startAt).getTime() : event.startAtMs,
    endAtMs: endAt ? new Date(endAt).getTime() : startAt ? null : event.endAtMs,
    venue,
    days,
    speakers,
    tickets,
    /* Recomputed, not copied: a renamed tier is still the same tier, but this
       has to agree with the array it sits beside whatever else changed. */
    onSale: tickets.some((t) => t.onSale && !t.soldOut),
  };
}

/**
 * Field by field, so a church that only wants to hide the address keeps the
 * venue's name. A venue typed here appears even when the event has none —
 * that is the "central London, revealed later" case.
 */
function overrideVenue(
  current: EventVenue | null,
  o: EventOverrides['venue'],
): EventVenue | null {
  const name = text(o?.name) ?? current?.name ?? null;
  const address = text(o?.address) ?? current?.address ?? null;
  if (!name && !address) return null;

  /* Re-derived rather than inherited: keeping the record's map link beside a
     typed address would point at the wrong building. */
  const touched = Boolean(text(o?.name) || text(o?.address));
  return {
    name,
    address,
    city: text(o?.city) ?? current?.city ?? null,
    directionsUrl:
      text(o?.directionsUrl) ??
      (touched ? mapsUrl(name, address) : (current?.directionsUrl ?? null)),
  };
}

/**
 * All or nothing. A church filling in two rows means "these are the days" —
 * merging them positionally into the event's own would leave a third column
 * from the record sitting after them, which nobody asked for.
 *
 * Falls back to re-deriving the single day from an overridden start, so
 * moving the date moves the schedule column with it.
 */
function overrideDays(
  current: EventDay[],
  rows: EventOverrides['days'],
  startAt: string | null,
  endAt: string | null,
  locale: Locale,
): EventDay[] {
  const dated = (rows ?? [])
    .map((row) => ({ date: atNoon(text(row?.date)), time: text(row?.time) }))
    .filter((row): row is { date: string; time: string | null } => Boolean(row.date));

  if (dated.length) {
    return dated.map((row, i) => ({
      id: `override-${i}`,
      numeral: formatDayNumeral(row.date, locale),
      weekday: formatWeekday(row.date, locale),
      time: row.time ?? '',
      startAt: row.date,
      cancelled: false,
    }));
  }

  /* A single-date event has one column derived from the event's own start.
     Override the start and that column has to follow, or the hero says one
     date and the schedule another. Multi-day events keep their occurrences:
     those are real dates people bought tickets against. */
  if (startAt && current.length <= 1) {
    return [
      {
        id: 'override-0',
        numeral: formatDayNumeral(startAt, locale),
        weekday: formatWeekday(startAt, locale),
        time: formatTimeRange(startAt, endAt, locale),
        startAt,
        cancelled: false,
      },
    ];
  }

  return current;
}

/** All or nothing, for the same reason as the days. */
function overrideSpeakers(current: Speaker[], rows: EventOverrides['speakers']): Speaker[] {
  const named = (rows ?? []).filter((row) => text(row?.name));
  if (!named.length) return current;

  const slugify = speakerSlugger();
  return named.map((row, i) => {
    const name = text(row.name) as string;
    return {
      id: `override-${i}`,
      slug: slugify(name),
      name,
      role: text(row.role),
      image: text(row.image),
      bio: text(row.bio),
    };
  });
}

/**
 * Positional, and wording only. Row 1 renames tier 1, exactly as `days.beats`
 * names day 1 — a church already knows that rule from the schedule section.
 *
 * `id`, `priceMinor`, `price`, `remaining` and the sale window are untouched
 * on purpose: those are what checkout posts and what the buyer is charged.
 */
function overrideTickets(current: TicketTier[], rows: EventOverrides['tickets']): TicketTier[] {
  if (!rows?.length) return current;
  return current.map((tier, i) => {
    const row = rows[i];
    if (!row) return tier;
    return {
      ...tier,
      name: text(row.name) ?? tier.name,
      description: text(row.description) ?? tier.description,
    };
  });
}
