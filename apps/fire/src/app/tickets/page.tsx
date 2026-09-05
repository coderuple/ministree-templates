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
  const { content, event, locale, eventTitle, dateLabel } = await loadPageData();
  const c = content;
  const perks = lines(c.tickets.perks);

  return (
    <div className="tickets-page">
      <div className="inner">
        <Link href="/" className="tickets-back">
          <span aria-hidden>←</span> {eventTitle}
        </Link>

        {event ? (
          <Checkout
            event={event}
            locale={locale}
            usePaypal={c.tickets.usePaypal === true}
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
