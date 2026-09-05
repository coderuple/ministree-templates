/**
 * Formatting shared by every concept. Each function takes an explicit locale,
 * resolved once per request from the church's own settings — a UK church
 * claiming Gift Aid should not see American date order on its own conference.
 *
 * `undefined` is meaningful: it tells `Intl` to use the runtime default rather
 * than a region we invented on the church's behalf.
 */

export type Locale = string | undefined;

/**
 * Ticket prices off the wire, as a number of MINOR units.
 *
 * Prisma serialises `Decimal` to a JSON **string**, and `TicketType.price` is
 * `Decimal(10,2)` holding minor units (the per-date override beside it in
 * schema.prisma says so in as many words). So a £25 ticket arrives as the
 * string "2500", and both existing readers get it wrong in different ways:
 *
 *   flame  `if (typeof price !== "number") return null`  → every price vanishes
 *   site   types it `number`, then relies on "2500" / 100 coercing
 *
 * Coerce once, here, at the boundary. Everything downstream — the tier list,
 * the basket total, the reduce in checkout — then adds numbers instead of
 * concatenating strings.
 */
export function toMinorUnits(price: unknown): number | null {
  if (price === null || price === undefined) return null;
  const n = typeof price === 'number' ? price : Number(price);
  return Number.isFinite(n) ? n : null;
}

/** A price for display. Zero is "Free", not "£0.00". */
export function formatPrice(
  price: unknown,
  currency: string,
  locale?: Locale,
  freeLabel = 'Free',
): string | null {
  const minor = toMinorUnits(price);
  if (minor === null) return null;
  if (minor === 0) return freeLabel;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minor / 100);
  } catch {
    return `${currency} ${(minor / 100).toFixed(2)}`;
  }
}

/** The currency glyph alone, for a big-number total. */
export function currencyGlyph(currency: string, locale?: Locale): string {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? ''
    );
  } catch {
    return '';
  }
}

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTime(value: string | null | undefined, locale?: Locale): string {
  const d = parse(value);
  if (!d) return '';
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
}

/**
 * "18–20 March 2027" · "18 March 2027" · "28 Feb – 2 March 2027".
 *
 * The hero prints this under the title, so it collapses everything the two
 * dates share: same month and year prints the month once, a range crossing a
 * month keeps both. An en dash, not a hyphen — it is a range, and the concepts
 * set it in display type where the difference is visible.
 */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale?: Locale,
): string {
  const a = parse(start);
  if (!a) return '';
  const b = parse(end);
  const day = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric' });
  const monthYear = (d: Date) => d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const full = (d: Date) =>
    d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  if (!b || a.toDateString() === b.toDateString()) return full(a);
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${day(a)}–${day(b)} ${monthYear(a)}`;
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${day(a)} ${a.toLocaleDateString(locale, { month: 'long' })} – ${full(b)}`;
  }
  return `${full(a)} – ${full(b)}`;
}

/** "Thursday" — the weekday a day column is headed with. */
export function formatWeekday(value: string | null | undefined, locale?: Locale): string {
  const d = parse(value);
  return d ? d.toLocaleDateString(locale, { weekday: 'long' }) : '';
}

/** "18" — the giant numeral in a day column. */
export function formatDayNumeral(value: string | null | undefined, locale?: Locale): string {
  const d = parse(value);
  return d ? d.toLocaleDateString(locale, { day: 'numeric' }) : '';
}

/** "7:30 PM" or "10:00 AM – 6:00 PM" when a day has an end. */
export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale?: Locale,
): string {
  const from = formatTime(start, locale);
  if (!from) return '';
  const to = formatTime(end, locale);
  return to && to !== from ? `${from} – ${to}` : from;
}

/**
 * Scroll progress, clamped. The prototypes' two modes, verbatim:
 *   pin   — through a tall section whose child is sticky
 *   cover — as the section crosses the viewport
 * `enter` is Concept 01's third mode, used where a section should finish its
 * move as its top reaches the top of the screen.
 */
export function scrollProgress(
  mode: string | null,
  rect: { top: number; height: number },
  viewportHeight: number,
): number {
  let p: number;
  if (mode === 'pin') p = -rect.top / Math.max(1, rect.height - viewportHeight);
  else if (mode === 'enter') p = (viewportHeight - rect.top) / viewportHeight;
  else p = (viewportHeight - rect.top) / (viewportHeight + rect.height);
  // `|| 0` normalises -0, which `-r.top / span` produces at rest and which
  // reads back out of `getComputedStyle` as "-0".
  return p < 0 ? 0 : p > 1 ? 1 : p || 0;
}

/**
 * One stage's opacity in a three-stage crossfade.
 *
 * `min(fadeIn, fadeOut)` with a short ramp, so exactly one stage is legible at
 * a time and the handover reads as a distinct moment rather than a dissolve.
 * The last stage never fades out — the section ends on it.
 */
export function stageOpacity(
  p: number,
  index: number,
  segments: ReadonlyArray<readonly [number, number]>,
  ramp = 0.05,
): number {
  const seg = segments[index];
  if (!seg) return 0;
  const [a, b] = seg;
  const lead = ramp / 2.5;
  const fadeIn = Math.min(1, Math.max(0, (p - (a - lead)) / ramp));
  const fadeOut =
    index === segments.length - 1 ? 1 : Math.min(1, Math.max(0, (b + lead - p) / ramp));
  return Math.min(fadeIn, fadeOut);
}
