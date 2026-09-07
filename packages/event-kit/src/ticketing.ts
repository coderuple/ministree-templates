/**
 * Where the ticket buttons go.
 *
 * Three answers, chosen by the church in the Customizer:
 *
 *   onSite    — this template's own checkout, at `/tickets`.
 *   eventPage — the ticket page the platform already hosts for the event.
 *   external  — Eventbrite, a venue box office, whoever is actually selling.
 *
 * Every ticket CTA on a template routes through here — the nav, the hero, the
 * sticky bar, the final call, the tickets route itself. That is the point: a
 * church switching to "somewhere else" should not find one stray button still
 * pointing at a checkout that is no longer in use.
 */

import type { TicketTier } from './event.ts';

export type TicketingMode = 'onSite' | 'eventPage' | 'external';

/** What the Customizer stores. Every key optional — an untouched group is `{}`. */
export interface TicketingConfig {
  mode?: string;
  eventPageUrl?: string;
  sellerName?: string;
  sellerUrl?: string;
  secondSellerName?: string;
  secondSellerUrl?: string;
}

export interface TicketOutlet {
  label: string;
  href: string;
}

export interface ResolvedTicketing {
  mode: TicketingMode;
  /** Where the primary CTA points. Null means there is nowhere to send anyone
   *  — the buttons hide rather than link to a page that cannot sell. */
  href: string | null;
  /** Named sellers, in `external` mode. Empty otherwise. */
  outlets: TicketOutlet[];
  /** True when the church asked for the on-site checkout and did not get it. */
  fellBack: boolean;
}

export interface TicketingOptions {
  /** The event's tiers. A seated one forces the fallback — see below. */
  tickets: TicketTier[];
  /** The event's slug, appended to `eventPageBase`. */
  eventSlug: string;
  /**
   * The platform's event page, WITHOUT the event slug. A template that is the
   * church's own website passes its in-site path (`/events`); a standalone
   * conference site passes the church's website plus its events path, and null
   * when the church profile has no website to build one from.
   */
  eventPageBase: string | null;
  /**
   * How this event's checkout can take money, from the public event payload.
   * Undefined on an older API build — treated as "unknown, carry on", never as
   * "none". Empty is the meaningful case: no provider is wired up.
   */
  paymentMethods?: string[];
  /** Where the on-site checkout lives. */
  onSiteHref?: string;
}

/** `https://church.org` + `/events` → `https://church.org/events`. Null in, null out. */
export function eventPageBaseFrom(website: string | null | undefined, eventsPath = '/events'): string | null {
  const site = (website ?? '').trim().replace(/\/+$/, '');
  if (!site) return null;
  const withScheme = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  return `${withScheme}/${eventsPath.replace(/^\/+/, '')}`;
}

export function resolveTicketing(
  configured: TicketingConfig | undefined,
  opts: TicketingOptions,
): ResolvedTicketing {
  const asked: TicketingMode =
    configured?.mode === 'eventPage' || configured?.mode === 'external'
      ? configured.mode
      : 'onSite';

  /* Two things this checkout genuinely cannot do. Reserved seating needs a seat
     map it does not have, and an event with no payment provider enabled fails
     at submit with "No payment provider enabled" — so offering the form is a
     longer walk to the same dead end.

     The seat test is ANY tier, not only the on-sale ones: better to send
     everyone somewhere that can sell all four tiers than to sell three here and
     strand the fourth. */
  const cannotSellHere =
    opts.tickets.some((t) => t.requiresSeat) || opts.paymentMethods?.length === 0;
  const fellBack = asked === 'onSite' && cannotSellHere;
  const mode: TicketingMode = fellBack ? 'eventPage' : asked;

  if (mode === 'external') {
    const outlets = [
      { label: configured?.sellerName, href: configured?.sellerUrl },
      { label: configured?.secondSellerName, href: configured?.secondSellerUrl },
    ]
      .map(({ label, href }) => ({ label: (label ?? '').trim(), href: (href ?? '').trim() }))
      .filter((o): o is TicketOutlet => o.href.length > 0)
      .map((o) => ({ ...o, label: o.label || 'Buy tickets' }));
    return { mode, href: outlets[0]?.href ?? null, outlets, fellBack };
  }

  if (mode === 'eventPage') {
    const explicit = (configured?.eventPageUrl ?? '').trim();
    const base = opts.eventPageBase?.replace(/\/+$/, '');
    const href = explicit || (base && opts.eventSlug ? `${base}/${opts.eventSlug}` : null);
    return { mode, href: href || null, outlets: [], fellBack };
  }

  return { mode, href: opts.onSiteHref ?? '/tickets', outlets: [], fellBack };
}
