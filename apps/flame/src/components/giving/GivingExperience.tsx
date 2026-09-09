"use client";

import { useMemo, useState } from "react";
import {
  submitDonation,
  type DonationInput,
  type DonateResponse,
  type GivingFrequency,
  type MinistreeGiving,
} from "@ministree/template-sdk";
import { currencyGlyph, formatMoney, openPaystackInline } from "@/lib/giving";
import GivingPayment from "./GivingPayment";
import GivingSuccess from "./GivingSuccess";
import AnimatedText from "@/components/AnimatedText";
import { Container } from "@/components/ui";

export type GivingContent = {
  layout?: "scroll" | "wizard";
  heading?: string;
  lede?: string;
  showCampaigns?: boolean;
  showOtherWays?: boolean;
  successMessage?: string;
};

const FREQ_LABELS: Record<string, string> = {
  "one-time": "One time",
  weekly: "Weekly",
  biweekly: "Fortnightly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annually: "Yearly",
};

const todayISODate = () => new Date().toISOString().slice(0, 10);

/** Replace {{token}} placeholders in the thank-you message; drop unknown tokens, tidy spacing. */
function interpolate(tpl: string, vars: Record<string, string | undefined>): string {
  return tpl
    .replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => {
      const v = vars[key];
      return v == null ? "" : String(v);
    })
    .replace(/\s+([.!?,;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ─── Presentational atoms ─────────────────────────────────────────────── */

function StepHead({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-display text-sm text-ember">{index}</span>
      <span className="micro text-muted">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="micro text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-surface/50 px-4 py-3 text-ink outline-none transition-colors focus:border-ember";

/* ─── Main experience ──────────────────────────────────────────────────── */

/** Mirrors PEOPLE_OPT_IN_CONSENT in Ministree's contracts — the fixed line
 *  that makes the tick valid consent, so it is not editable here. */
const PEOPLE_OPT_IN_CONSENT =
  "By ticking, you join our membership list. We'll keep your details safe and keep in touch about church life and events. You can leave at any time.";

export default function GivingExperience({
  giving,
  content,
  optInInvite,
}: {
  giving: MinistreeGiving;
  content: GivingContent;
  /** The church's stay-in-touch invitation (resolved by the API with their name). */
  optInInvite?: string | null;
}) {
  const currency = giving.defaultCurrency ?? "GBP";
  const glyph = currencyGlyph(currency);
  const funds = giving.funds ?? [];
  const config = giving.defaultForm?.config ?? {};
  const presets = config.presetAmounts?.length ? config.presetAmounts : [25, 50, 100, 250];
  const frequencies = (config.frequencies?.length ? config.frequencies : (["one-time", "monthly"] as GivingFrequency[])) as GivingFrequency[];
  const allowMulti = Boolean(config.allowMultipleFunds && giving.multipleGivingEnabled);
  const giftAidEnabled = Boolean(giving.giftAidEnabled);
  const onlineEnabled =
    giving.onlineGivingEnabled !== false && (giving.stripeEnabled || giving.paystackEnabled);
  const layout = content.layout === "wizard" ? "wizard" : "scroll";

  const defaultFundId = config.defaultFundId ?? funds.find((f) => f.isDefault)?.id ?? funds[0]?.id;

  // ── State ──
  const [amounts, setAmounts] = useState<Record<string, number>>(() =>
    defaultFundId ? { [defaultFundId]: 0 } : {},
  );
  const [activeFund, setActiveFund] = useState<string | undefined>(defaultFundId);
  const [frequency, setFrequency] = useState<GivingFrequency>(config.defaultFrequency ?? frequencies[0] ?? "one-time");
  const [startDate, setStartDate] = useState(todayISODate());
  const [endDate, setEndDate] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [giftAidOn, setGiftAidOn] = useState(false);
  const [ga, setGa] = useState({ title: "", firstName: "", lastName: "", address: "", postcode: "" });
  const [campaignByFund, setCampaignByFund] = useState<Record<string, string>>({});

  const [phase, setPhase] = useState<"select" | "pay" | "success">(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1") {
      return "success";
    }
    return "select";
  });
  const [resp, setResp] = useState<DonateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0); // wizard

  const total = Object.values(amounts).reduce((s, n) => s + (n || 0), 0);
  const amountLabel = formatMoney(total, currency);
  const requiresEmail = frequency !== "one-time" || saveCard;
  const isRecurring = frequency !== "one-time";

  const setFundAmount = (fundId: string, amount: number) =>
    setAmounts((prev) => (allowMulti ? { ...prev, [fundId]: amount } : { [fundId]: amount }));

  const toggleFund = (fundId: string) => {
    setActiveFund(fundId);
    setAmounts((prev) => {
      if (allowMulti) {
        if (fundId in prev) {
          const next = { ...prev };
          delete next[fundId];
          return next;
        }
        return { ...prev, [fundId]: 0 };
      }
      return { [fundId]: prev[activeFund ?? ""] ?? 0 };
    });
  };

  function validate(): string | null {
    if (total <= 0) return "Enter an amount to give.";
    if (config.minAmount && total < config.minAmount) return `Minimum gift is ${formatMoney(config.minAmount, currency)}.`;
    if (config.maxAmount && total > config.maxAmount) return `Maximum gift is ${formatMoney(config.maxAmount, currency)}.`;
    if (requiresEmail && !donorEmail.trim()) return "An email is required for recurring or saved-card gifts.";
    if (giftAidOn && (!ga.firstName.trim() || !ga.lastName.trim() || !ga.address.trim() || !ga.postcode.trim()))
      return "Complete your Gift Aid name, address and postcode.";
    return null;
  }

  async function donate() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setBusy(true);
    const origin = window.location.origin;
    const fundAllocations = Object.entries(amounts)
      .filter(([, amt]) => amt > 0)
      .map(([fundId, amount]) => ({
        fundId,
        amount,
        ...(campaignByFund[fundId] ? { campaignId: campaignByFund[fundId] } : {}),
      }));
    const payload: DonationInput = {
      fundAllocations,
      frequency,
      ...(isRecurring
        ? {
            startDate: new Date(startDate).toISOString(),
            ...(endDate ? { endDate: new Date(endDate).toISOString() } : {}),
          }
        : {}),
      donorName: donorName.trim() || undefined,
      donorEmail: donorEmail.trim() || undefined,
      isAnonymous,
      saveCard,
      // Only meaningful with an email to hold and a named giver.
      ...(optIn && donorEmail.trim() && !isAnonymous ? { marketingOptIn: true } : {}),
      paymentReturnUrl: `${origin}/give?success=1`,
      ...(giftAidOn
        ? {
            giftAid: {
              declarationAccepted: true,
              type: isRecurring ? "ongoing" : "one-time",
              donorTitle: ga.title.trim() || undefined,
              donorFirstName: ga.firstName.trim(),
              donorLastName: ga.lastName.trim(),
              donorAddress: ga.address.trim(),
              donorPostcode: ga.postcode.trim(),
            },
          }
        : {}),
    };

    try {
      const r = await submitDonation(payload);
      setResp(r);
      if (r.requiresAction === "redirect" && (r.redirectUrl || r.checkoutUrl)) {
        window.location.assign((r.redirectUrl || r.checkoutUrl) as string);
        return;
      }
      if (r.requiresAction === "paystack_inline" && r.paystackInline) {
        await openPaystackInline({
          accessCode: r.paystackInline.accessCode,
          onSuccess: () => setPhase("success"),
          onCancel: () => setBusy(false),
          onError: () => {
            setError("Payment was not completed.");
            setBusy(false);
          },
        });
        return;
      }
      if (r.clientSecret && r.stripePublishableKey) {
        setPhase("pay");
        setBusy(false);
        return;
      }
      setError("Online giving isn't available right now — please use another method below.");
      setBusy(false);
    } catch (e) {
      setError((e as Error).message || "Could not start the donation.");
      setBusy(false);
    }
  }

  const pickCampaign = (c: { id: string; fundId?: string | null }) => {
    const fundId = c.fundId || defaultFundId;
    if (!fundId) return;
    setActiveFund(fundId);
    setAmounts((prev) => (allowMulti ? { ...prev, [fundId]: prev[fundId] ?? 0 } : { [fundId]: prev[activeFund ?? ""] ?? 0 }));
    setCampaignByFund((prev) => ({ ...prev, [fundId]: c.id }));
    if (typeof document !== "undefined") document.getElementById("give-funds")?.scrollIntoView({ behavior: "smooth" });
  };

  /* ── Step renderers (shared by both layouts) ── */

  const renderCampaigns = () => {
    const campaigns = giving.campaigns ?? [];
    if (content.showCampaigns === false || campaigns.length === 0) return null;
    return (
      <div className="mb-14">
        <StepHead index="★" label="Campaigns" />
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => {
            const goal = typeof c.goalAmount === "number" ? c.goalAmount : 0;
            const raised = typeof c.currentAmount === "number" ? c.currentAmount : 0;
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
            const active = c.fundId ? campaignByFund[c.fundId] === c.id : false;
            return (
              <div key={c.id} className={`rounded-lg border p-5 ${active ? "border-ember bg-surface" : "border-line bg-surface/40"}`}>
                <p className="font-display text-xl uppercase tracking-tight">{c.name}</p>
                {c.description ? <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p> : null}
                {goal > 0 ? (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ember" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="micro mt-2 text-muted">
                      {formatMoney(raised, currency)} of {formatMoney(goal, currency)} · {pct}%
                    </p>
                  </div>
                ) : null}
                <button type="button" data-cursor onClick={() => pickCampaign(c)} className="micro mt-4 text-ember hover:text-flame">
                  Give to this →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFunds = () => (
    <div id="give-funds">
      <StepHead index="01" label={allowMulti ? "Choose funds" : "Choose a fund"} />
      {funds.length === 0 ? (
        <p className="text-muted">No funds are set up yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {funds.map((f) => {
            const selected = f.id in amounts;
            const goal = typeof f.goalAmount === "number" ? f.goalAmount : 0;
            const raised = typeof f.currentAmount === "number" ? f.currentAmount : 0;
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
            return (
              <button
                key={f.id}
                type="button"
                data-cursor
                onClick={() => toggleFund(f.id)}
                className={`group rounded-lg border p-5 text-left transition-colors ${
                  selected ? "border-ember bg-surface" : "border-line bg-surface/40 hover:border-ember/50"
                }`}
              >
                <p className="font-display text-2xl uppercase tracking-tight">{f.name}</p>
                {f.description ? <p className="mt-1 text-sm text-muted">{f.description}</p> : null}
                {goal > 0 ? (
                  <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ember" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="micro mt-2 text-muted">
                      {formatMoney(raised, currency)} of {formatMoney(goal, currency)}
                    </p>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAmount = () => {
    const fundId = allowMulti ? activeFund : Object.keys(amounts)[0];
    const current = fundId ? amounts[fundId] ?? 0 : 0;
    return (
      <div>
        <StepHead index="02" label="Amount" />
        <div className="flex flex-wrap gap-3">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              data-cursor
              onClick={() => fundId && setFundAmount(fundId, p)}
              className={`rounded-full border px-6 py-3 font-display text-lg transition-colors ${
                current === p ? "border-ember bg-ember text-bg" : "border-line text-ink hover:border-ember"
              }`}
            >
              {glyph}
              {p}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-display text-4xl text-ember">{glyph}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={current || ""}
            placeholder="0"
            onChange={(e) => fundId && setFundAmount(fundId, Number(e.target.value) || 0)}
            className="w-48 border-b border-line bg-transparent pb-1 font-display text-5xl text-ink outline-none focus:border-ember"
          />
        </div>
        {allowMulti && total > 0 ? <p className="micro mt-4 text-muted">Total: {amountLabel}</p> : null}
      </div>
    );
  };

  const renderFrequency = () => (
    <div>
      <StepHead index="03" label="How often" />
      <div className="flex flex-wrap gap-3">
        {frequencies.map((fr) => (
          <button
            key={fr}
            type="button"
            data-cursor
            onClick={() => setFrequency(fr)}
            className={`rounded-full border px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${
              frequency === fr ? "border-ember bg-ember text-bg" : "border-line text-ink hover:border-ember"
            }`}
          >
            {FREQ_LABELS[fr] ?? fr}
          </button>
        ))}
      </div>
      {isRecurring ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Starts">
            <input type="date" min={todayISODate()} value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ends (optional)">
            <input type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </Field>
        </div>
      ) : null}
    </div>
  );

  const renderDetails = () => (
    <div>
      <StepHead index="04" label="Your details" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input value={donorName} onChange={(e) => setDonorName(e.target.value)} className={inputClass} placeholder="Your name" />
        </Field>
        <Field label={requiresEmail ? "Email (required)" : "Email (for your receipt)"}>
          <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} className={inputClass} placeholder="you@email.com" />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} />
          Save my card for next time
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
          Give anonymously
        </label>
      </div>
      {!isAnonymous ? (
        <label className="mt-5 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 accent-ember"
            checked={optIn}
            disabled={!donorEmail.trim()}
            onChange={(e) => setOptIn(e.target.checked)}
          />
          <span className="leading-snug">
            <span className="block font-medium text-ink">
              {optInInvite?.trim() || "Would you like to stay connected with us?"}
            </span>
            <span className="block text-muted">
              {donorEmail.trim() ? PEOPLE_OPT_IN_CONSENT : "Add your email above first."}
            </span>
          </span>
        </label>
      ) : null}
    </div>
  );

  const renderGiftAid = () =>
    giftAidEnabled ? (
      <div>
        <StepHead index="05" label="Gift Aid" />
        <label className="flex items-start gap-3 rounded-lg border border-line bg-surface/40 p-5">
          <input type="checkbox" className="mt-1" checked={giftAidOn} onChange={(e) => setGiftAidOn(e.target.checked)} />
          <span className="text-sm text-muted">
            <span className="font-display text-base uppercase tracking-tight text-ink">Boost your gift by 25%</span>
            <br />
            I am a UK taxpayer and want to Gift Aid this and future gifts to {giving.orgName ?? "this church"}.
          </span>
        </label>
        {giftAidOn ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Title (optional)">
              <input value={ga.title} onChange={(e) => setGa({ ...ga, title: e.target.value })} className={inputClass} />
            </Field>
            <span className="hidden sm:block" />
            <Field label="First name">
              <input value={ga.firstName} onChange={(e) => setGa({ ...ga, firstName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Last name">
              <input value={ga.lastName} onChange={(e) => setGa({ ...ga, lastName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Home address">
              <input value={ga.address} onChange={(e) => setGa({ ...ga, address: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Postcode">
              <input value={ga.postcode} onChange={(e) => setGa({ ...ga, postcode: e.target.value })} className={inputClass} />
            </Field>
          </div>
        ) : null}
      </div>
    ) : null;

  const otherWays = () =>
    content.showOtherWays !== false && (giving.whatsappGiveUrl || giving.textToGiveUrl) ? (
      <div className="mt-12 flex flex-wrap gap-3">
        {giving.whatsappGiveUrl ? (
          <a href={giving.whatsappGiveUrl} target="_blank" rel="noopener noreferrer" data-cursor className="rounded-full border border-line px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-ember hover:text-ember">
            Give on WhatsApp
          </a>
        ) : null}
        {giving.textToGiveUrl ? (
          <a href={giving.textToGiveUrl} target="_blank" rel="noopener noreferrer" data-cursor className="rounded-full border border-line px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-ember hover:text-ember">
            Text to give
          </a>
        ) : null}
      </div>
    ) : null;

  /* ── Payment + success phases ── */

  if (phase === "success") {
    const fundName = funds.find((f) => f.id in amounts)?.name;
    const rawMsg = content.successMessage || giving.thankYouMessage || "Your gift fuels the mission — here and beyond.";
    const message = interpolate(rawMsg, {
      orgName: giving.orgName,
      amount: total > 0 ? amountLabel : undefined,
      donorName: donorName.trim() || undefined,
      fundName,
      frequency: FREQ_LABELS[frequency],
      currency,
    });
    return (
      <Container className="py-24">
        <GivingSuccess message={message} amountLabel={total > 0 ? amountLabel : undefined} />
      </Container>
    );
  }

  if (phase === "pay" && resp?.clientSecret && resp.stripePublishableKey) {
    return (
      <Container size="narrow" className="py-24">
        <div className="relative overflow-hidden rounded-flame border border-line bg-panel p-8 text-panel-ink">
          <p className="micro text-ember">Almost there</p>
          <h2 className="font-display mt-2 text-3xl uppercase tracking-tight">Complete your gift</h2>
          <p className="font-serif mt-2 text-lg italic text-panel-ink/70">{amountLabel} {isRecurring ? `· ${FREQ_LABELS[frequency]}` : ""}</p>
          <div className="mt-8">
            <GivingPayment
              pubKey={resp.stripePublishableKey}
              clientSecret={resp.clientSecret}
              amountLabel={amountLabel}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/give?success=1`}
              onSuccess={() => setPhase("success")}
            />
          </div>
          <button type="button" onClick={() => setPhase("select")} className="micro mt-6 text-muted hover:text-ember">
            ← Back
          </button>
        </div>
      </Container>
    );
  }

  /* ── Selection phase ── */

  const steps = [renderFunds, renderAmount, renderFrequency, renderDetails, ...(giftAidEnabled ? [renderGiftAid] : [])];

  const ContinueBar = (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="font-display text-2xl">
        {total > 0 ? amountLabel : `${glyph}0`}
        {isRecurring ? <span className="micro ml-2 text-muted">{FREQ_LABELS[frequency]}</span> : null}
      </p>
      <button
        type="button"
        data-cursor
        disabled={busy}
        onClick={donate}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-ember px-8 py-4 text-xs uppercase tracking-[0.25em] text-bg transition-colors duration-500 disabled:opacity-60"
      >
        <span className="absolute inset-0 origin-center scale-0 rounded-full bg-flame transition-transform duration-500 ease-out group-hover:scale-150" />
        <span className="relative z-10">{busy ? "Starting…" : "Continue to payment"}</span>
      </button>
    </div>
  );

  if (!onlineEnabled) {
    return (
      <Container className="py-24">
        <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-tight sm:text-7xl">{content.heading || "Give"}</h1>
        <p className="font-serif mt-5 max-w-xl text-xl italic text-muted">
          Online giving isn&apos;t enabled yet — here are other ways to give.
        </p>
        {otherWays()}
      </Container>
    );
  }

  return (
    <Container className="py-20 sm:py-28">
      <header className="mb-14 max-w-2xl">
        <AnimatedText as="h1" className="font-display text-6xl uppercase leading-[0.9] tracking-tight sm:text-7xl">
          {content.heading || "Give"}
        </AnimatedText>
        {content.lede ? <p className="font-serif mt-5 text-xl italic text-muted">{content.lede}</p> : null}
      </header>

      {renderCampaigns()}

      {error ? <p className="mb-6 rounded-md border border-[var(--flame)]/40 bg-[var(--flame)]/5 px-4 py-3 text-sm text-[var(--flame)]">{error}</p> : null}

      {layout === "wizard" ? (
        <div className="max-w-2xl">
          <div className="mb-8 flex gap-2">
            {steps.map((_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ember" : "bg-line"}`} />
            ))}
          </div>
          <div className="min-h-[18rem]">{steps[step]?.()}</div>
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="micro text-muted hover:text-ember disabled:opacity-40">
              ← Back
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                data-cursor
                onClick={() => setStep((s) => s + 1)}
                className="rounded-full bg-ember px-7 py-3 text-xs uppercase tracking-[0.25em] text-bg transition-colors hover:bg-flame"
              >
                Next
              </button>
            ) : (
              ContinueBar
            )}
          </div>
          {otherWays()}
        </div>
      ) : (
        <div className="max-w-2xl space-y-16">
          {steps.map((render, i) => (
            <section key={i}>{render()}</section>
          ))}
          {ContinueBar}
          {otherWays()}
        </div>
      )}
    </Container>
  );
}
