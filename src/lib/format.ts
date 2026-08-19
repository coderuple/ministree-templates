/**
 * Formatting helpers shared across flame surfaces.
 *
 * Every one takes an explicit `locale`. They used to hardcode `en-US`, which
 * meant a UK church claiming Gift Aid saw American date order on every sermon
 * and blog post, and dollar signs on its ticket prices. The locale is resolved
 * once per request from the church's own settings — see `loadLocale()` in
 * `lib/ministree.ts`.
 *
 * `undefined` is a meaningful value here: it tells `Intl` to use the runtime
 * default rather than a region we invented on the church's behalf.
 */

export type Locale = string | undefined;

export function formatDate(
  value: string | null | undefined,
  locale?: Locale,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(locale, opts ?? { year: "numeric", month: "long", day: "numeric" });
}

export function formatTime(value: string | null | undefined, locale?: Locale): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

export function formatDateRange(
  start?: string | null,
  end?: string | null,
  locale?: Locale,
): string {
  if (!start) return "";
  const left = `${formatDate(start, locale)} · ${formatTime(start, locale)}`;
  return end ? `${left} – ${formatTime(end, locale)}` : left;
}

/**
 * Money in minor units → display string.
 *
 * `currency` is required rather than defaulting to USD: an event carries its own
 * currency and giving carries the church's, so a silent dollar default was only
 * ever wrong for everyone outside the US.
 */
export function formatPrice(
  minorUnits: number | null | undefined,
  currency: string,
  locale?: Locale,
): string {
  if (minorUnits == null) return "";
  if (minorUnits === 0) return "Free";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(minorUnits / 100);
}
