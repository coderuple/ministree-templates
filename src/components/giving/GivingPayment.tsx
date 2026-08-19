"use client";

import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getStripe, stripeAppearance } from "@/lib/giving";

/** The Stripe card form (inside an Elements context). Charges client-side. */
function PaymentForm({
  amountLabel,
  returnUrl,
  onSuccess,
}: {
  amountLabel: string;
  returnUrl: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (err) {
      setError(err.message ?? "Payment could not be completed.");
      setSubmitting(false);
      return;
    }
    // No redirect needed (card succeeded inline). 3DS cards redirect to returnUrl.
    onSuccess();
  };

  return (
    <div className="space-y-5">
      <PaymentElement />
      {error ? <p className="text-sm text-[var(--flame)]">{error}</p> : null}
      <button
        type="button"
        data-cursor
        disabled={!stripe || submitting}
        onClick={pay}
        className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-ember px-8 py-4 text-xs uppercase tracking-[0.25em] text-bg transition-colors duration-500 disabled:opacity-60"
      >
        <span className="absolute inset-0 origin-center scale-0 rounded-full bg-flame transition-transform duration-500 ease-out group-hover:scale-150" />
        <span className="relative z-10">{submitting ? "Processing…" : `Give ${amountLabel}`}</span>
      </button>
    </div>
  );
}

/** Wraps the card form in a Stripe Elements context themed to flame. */
export default function GivingPayment({
  pubKey,
  clientSecret,
  amountLabel,
  returnUrl,
  onSuccess,
}: {
  pubKey: string;
  clientSecret: string;
  amountLabel: string;
  returnUrl: string;
  onSuccess: () => void;
}) {
  return (
    <Elements stripe={getStripe(pubKey)} options={{ clientSecret, appearance: stripeAppearance() }}>
      <PaymentForm amountLabel={amountLabel} returnUrl={returnUrl} onSuccess={onSuccess} />
    </Elements>
  );
}
