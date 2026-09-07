import { resolveEntities, type EventDetail } from '@ministree/template-sdk';
import {
  formatDateRange,
  formatDayNumeral,
  formatTimeRange,
  formatWeekday,
  formatPrice,
  toMinorUnits,
  type Locale,
} from './format.ts';

/**
 * One event, in the shape the three concepts render.
 *
 * This is the only place that knows Ministree's field names. Each concept then
 * composes its own sections out of this — same facts, three visual languages.
 *
 * The rule throughout, inherited from flame: an **empty** Customizer prop
 * inherits from the event record, a **filled** one overrides. A church should
 * never type their venue twice.
 */

export interface Speaker {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  image: string | null;
  bio: string | null;
}

/** One date of the conference — a column in the "Three Days" section. */
export interface EventDay {
  id: string;
  /** "18" */
  numeral: string;
  /** "Thursday" */
  weekday: string;
  /** "7:30 PM" or "10:00 AM – 6:00 PM" */
  time: string;
  startAt: string | null;
  cancelled: boolean;
}

export interface TicketTier {
  id: string;
  name: string;
  description: string | null;
  /** Minor units, already coerced off the wire. Null when unpriced. */
  priceMinor: number | null;
  /** Formatted, or "Free". */
  price: string | null;
  remaining: number;
  soldOut: boolean;
  /** Sales are open right now. */
  onSale: boolean;
  /** Reserved seating — this checkout has no seat map, so it links out. */
  requiresSeat: boolean;
}

export interface EventVenue {
  name: string | null;
  address: string | null;
  city: string | null;
  directionsUrl: string | null;
}

export interface EventView {
  id: string;
  slug: string;
  /** "Uncommon Woman Conference 2027" — the eyebrow, NOT the headline. */
  title: string;
  description: string | null;
  currency: string;
  /** "18–20 March 2027" */
  dateLabel: string;
  startAtMs: number | null;
  endAtMs: number | null;
  heroImage: string | null;
  speakers: Speaker[];
  days: EventDay[];
  tickets: TicketTier[];
  venue: EventVenue | null;
  /** True when at least one tier can actually be bought right now. */
  onSale: boolean;
  /**
   * How this event's checkout can take money — 'card', 'paypal', 'bank_transfer'
   * and so on, derived by Ministree from the providers the church has switched
   * on. Undefined on an older API build, which means "unknown", not "none".
   * Empty means no provider is wired up and nothing can be sold here.
   */
  paymentMethods?: string[];
}

/** The event a single-event site is built around, or null. */
export async function loadFeaturedEvent(content: unknown): Promise<EventDetail | null> {
  const c = content as { featuredEvent?: string };
  if (!c?.featuredEvent) return null;
  const [event] = await resolveEntities<EventDetail>(undefined, 'events', c.featuredEvent);
  return event ?? null;
}

export function toEventView(event: EventDetail, locale: Locale, fallbackCurrency = 'GBP'): EventView {
  const e = event as EventDetail & Record<string, unknown>;
  const currency =
    typeof e.currency === 'string' && e.currency ? (e.currency as string) : fallbackCurrency;

  const startAt = (e.startAt as string | undefined) ?? null;
  const endAt = (e.endAt as string | undefined) ?? null;
  const tickets = toTickets(e, currency, locale);

  return {
    id: String(e.id ?? ''),
    slug: String(e.slug ?? ''),
    title: (e.title as string) ?? '',
    description: (e.description as string | null) ?? null,
    currency,
    dateLabel: formatDateRange(startAt, endAt, locale),
    /* Resolved here, on the server, and passed as a number. `new Date(iso)` on
       a string with no offset is parsed as the READER's local time, so a
       visitor in another country would see a countdown hours out. Ministree
       sends an offset; this stays correct because it is computed once. */
    startAtMs: startAt ? new Date(startAt).getTime() : null,
    endAtMs: endAt ? new Date(endAt).getTime() : null,
    heroImage:
      ((e.heroMedia as { url?: string } | null)?.url ?? (e.coverImageUrl as string | null)) ?? null,
    speakers: toSpeakers(e),
    days: toDays(e, locale),
    tickets,
    venue: toVenue(e),
    onSale: tickets.some((t) => t.onSale && !t.soldOut),
    paymentMethods: Array.isArray(e.paymentMethods)
      ? (e.paymentMethods as string[])
      : undefined,
  };
}

/**
 * An event person is either a member of the church or a guest. A guest has no
 * Person record at all — their name, title, photo and bio live on the event's
 * own row — so reading only the linked person drops exactly the visiting
 * speakers a conference site is built around. The guest fields win when
 * present, because that is where someone typed the billing they want.
 */
function toSpeakers(e: Record<string, unknown>): Speaker[] {
  /* Names collide — two Smiths, a mother and daughter on the same bill. The
     second takes a -2 so a shared ?speaker= link always resolves to one card.
     React still keys off `id`; this exists only for the URL. */
  const used = new Map<string, number>();
  const slugify = (name: string) => {
    const base =
      name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'speaker';
    const seen = (used.get(base) ?? 0) + 1;
    used.set(base, seen);
    return seen === 1 ? base : `${base}-${seen}`;
  };

  return ((e.people ?? []) as Array<Record<string, unknown>>)
    .map((entry, i) => {
      const person = (entry.person ?? null) as Record<string, unknown> | null;
      const linked = person
        ? [person.firstName, person.lastName].filter(Boolean).join(' ').trim()
        : '';
      const guest = typeof entry.name === 'string' ? entry.name.trim() : '';
      const name = guest || linked;
      const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
      return {
        id: String(entry.id ?? person?.id ?? i),
        slug: slugify(name),
        name,
        role: str(entry.title) ?? str((entry.role as { name?: string } | undefined)?.name),
        image:
          (entry.photoUrl as string | null) ??
          (person?.portraitUrl as string | null) ??
          (person?.avatarUrl as string | null) ??
          null,
        bio: str(entry.bio) ?? str(person?.bio),
      };
    })
    .filter((p) => Boolean(p.name));
}

/**
 * The conference's dates, one per column.
 *
 * Bound to `occurrences[]`, not `scheduleItems[]`: schedule items are
 * within-day granularity (7:30 Doors, 8:00 Worship) and would give twelve
 * columns for a three-day conference. Occurrences give exactly one row per
 * date, and are the same array checkout needs for `occurrenceId`.
 *
 * A single-date event has no occurrences at all, so it falls back to the
 * event's own start — one column, which is the right answer for a one-night
 * gathering rather than an empty section.
 */
function toDays(e: Record<string, unknown>, locale: Locale): EventDay[] {
  const occurrences = (e.occurrences ?? []) as Array<Record<string, unknown>>;

  if (occurrences.length) {
    return occurrences
      .filter((o) => o.status !== 'cancelled')
      .map((o, i) => ({
        id: String(o.id ?? i),
        numeral: formatDayNumeral(o.startAt as string, locale),
        weekday: formatWeekday(o.startAt as string, locale),
        time: formatTimeRange(o.startAt as string, o.endAt as string | undefined, locale),
        startAt: (o.startAt as string | undefined) ?? null,
        cancelled: false,
      }));
  }

  const startAt = (e.startAt as string | undefined) ?? null;
  if (!startAt) return [];
  return [
    {
      id: String(e.id ?? 'day'),
      numeral: formatDayNumeral(startAt, locale),
      weekday: formatWeekday(startAt, locale),
      time: formatTimeRange(startAt, e.endAt as string | undefined, locale),
      startAt,
      cancelled: false,
    },
  ];
}

function toTickets(e: Record<string, unknown>, currency: string, locale: Locale): TicketTier[] {
  const now = Date.now();
  return ((e.ticketTypes ?? []) as Array<Record<string, unknown>>).map((t, i) => {
    /* capacity and soldCount arrive raw; the API computes neither remaining
       nor soldOut. Both are Decimal-adjacent, so coerce rather than trust. */
    const capacity = Number(t.capacity) || 0;
    const sold = Number(t.soldCount) || 0;
    const remaining = Math.max(0, capacity - sold);
    const from = t.saleStartAt ? new Date(t.saleStartAt as string).getTime() : null;
    const until = t.saleEndAt ? new Date(t.saleEndAt as string).getTime() : null;
    return {
      id: String(t.id ?? i),
      name: String(t.name ?? 'Ticket'),
      description: (t.description as string | null) ?? null,
      priceMinor: toMinorUnits(t.price),
      price: formatPrice(t.price, currency, locale),
      remaining,
      soldOut: remaining <= 0,
      onSale: (from === null || from <= now) && (until === null || until >= now),
      requiresSeat: t.requiresSeat === true,
    };
  });
}

function toVenue(e: Record<string, unknown>): EventVenue | null {
  const v = (e.locationJson ?? null) as {
    venueName?: string;
    street?: string;
    city?: string;
    postalCode?: string;
  } | null;
  if (!v) return null;
  const name = v.venueName ?? null;
  const address = [v.street, v.city, v.postalCode].filter(Boolean).join(', ') || null;
  if (!name && !address) return null;
  return {
    name,
    address,
    city: v.city ?? null,
    directionsUrl: address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [name, address].filter(Boolean).join(', '),
        )}`
      : null,
  };
}
