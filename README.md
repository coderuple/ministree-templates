# ministree-templates

Four Ministree website templates, each a separately deployable Next.js app that
reads a church's content from Ministree and renders it with its own design.

| App | Port | What it is |
| --- | --- | --- |
| `apps/alabaster` | 3101 | **The Ember.** Ivory and crimson, Cormorant Garamond. Serene and editorial. |
| `apps/ivory` | 3102 | **Unstoppable.** Bone, ink and crimson, Bodoni Moda. A fashion title's March issue. |
| `apps/fire` | 3103 | **Carried by the Wind.** Smoke warming to gold, Instrument Serif. One unbroken composition. |
| `apps/flame` | 3000 | A general-purpose multi-page church site. Moved in from its own repo, history intact. |

The three conference templates are **single-event** templates: the whole site is
one event, read from the church's own Events module. They ship with Uncommon
Woman Conference 2027 as demo content, so each one looks finished before anyone
connects it.

```bash
pnpm install
pnpm dev            # all four
pnpm --filter fire dev
pnpm build
pnpm --filter @ministree-templates/event-kit test
```

## Connecting one to a church

Two environment variables, per deploy:

```bash
NEXT_PUBLIC_MINISTREE_API_URL=https://api.ministr.ee
NEXT_PUBLIC_ORG_SLUG=your-church
```

With neither set, every data call returns null and the manifest defaults render
— so a template builds, runs and demos with no Ministree at all.

Then in the church's admin: **Templates → Connect your template**, paste the
deployed URL. Ministree reads `/ministree-manifest` and builds a Customizer from
it. That first connection is what mints the template id:

```bash
NEXT_PUBLIC_MINISTREE_TEMPLATE_ID=...   # add it, redeploy, edits start flowing
```

Validate a manifest before deploying:

```bash
cd apps/alabaster && ./node_modules/.bin/ministree-template validate .
```

Local development against a local API needs `ALLOW_PRIVATE_WEBHOOK_TARGETS=true`
in **the API's** environment — the connect flow refuses http and private
addresses otherwise. Never set it in production.

## Tickets

People buy without leaving the site. `/tickets` posts to Ministree's public
order API and handles the payment inline: Stripe's card element, Paystack's
modal, PayPal's redirect, bank transfer and USSD details, or nothing at all when
the order is free.

Confirmation is webhook-driven server-side, so the page polls rather than
deciding for itself.

**If a church turns on PayPal**, that path sends a `paymentReturnUrl`, and the
API checks it against an origin allowlist. Add the deploy's origin to
`PAYMENT_RETURN_ALLOWED_ORIGINS` (or `CORS_ORIGINS`) on the API, or those orders
come back `400 Payment return URL is not allowed`. Card payments need nothing:
Stripe's 3DS return URL is built client-side.

Reserved-seating tickets are listed but not sold here — seat selection needs a
seat map these designs do not have.

## Layout

```
vendor/                 the template SDK, as a versioned tarball
packages/event-kit/     the only shared package
apps/*/
  ministree.config.ts   what a church can edit
  src/config/site.ts    the demo conference + first-run defaults
  src/app/globals.css   the concept, in full
  src/components/       its own sections
```

`packages/event-kit` holds the Ministree bridge, the event view-model, the
scroll engine, checkout and the formatters. It deliberately renders **no**
headings, sections or grids — only the checkout and a media frame — so the three
designs cannot drift toward each other through it.

Each concept owns its own stylesheet. There is no Tailwind in the three
conference apps: their type and motion are one-off fluid values
(`clamp(34px, 11.2cqi, 176px)`, `scale(calc(0.022 + var(--p) * 0.95))`) with
almost no repeated value, so a utility class per one-off would be longer than the
property it stands for. Flame keeps Tailwind — it is a design system, and Tailwind
suits it.

### The scroll engine

One client component writes CSS custom properties on every animation frame and
nothing else:

| Property | Where | What |
| --- | --- | --- |
| `--p` | each `[data-track]` | 0→1 through that section (`pin`, `cover` or `enter`) |
| `--pg` | the frame | 0→1 through the whole page |
| `--o` | each `[data-stage]` | that stage's crossfade opacity |
| `--s0…N` | the stages' host | the same values, for siblings to read |
| `--chrome` / `--navh` | the frame | measured sticky-header heights |
| `--len` | the frame | an SVG path's length, for a draw-on-scroll |
| `data-seen` | each `[data-reveal]` | set once, on entry |

No React state, so nothing re-renders while you scroll, and every page stays a
server component. What any of it *looks* like is each concept's stylesheet.

The 760px breakpoint is a container query, not JavaScript — the page frame is
`container-type: inline-size`, so the layout reflows against the frame and the
right one paints on the first frame rather than after hydration.

### Reduced motion

`prefers-reduced-motion: reduce` renders reveals at rest, stops the ambient
drifts and never starts the ember canvas — but the scroll mapping still runs, so
the page stays complete and readable. It is a stylesheet rule as well as a JS
check, so it holds before the engine hydrates.

## Updating the SDK

Drop the new tarball into `vendor/` and point the four `package.json` files at
it. The version is in the filename, so the specifier changes and pnpm
re-resolves.

## Known issue

Card payments on a **Stripe Connect** deployment need the API-side fix on
`fix/events-stripe-connect-account` in the ministree repo — the events adapter
dropped `stripeAccount`, so `confirmPayment` answered "No such payment_intent".
Direct Stripe accounts were never affected.
# ministree-templates
