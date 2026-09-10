/**
 * Where a conference site's facts come from.
 *
 * A church answers one question in the Customizer — "Where do the details
 * come from?" — and this file is that answer, applied to the event RECORD
 * before anything reads it:
 *
 *   event         the picked event, exactly as it is
 *   eventTweaked  the picked event, with `eventDetails` having the last word
 *   manual        no event at all; the site is built from `eventDetails`
 *
 * Working on the raw record rather than on one template's view of it is the
 * point. Every template maps the record its own way — four through
 * `toEventView`, Flame through its own `EventSite` — and all of them pick the
 * answer up for free, the browser tab and the share card included, because
 * there is nowhere left downstream for the old value to leak through.
 *
 * Where a church's wording has no field on the record — dates printed as
 * "October, exact days on release", a day's times as "Doors 6:30" — it rides
 * along as a display key (`dateLabel`, `timeLabel`, `locationJson.address`,
 * `locationJson.directionsUrl`) and the mappers prefer it when present.
 *
 * Three deliberate limits:
 *
 * 1. **Never the price.** Checkout posts the event's real `ticketTypeId`s, so
 *    a price typed here would be shown and not charged. Tier names and blurbs
 *    are display-only and safe; the number is not.
 * 2. **Details typed by hand sell nothing on the site.** They carry no ticket
 *    types and no payment methods, which sends `resolveTicketing` to its
 *    fallback: every button goes wherever the church said tickets are sold, or
 *    nowhere. A checkout for an event with no id cannot take an order.
 * 3. **Details typed by hand need a name.** Until the title has something in
 *    it the answer is null, so the demo conference (or Flame's church home)
 *    still stands in — exactly as it does for a picker with nothing picked.
 *
 * A field nobody can see never decides what the site says: "exactly as it is"
 * ignores saved details, and "typed by hand" ignores a saved event.
 */

import type { EventDetail } from '@ministree/template-sdk';

export type EventSource = 'event' | 'eventTweaked' | 'manual';

/** What the Customizer stores. Every key optional — an untouched group is `{}`. */
export interface EventDetails {
  title?: string;
  /** Free text printed in place of the formatted range: "October 2026 · dates TBC". */
  dateLabel?: string;
  /** `YYYY-MM-DD` from a `date` field. */
  startAt?: string;
  endAt?: string;
  description?: string;
  venue?: { name?: string; address?: string; city?: string; directionsUrl?: string };
  /** Any row with a date replaces the event's own dates, in this order. */
  days?: Array<{ date?: string; time?: string }>;
  /** Any row with a name replaces the event's whole lineup. */
  speakers?: Array<{ name?: string; role?: string; image?: string; bio?: string }>;
}

/** Positional, like `days.beats`: row 1 renames tier 1. Extra rows are ignored. */
export type TicketNames = Array<{ name?: string; description?: string }>;

interface SourceContent {
  eventSource?: string;
  eventDetails?: EventDetails;
  eventTicketNames?: TicketNames;
}

type Row = Record<string, unknown>;

const text = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : null;

/** Anything unrecognised — a template saved before the choice existed included — reads as "as it is". */
export function eventSource(content: unknown): EventSource {
  const v = (content as SourceContent | null)?.eventSource;
  return v === 'eventTweaked' || v === 'manual' ? v : 'event';
}

export function resolveEventRecord(record: EventDetail | null, content: unknown): EventDetail | null {
  const c = (content ?? {}) as SourceContent;
  const source = eventSource(c);
  if (source === 'manual') return fromDetails(c.eventDetails);
  if (source === 'eventTweaked' && record) return withDetails(record, c.eventDetails, c.eventTicketNames);
  return record;
}

/**
 * A `date` field gives a bare `YYYY-MM-DD`, which `new Date()` reads as UTC
 * midnight — so a server running west of Greenwich formats it as the day
 * before. Pin it to local noon, where no offset on earth can move the date.
 * Anything already carrying a time is left exactly as it arrived.
 */
function atNoon(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
}

function withDetails(record: EventDetail, d: EventDetails = {}, names: TicketNames = []): EventDetail {
  const r = record as EventDetail & Row;
  const out: Row = { ...r };

  const title = text(d.title);
  if (title) out.title = title;
  const description = text(d.description);
  if (description) out.description = description;
  const dateLabel = text(d.dateLabel);
  if (dateLabel) out.dateLabel = dateLabel;

  /* An overridden start with no end is a one-day answer, not a range that
     still ends on the record's old date. */
  const startAt = atNoon(text(d.startAt));
  const endAt = atNoon(text(d.endAt));
  if (startAt) {
    out.startAt = startAt;
    out.endAt = endAt;
  }

  const locationJson = venueWith((r.locationJson ?? null) as Row | null, d.venue);
  if (locationJson) out.locationJson = locationJson;

  /* A single-date event's one column follows a moved start, or the hero says
     one date and the schedule another. A multi-date event keeps its
     occurrences — those are real dates people bought tickets against. */
  const current = (r.occurrences ?? []) as Row[];
  const occurrences =
    dayRows(d.days) ?? (startAt && current.length <= 1 ? [dayRow(0, startAt, endAt, '')] : null);
  if (occurrences) out.occurrences = occurrences;

  const people = speakerRows(d.speakers);
  if (people) out.people = people;

  if (names.length) out.ticketTypes = renameTiers((r.ticketTypes ?? []) as Row[], names);

  return out as unknown as EventDetail;
}

function fromDetails(d: EventDetails = {}): EventDetail | null {
  const title = text(d.title);
  if (!title) return null;
  const startAt = atNoon(text(d.startAt));
  const endAt = atNoon(text(d.endAt));
  const record: Row = {
    id: '',
    slug: '',
    title,
    description: text(d.description),
    startAt,
    endAt,
    locationJson: venueWith(null, d.venue),
    occurrences: dayRows(d.days) ?? (startAt ? [dayRow(0, startAt, endAt, '')] : []),
    people: speakerRows(d.speakers) ?? [],
    /* Limit 2: nothing to sell, and no provider to sell it through. */
    ticketTypes: [],
    paymentMethods: [],
  };
  const dateLabel = text(d.dateLabel);
  if (dateLabel) record.dateLabel = dateLabel;
  return record as unknown as EventDetail;
}

/**
 * Field by field over whatever the record already says, so a church that
 * only renames the room keeps its address. A typed full address is printed as
 * typed — never with the old city and postcode tacked on the end.
 */
function venueWith(current: Row | null, v: EventDetails['venue']): Row | null {
  const name = text(v?.name);
  const address = text(v?.address);
  const city = text(v?.city);
  const directionsUrl = text(v?.directionsUrl);
  if (!name && !address && !city && !directionsUrl) return current;
  return {
    ...(current ?? {}),
    ...(name ? { venueName: name } : null),
    ...(city ? { city } : null),
    ...(address ? { address } : null),
    ...(directionsUrl ? { directionsUrl } : null),
  };
}

/**
 * All or nothing: two filled rows mean "these are the days", not "these two,
 * then whatever the record had after them". An empty `timeLabel` is an
 * answer too — a day typed with no times shows none, not the noon its date
 * was pinned to.
 */
function dayRows(rows: EventDetails['days']): Row[] | null {
  const dated = (rows ?? []).filter((row) => text(row?.date));
  return dated.length
    ? dated.map((row, i) => dayRow(i, atNoon(text(row.date)) as string, null, text(row.time) ?? ''))
    : null;
}

function dayRow(i: number, startAt: string, endAt: string | null, timeLabel: string): Row {
  return { id: `override-${i}`, startAt, endAt, status: 'scheduled', timeLabel };
}

/**
 * All or nothing, for the same reason. Written as guest rows — name, title,
 * photo and bio on the event's own row — which is the shape every template's
 * mapper already reads first, so slugs and fallbacks behave exactly as they
 * do for a real visiting speaker.
 */
function speakerRows(rows: EventDetails['speakers']): Row[] | null {
  const named = (rows ?? []).filter((row) => text(row?.name));
  return named.length
    ? named.map((row, i) => ({
        id: `override-${i}`,
        name: text(row.name),
        title: text(row.role),
        photoUrl: text(row.image),
        bio: text(row.bio),
      }))
    : null;
}

/**
 * Wording only. `id`, `price`, `capacity` and the sale window are untouched on
 * purpose: those are what checkout posts and what the buyer is charged.
 */
function renameTiers(tiers: Row[], names: TicketNames): Row[] {
  return tiers.map((tier, i) => {
    const row = names[i];
    return row
      ? { ...tier, name: text(row.name) ?? tier.name, description: text(row.description) ?? tier.description }
      : tier;
  });
}
