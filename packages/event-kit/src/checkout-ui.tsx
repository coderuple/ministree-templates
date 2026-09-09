'use client';

import { useEffect } from 'react';
import { PEOPLE_OPT_IN_CONSENT, useCheckout } from './checkout.ts';
import { StripePanel } from './stripe-panel.tsx';
import { formatPrice } from './format.ts';
import type { EventView } from './event.ts';
import type { Locale } from './format.ts';

/**
 * The shared checkout UI.
 *
 * One implementation for all three concepts, not three. The design handoff is
 * explicit that the concepts have no form states and no checkout screen — so
 * there is no per-concept design to be faithful to, and three skins would be
 * three inventions. Everything visual here comes from CSS custom properties
 * and semantic class names each concept's stylesheet already defines, so the
 * page still arrives in that concept's palette, type and shape.
 *
 * A concept that later wants its own markup uses `useCheckout()` directly.
 */
export function Checkout({
  event,
  locale,
  soldOutMessage = 'Tickets for this one have all gone.',
  seatedMessage = 'Reserved seating — get in touch and we will place you.',
  contactHref,
}: {
  event: EventView;
  locale: Locale;
  soldOutMessage?: string;
  seatedMessage?: string;
  /** Where "get in touch" points for reserved-seating tiers. */
  contactHref?: string | null;
}) {
  /* This used to be a question in the Customizer, which asked a church to know
     something about their own payment setup that Ministree already knows. The
     event now says how it can take money, so: PayPal only when it is the only
     way — otherwise the API picks a card provider, which is what a card-and-
     PayPal church wants by default and what every other church has to have.
     A method picker would be the richer answer; nobody has asked for one. */
  const methods = event.paymentMethods;
  const usePaypal = methods?.includes('paypal') === true && !methods.includes('card');

  const c = useCheckout({ eventSlug: event.slug, tiers: event.tickets, usePaypal });
  const money = (minor: number) => formatPrice(minor, event.currency, locale) ?? '';

  /* Bank transfer and USSD confirm out of band, so start watching as soon as
     those details are on screen rather than waiting for the reader to act. */
  useEffect(() => {
    if (c.step !== 'payment' || !c.order) return;
    if (c.order.bankTransfer || c.order.ussd) return c.startPolling(c.order.id);
  }, [c.step, c.order, c.startPolling]);

  const seated = event.tickets.filter((t) => t.requiresSeat && !t.soldOut);

  if (c.step === 'success') {
    return (
      <div className="checkout checkout-success">
        <p className="eyebrow">You're in</p>
        <h2 className="checkout-heading">See you there.</h2>
        <p className="checkout-body">
          Your tickets are on their way to {c.purchaser.email || 'your inbox'}. Bring the QR code in
          that email — on your phone is fine.
        </p>
        {c.order?.id ? <p className="checkout-note">Order {c.order.id.slice(0, 8)}</p> : null}
      </div>
    );
  }

  if (c.step === 'payment' && c.order) {
    const o = c.order;
    return (
      <div className="checkout">
        <p className="eyebrow">Payment</p>
        <h2 className="checkout-heading">{money(c.totalMinor)}</h2>
        {c.error ? <p className="checkout-error">{c.error}</p> : null}

        {o.clientSecret && o.stripePublishableKey ? (
          <StripePanel
            publishableKey={o.stripePublishableKey}
            stripeAccount={o.stripeAccount}
            clientSecret={o.clientSecret}
            submitLabel={`Pay ${money(c.totalMinor)}`}
            returnUrl={`${typeof window === 'undefined' ? '' : window.location.origin}/tickets?order=${o.id}`}
            onSuccess={() => c.setStep('success')}
            onError={c.setError}
          />
        ) : null}

        {o.bankTransfer ? (
          <dl className="checkout-transfer">
            <dt>Bank</dt>
            <dd>{o.bankTransfer.bankName}</dd>
            <dt>Account name</dt>
            <dd>{o.bankTransfer.accountName}</dd>
            <dt>Account number</dt>
            <dd>{o.bankTransfer.accountNumber}</dd>
            <dt>Amount</dt>
            <dd>{money(o.bankTransfer.amount)}</dd>
          </dl>
        ) : null}

        {o.ussd ? (
          <p className="checkout-body">
            Dial <strong>{o.ussd.code}</strong> on the phone you bank with.
          </p>
        ) : null}

        {c.polling ? <p className="checkout-note">Waiting for the payment to clear…</p> : null}
        {c.pollTimedOut ? (
          <p className="checkout-note">
            This is taking longer than usual. Your tickets will still arrive by email once the
            payment clears.{' '}
            <button type="button" className="link" onClick={() => c.startPolling(o.id)}>
              Check again
            </button>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="checkout">
      <p className="eyebrow">Tickets</p>
      <h2 className="checkout-heading">Be in the room.</h2>

      {c.buyable.length === 0 ? (
        <p className="checkout-body">{soldOutMessage}</p>
      ) : (
        <>
          <ul className="checkout-tiers">
            {c.buyable.map((tier) => {
              const qty = c.quantities[tier.id] ?? 0;
              const ceiling = Math.min(c.maxPerTier, tier.remaining);
              return (
                <li key={tier.id} className="checkout-tier">
                  <div className="checkout-tier-copy">
                    <h3>{tier.name}</h3>
                    {tier.description ? <p>{tier.description}</p> : null}
                    {tier.remaining <= 10 ? (
                      <p className="checkout-note">{tier.remaining} left</p>
                    ) : null}
                  </div>
                  <span className="checkout-tier-price">{tier.price}</span>
                  <div className="checkout-stepper">
                    <button
                      type="button"
                      aria-label={`One fewer ${tier.name}`}
                      disabled={qty <= 0}
                      onClick={() => c.setQuantity(tier.id, qty - 1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{qty}</span>
                    <button
                      type="button"
                      aria-label={`One more ${tier.name}`}
                      disabled={qty >= ceiling}
                      onClick={() => c.setQuantity(tier.id, qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="checkout-details">
            <label>
              <span>Your name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={c.purchaser.name}
                onChange={(e) => c.setPurchaser({ ...c.purchaser, name: e.target.value })}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={c.purchaser.email}
                onChange={(e) => c.setPurchaser({ ...c.purchaser, email: e.target.value })}
              />
              <small>We send the tickets here.</small>
            </label>
          </div>

          {/* The People opt-in: the same two lines as Ministree's own checkout —
              the church's invitation, then the fixed consent line. */}
          <label className="checkout-optin">
            <input
              type="checkbox"
              name="optIn"
              checked={c.purchaser.optIn}
              onChange={(e) => c.setPurchaser({ ...c.purchaser, optIn: e.target.checked })}
            />
            <span>
              <strong>{c.optInInvite}</strong>
              <small>{PEOPLE_OPT_IN_CONSENT}</small>
            </span>
          </label>

          {c.error ? <p className="checkout-error">{c.error}</p> : null}

          <div className="checkout-total">
            <span>
              {c.ticketCount} {c.ticketCount === 1 ? 'ticket' : 'tickets'}
            </span>
            <strong>{money(c.totalMinor)}</strong>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={c.busy || c.ticketCount === 0}
            onClick={() => void c.submit()}
          >
            {c.busy ? 'One moment…' : c.totalMinor === 0 ? 'Claim your place' : 'Continue to payment'}
          </button>
        </>
      )}

      {/* Reserved seating needs a seat map, holds and hold ids. These concepts
          have no seating design, so say so rather than offering a purchase
          that fails at the API. */}
      {seated.length > 0 ? (
        <div className="checkout-seated">
          <p className="checkout-note">{seatedMessage}</p>
          <ul>
            {seated.map((t) => (
              <li key={t.id}>
                {t.name} {t.price ? <span>· {t.price}</span> : null}
              </li>
            ))}
          </ul>
          {contactHref ? (
            <a className="link" href={contactHref}>
              Get in touch <span aria-hidden>→</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default Checkout;
