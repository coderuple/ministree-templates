import type { Metadata } from "next";
import Link from "next/link";
import { Checkout } from "@ministree-templates/event-kit/checkout-ui";
import { loadPageData } from "@/lib/page-data";
import { lines } from "@/components/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tickets",
};

/**
 * Checkout is its own route, not a section on the scroll page.
 *
 * Three reasons, in order of how much they hurt: it needs `searchParams` for
 * the return from Stripe or PayPal, which would make the whole landing page
 * dynamic; it gives Stripe a stable `return_url` to come back to; and the
 * landing page's frame is `container-type: inline-size`, which creates a
 * containing block that would trap anything `position: fixed` inside it.
 */
export default async function TicketsPage() {
  const { content, event, locale, eventTitle, dateLabel, ticketing } = await loadPageData();
  const c = content;
  const perks = lines(c.tickets.perks);

  return (
    <div className="tickets-page">
      <div className="inner">
        <Link href="/" className="tickets-back">
          <span aria-hidden>←</span> {eventTitle}
        </Link>

        {ticketing.mode !== "onSite" ? (
          /* Tickets are sold somewhere else — either because the church said so
             or because this checkout cannot handle the event (reserved seating,
             or no payment provider switched on). Nothing on the site links here
             in that case, but the route still exists, so say where to go rather
             than showing a form that cannot take an order. */
          <div className="checkout">
            <p className="eyebrow">Tickets</p>
            <h2 className="checkout-heading">Not sold here.</h2>
            <p className="checkout-body">
              {ticketing.outlets.length > 0
                ? "Tickets for this one are handled by:"
                : `Tickets for ${eventTitle} are handled on another page.`}
            </p>
            {ticketing.outlets.length > 0 ? (
              <ul className="checkout-tiers">
                {ticketing.outlets.map((outlet) => (
                  <li key={outlet.href} className="checkout-tier">
                    <div className="checkout-tier-copy">
                      <h3>{outlet.label}</h3>
                    </div>
                    <a href={outlet.href} className="btn btn-primary">
                      {c.tickets.ctaLabel}
                    </a>
                  </li>
                ))}
              </ul>
            ) : ticketing.href ? (
              <a href={ticketing.href} className="btn btn-primary">
                {c.tickets.ctaLabel}
              </a>
            ) : null}
          </div>
        ) : event ? (
          <Checkout
            event={event}
            locale={locale}
            soldOutMessage={c.tickets.soldOutMessage}
            contactHref={c.tickets.phone ? `tel:${c.tickets.phone.replace(/\s+/g, "")}` : null}
          />
        ) : (
          /* No event connected yet. Rather than an empty page or a checkout
             that cannot possibly work, say what is true. */
          <div className="checkout">
            <p className="eyebrow">Tickets</p>
            <h2 className="checkout-heading">Not on sale yet.</h2>
            <p className="checkout-body">
              Tickets for {eventTitle} open closer to {dateLabel}.
            </p>
          </div>
        )}

        {perks.length > 0 ? (
          <div className="checkout" style={{ marginTop: "clamp(40px,6cqi,80px)" }}>
            <p className="eyebrow">What&apos;s included</p>
            <ul className="checkout-tiers">
              {perks.map((perk, i) => (
                <li key={perk} className="checkout-tier">
                  <div className="checkout-tier-copy">
                    <h3>{perk}</h3>
                  </div>
                  <span className="speaker-index">{String(i + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {c.tickets.note ? (
          <p className="checkout-note" style={{ maxWidth: "62ch", margin: "clamp(30px,4cqi,50px) auto 0", textAlign: "center", lineHeight: 1.8 }}>
            {c.tickets.note}
          </p>
        ) : null}

        {c.tickets.phone ? (
          <p className="checkout-note" style={{ textAlign: "center", marginTop: "20px" }}>
            Ticket questions{" "}
            <a href={`tel:${c.tickets.phone.replace(/\s+/g, "")}`} className="link">
              {c.tickets.phone}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
