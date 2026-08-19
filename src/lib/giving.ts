import { loadStripe, type Stripe, type Appearance } from "@stripe/stripe-js";

/**
 * flame's giving helpers — money formatting, a cached Stripe loader, a Stripe
 * Elements appearance mapped to flame's tokens, and Paystack inline handoff.
 * The donation itself is created via the SDK `submitDonation()`; this file only
 * deals with the client-side payment handoff.
 */

/** Format an amount in the org currency (whole numbers when integral). */
export function formatMoney(amount: number, currency = "GBP"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/** The currency glyph alone (for big-number amount inputs). */
export function currencyGlyph(currency = "GBP"): string {
  try {
    const part = new Intl.NumberFormat(undefined, { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? "";
  } catch {
    return "";
  }
}

// `loadStripe` must be called once per publishable key — cache the promise.
const stripeCache = new Map<string, Promise<Stripe | null>>();
export function getStripe(pubKey: string): Promise<Stripe | null> {
  let p = stripeCache.get(pubKey);
  if (!p) {
    p = loadStripe(pubKey);
    stripeCache.set(pubKey, p);
  }
  return p;
}

/** Stripe Elements appearance, themed from flame's live CSS tokens (dark payment panel). */
export function stripeAppearance(): Appearance {
  const cssVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    theme: "night",
    variables: {
      colorPrimary: cssVar("--ember", "#d9a441"),
      /* Themed from the PANEL, not the page. The card form sits inside the
         inverted giving panel, and Stripe is in its `night` theme — pairing that
         with the page's --surface meant light-parchment inputs on a near-black
         panel whenever the church was in the light scheme. */
      colorBackground: cssVar("--panel", "#161009"),
      colorText: cssVar("--panel-ink", "#f2e9d8"),
      colorTextSecondary: cssVar("--muted", "#8d7f68"),
      colorDanger: cssVar("--crimson", "#ff8a3c"),
      fontFamily: "var(--font-archivo), system-ui, sans-serif",
      borderRadius: "10px",
      spacingUnit: "4px",
    },
  };
}

// ── Paystack inline (loaded on demand; no npm dependency) ────────────────────
type PaystackPopCtor = new () => {
  resumeTransaction: (
    accessCode: string,
    handlers?: { onSuccess?: () => void; onCancel?: () => void; onError?: (e: unknown) => void },
  ) => void;
};

let paystackPromise: Promise<void> | null = null;
function loadPaystack(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { PaystackPop?: unknown }).PaystackPop) return Promise.resolve();
  if (!paystackPromise) {
    paystackPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.paystack.co/v2/inline.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Could not load Paystack"));
      document.head.appendChild(s);
    });
  }
  return paystackPromise;
}

/** Open the Paystack inline modal for an already-created transaction. */
export async function openPaystackInline(opts: {
  accessCode: string;
  onSuccess: () => void;
  onCancel?: () => void;
  onError?: (e: unknown) => void;
}): Promise<void> {
  await loadPaystack();
  const PaystackPop = (window as unknown as { PaystackPop?: PaystackPopCtor }).PaystackPop;
  if (!PaystackPop) throw new Error("Paystack unavailable");
  const popup = new PaystackPop();
  popup.resumeTransaction(opts.accessCode, {
    onSuccess: opts.onSuccess,
    onCancel: opts.onCancel,
    onError: opts.onError,
  });
}
