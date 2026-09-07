/**
 * Where the ticket buttons go.
 *
 * flame's own copy, deliberately smaller than the conference templates'. Two
 * differences, both because flame IS the church's website:
 *
 *   - No "on this site" checkout to fall back from. The event page flame links
 *     to is the platform's own, rendered by this template, so there is no
 *     seat-map or payment-provider case to guard against.
 *   - No second seller. The Tickets section already takes extra buttons
 *     (`ctas`), which is where a VIP or accessible-seating outlet belongs.
 *
 * Keep this and `@ministree-templates/event-kit/ticketing` in step by hand if
 * the stored shape changes; the two never import each other on purpose.
 */

/** What the Customizer stores. Every key optional — an untouched group is `{}`. */
export interface TicketingConfig {
  mode?: string;
  eventPageUrl?: string;
  sellerName?: string;
  sellerUrl?: string;
}

/**
 * The address every ticket button on the site points at.
 *
 * Never null: this site always has a page for the event, so "somewhere else"
 * with no address typed in yet falls back to it rather than leaving a church
 * with a site full of dead buttons half way through filling the form in.
 */
export function resolveTicketsHref(
  configured: TicketingConfig | undefined,
  eventPageHref: string,
): string {
  const trimmed = (v: string | undefined) => (v ?? '').trim();
  if (configured?.mode === 'external') return trimmed(configured.sellerUrl) || eventPageHref;
  return trimmed(configured?.eventPageUrl) || eventPageHref;
}

/** What the primary button says, when the church named who is selling. */
export function ticketsCtaLabel(
  configured: TicketingConfig | undefined,
  fallback: string,
): string {
  const seller = (configured?.sellerName ?? '').trim();
  if (configured?.mode !== 'external' || !seller) return fallback;
  return `${fallback} on ${seller}`;
}
