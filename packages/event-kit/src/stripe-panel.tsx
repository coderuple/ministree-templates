'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadStripe, type Appearance, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

/** `loadStripe` must be called once per key+account pair — cache the promise. */
const cache = new Map<string, Promise<Stripe | null>>();
function getStripe(pk: string, account?: string): Promise<Stripe | null> {
  const key = account ? `${pk}::${account}` : pk;
  let p = cache.get(key);
  if (!p) {
    /* Stripe Connect: the clientSecret belongs to the church's connected
       account, so Stripe.js has to be initialised on behalf of it or
       confirmPayment fails with "No such payment_intent".

       ponytail: correct as written, but the API currently drops `stripeAccount`
       on its way out — apps/api/src/events/order/stripe-event-payment.service.ts
       returns the adapter result without it. Until that lands, Connect churches
       see exactly that error. Do not work around it here; the workaround would
       break when the field starts arriving. */
    p = loadStripe(pk, account ? { stripeAccount: account } : undefined);
    cache.set(key, p);
  }
  return p;
}

/** Elements themed from the concept's own live CSS variables. */
function appearance(): Appearance {
  const read = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  };
  const ink = read('--ink', '#2B211C');
  return {
    theme: read('--scheme', 'light') === 'dark' ? 'night' : 'stripe',
    variables: {
      colorPrimary: read('--accent', '#7A2433'),
      colorBackground: read('--surface', '#F7F2EA'),
      colorText: ink,
      colorDanger: read('--accent', '#7A2433'),
      fontFamily: read('--font-body', 'system-ui, sans-serif'),
      borderRadius: read('--radius-field', '4px'),
      spacingUnit: '4px',
    },
  };
}

function PaymentForm({
  submitLabel,
  returnUrl,
  onSuccess,
  onError,
}: {
  submitLabel: string;
  returnUrl: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      // A card that needs no 3DS settles here; one that does redirects away.
      redirect: 'if_required',
    });
    if (error) {
      onError(error.message ?? 'That payment could not be completed.');
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <div className="checkout-stripe">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button type="button" className="btn btn-primary" disabled={!stripe || submitting} onClick={pay}>
        {submitting ? 'Processing…' : submitLabel}
      </button>
    </div>
  );
}

export function StripePanel({
  publishableKey,
  stripeAccount,
  clientSecret,
  submitLabel,
  returnUrl,
  onSuccess,
  onError,
}: {
  publishableKey: string;
  stripeAccount?: string;
  clientSecret: string;
  submitLabel: string;
  returnUrl: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}) {
  const stripePromise = useMemo(
    () => getStripe(publishableKey, stripeAccount),
    [publishableKey, stripeAccount],
  );

  /* Stripe.js is a third-party script and ad blockers eat it. Say so, rather
     than leaving an empty panel where the card form should be. */
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    stripePromise
      .then((s) => {
        if (!cancelled && !s) setBlocked(true);
      })
      .catch(() => {
        if (!cancelled) setBlocked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [stripePromise]);

  if (blocked) {
    return (
      <p className="checkout-error">
        The card form could not load. If you are using an ad blocker or a privacy extension, allow
        js.stripe.com and try again.
      </p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: appearance() }}>
      <PaymentForm
        submitLabel={submitLabel}
        returnUrl={returnUrl}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

export default StripePanel;
