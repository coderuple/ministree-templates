/**
 * Where a site's social links come from.
 *
 * flame's own copy — it deliberately does not depend on event-kit, so the
 * three conference templates and this one can diverge without dragging each
 * other along. Keep the two in step by hand if the shape changes.
 *
 * Two sources, in priority order:
 *
 *   1. The Customizer's own list. A conference usually has its own handles,
 *      separate from the church's, and often on platforms the church profile
 *      has no field for.
 *   2. The church profile, which Ministree types as exactly four —
 *      facebook, instagram, youtube, x. Used when the list is empty, so a
 *      church that has already filled in its profile gets links for free.
 *
 * Deliberately NOT merged: a church that types its own list has said what it
 * wants, and quietly appending the profile's four behind it produces
 * duplicates with different labels.
 */

export interface SocialLink {
  label: string;
  href: string;
  /** "@handle" or the last path segment, for designs that print it. */
  handle: string;
}

/** The four the church profile carries, in the order they read best. */
const PROFILE_ORDER = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['youtube', 'YouTube'],
  ['x', 'X'],
] as const;

/**
 * Churches paste `instagram.com/name`, `@name`, and sometimes a whole URL.
 * Only the last is a working href, so the other two are repaired here rather
 * than shipped as a broken link.
 */
function normaliseHref(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  // A bare handle can't be resolved to a platform on its own — the label is
  // free text, so guessing the domain from it would be a coin toss.
  if (value.startsWith('@')) return null;
  if (value.startsWith('/')) return null;
  return `https://${value.replace(/^\/+/, '')}`;
}

/** "https://instagram.com/uwc" → "@uwc". Falls back to the host. */
export function handleFrom(href: string): string {
  try {
    const url = new URL(href);
    if (url.protocol === 'mailto:') return url.pathname;
    if (url.protocol === 'tel:') return url.pathname;
    const last = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop();
    if (!last) return url.hostname.replace(/^www\./, '');
    return last.startsWith('@') ? last : `@${last}`;
  } catch {
    return href;
  }
}

export function resolveSocials(
  /** The Customizer's list. Rows with no label or no usable link are dropped. */
  custom: ReadonlyArray<{ label?: string; href?: string }> | undefined,
  /** `churchProfile.socials` — the four Ministree stores. */
  profile: Record<string, string | null | undefined> | null | undefined,
): SocialLink[] {
  const fromCustom = (custom ?? [])
    .map((row) => {
      const label = row.label?.trim();
      const href = row.href ? normaliseHref(row.href) : null;
      return label && href ? { label, href, handle: handleFrom(href) } : null;
    })
    .filter((s): s is SocialLink => s !== null);

  if (fromCustom.length > 0) return dedupe(fromCustom);

  const fromProfile = PROFILE_ORDER.map(([key, label]): SocialLink | null => {
    const href = profile?.[key] ? normaliseHref(String(profile[key])) : null;
    return href ? { label, href, handle: handleFrom(href) } : null;
  }).filter((s): s is SocialLink => s !== null);

  return dedupe(fromProfile);
}

/** Same destination twice is a mistake, not a design. */
function dedupe(links: SocialLink[]): SocialLink[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    const key = l.href.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
