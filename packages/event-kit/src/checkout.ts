'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@ministree/template-sdk';
import type { TicketTier } from './event.ts';

/**
 * Guest ticket checkout against Ministree's public order API.
 *
 * Headless: this owns the basket, the order call, the payment handoff and the
 * poll, and renders nothing. `checkout-ui.tsx` is the shared presentation; a
 * concept that wants its own markup can use this hook directly.
 *
 * The response shape is the awkward part. Unlike the giving endpoint there is
 * **no `requiresAction` field**, so which payment path to take is decided by
 * which optional fields came back:
 *
 *   paystackInline → Paystack's modal
 *   redirectUrl    → PayPal approval (or Paystack redirect) — leave the site
 *   clientSecret   → Stripe: mount <PaymentElement>
 *   bankTransfer / ussd → show the details, then poll
 *   none of them   → the order was free and is already confirmed
 *
 * Confirmation is webhook-driven server-side. The client never confirms an
 * order; it polls until the status says so.
 */

export interface OrderResponse {
  id: string;
  status?: string;
  clientSecret?: string;
  stripePublishableKey?: string;
  stripeAccount?: string;
  paystackInline?: { accessCode: string; publicKey: string; reference: string };
  redirectUrl?: string;
  bankTransfer?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    expiresAt?: string;
  };
  ussd?: { code: string };
}

export type CheckoutStep = 'tickets' | 'details' | 'payment' | 'success';

export interface Purchaser {
  name: string;
  email: string;
  /** Ticked the People opt-in: Ministree keeps their details and may get in touch. */
  optIn: boolean;
}

/**
 * The fixed consent line under the opt-in tick. Mirrors PEOPLE_OPT_IN_CONSENT
 * in Ministree's contracts (packages/contracts/src/people/opt-in.ts) — it is
 * what makes the tick valid consent, so it is not a Customizer field.
 */
export const PEOPLE_OPT_IN_CONSENT =
  "We'll keep your details and get in touch about church life and events. Unsubscribe any time.";

/** The invitation above it, in the church's own words when they set one. */
function optInInviteFor(profile: { name?: string | null; peopleOptInInvite?: string | null } | null) {
  const own = profile?.peopleOptInInvite?.trim();
  if (own) return own;
  const name = profile?.name?.trim();
  return name
    ? `Would you like to stay connected with ${name}?`
    : 'Would you like to stay connected with your church?';
}

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
/** The API caps a single line at 20; 10 is the most a person buys by accident. */
const MAX_PER_TIER = 10;

export function useCheckout({
  eventSlug,
  tiers,
  usePaypal = false,
}: {
  eventSlug: string;
  tiers: TicketTier[];
  /**
   * Send `paymentMethod: 'paypal'` instead of letting the API pick a card
   * provider. Derived from the event's own `paymentMethods` by `Checkout`, and
   * only when PayPal is the ONLY way this event can take money — see there.
   */
  usePaypal?: boolean;
}) {
  const client = useMemo(() => createClient(), []);

  const [step, setStep] = useState<CheckoutStep>('tickets');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [purchaser, setPurchaser] = useState<Purchaser>({ name: '', email: '', optIn: false });
  const [optInInvite, setOptInInvite] = useState(() => optInInviteFor(null));
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  /* The church's invitation line comes from its public profile (resolved
     server-side with their name); the generic fallback covers a slow or
     unreachable API. */
  useEffect(() => {
    let cancelled = false;
    client
      .get<{ name?: string | null; peopleOptInInvite?: string | null }>('/church-profile')
      .then((profile) => {
        if (!cancelled && profile) setOptInInvite(optInInviteFor(profile));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [client]);

  const buyable = useMemo(
    () => tiers.filter((t) => t.onSale && !t.soldOut && !t.requiresSeat),
    [tiers],
  );

  const lines = useMemo(
    () =>
      buyable
        .map((tier) => ({ tier, quantity: quantities[tier.id] ?? 0 }))
        .filter((l) => l.quantity > 0),
    [buyable, quantities],
  );

  /* Minor units throughout — `priceMinor` is already coerced off the wire, so
     this is integer arithmetic and never accumulates a float error. */
  const totalMinor = useMemo(
    () => lines.reduce((sum, l) => sum + (l.tier.priceMinor ?? 0) * l.quantity, 0),
    [lines],
  );
  const ticketCount = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);

  const setQuantity = useCallback(
    (tierId: string, next: number) => {
      const tier = buyable.find((t) => t.id === tierId);
      const ceiling = Math.min(MAX_PER_TIER, tier?.remaining ?? MAX_PER_TIER);
      setQuantities((prev) => ({ ...prev, [tierId]: Math.max(0, Math.min(ceiling, next)) }));
    },
    [buyable],
  );

  const submit = useCallback(async () => {
    if (!lines.length) {
      setError('Choose at least one ticket.');
      return;
    }
    if (!purchaser.name.trim() || !purchaser.email.trim()) {
      setError('We need a name and an email to send the tickets to.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const attendeeInfo = { name: purchaser.name.trim(), email: purchaser.email.trim() };
      const body: Record<string, unknown> = {
        items: lines.map((l) => ({
          ticketTypeId: l.tier.id,
          quantity: l.quantity,
          attendeeInfo,
        })),
        purchaserName: purchaser.name.trim(),
        purchaserEmail: purchaser.email.trim(),
        ...(purchaser.optIn ? { marketingOptIn: true } : {}),
      };
      if (usePaypal) {
        body.paymentMethod = 'paypal';
        /* PayPal only, and deliberately: this hits a server-side origin
           allowlist (PAYMENT_RETURN_ALLOWED_ORIGINS), and an unlisted origin
           gets a 400 back. Stripe needs nothing here — its 3DS return_url is
           set client-side from window.location.origin, which is always allowed.
           So the one path that can be rejected is the one a church opts into. */
        body.paymentReturnUrl = `${window.location.origin}/tickets`;
        body.paymentReturnContext = 'events';
      }

      const res = await client.post<OrderResponse>(`/events/${eventSlug}/orders`, body);
      setOrder(res);

      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      if (res.clientSecret || res.paystackInline || res.bankTransfer || res.ussd) {
        setStep('payment');
      } else {
        // Nothing to pay: a free order comes back already confirmed.
        setStep('success');
      }
    } catch (e) {
      setError((e as Error).message || 'We could not start that order.');
    } finally {
      setBusy(false);
    }
  }, [client, eventSlug, lines, purchaser, usePaypal]);

  /** Poll until the webhook confirms. Used after PayPal, bank transfer, USSD. */
  const startPolling = useCallback(
    (orderId: string) => {
      setPolling(true);
      setPollTimedOut(false);
      const url = client.publicUrl(`/events/${eventSlug}/orders/${orderId}`);
      const startedAt = Date.now();
      let stopped = false;

      const poll = async () => {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok || stopped) return;
          const data = (await res.json()) as { id: string; status: string };
          if (data.status === 'confirmed') {
            stopped = true;
            setPolling(false);
            setStep('success');
          }
          if (data.status === 'cancelled') {
            stopped = true;
            setPolling(false);
            setError('That order was cancelled before it completed.');
          }
        } catch {
          // Keep polling — a dropped request is not a failed payment.
        }
      };

      void poll();
      const interval = setInterval(() => {
        if (stopped) return clearInterval(interval);
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          clearInterval(interval);
          setPolling(false);
          setPollTimedOut(true);
          return;
        }
        void poll();
      }, POLL_INTERVAL_MS);

      return () => {
        stopped = true;
        clearInterval(interval);
      };
    },
    [client, eventSlug],
  );

  /* Coming back from Stripe's 3DS hop or PayPal's approval. Stripe lands with
     ?redirect_status=succeeded; PayPal lands with nothing to say, so we poll.
     Both carry the order id we put in the return URL. */
  const returnHandled = useRef(false);
  useEffect(() => {
    if (returnHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    if (!orderId) return;
    returnHandled.current = true;
    setOrder((prev) => prev ?? { id: orderId });
    if (params.get('redirect_status') === 'succeeded') {
      setStep('success');
      return;
    }
    setStep('payment');
    startPolling(orderId);
  }, [startPolling]);

  return {
    step,
    setStep,
    quantities,
    setQuantity,
    purchaser,
    setPurchaser,
    optInInvite,
    lines,
    buyable,
    totalMinor,
    ticketCount,
    order,
    error,
    setError,
    busy,
    polling,
    pollTimedOut,
    submit,
    startPolling,
    maxPerTier: MAX_PER_TIER,
  };
}
