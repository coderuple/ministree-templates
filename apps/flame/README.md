# Flame — a Ministree website template

A cinematic church website that reads everything from Ministree: sermons, events,
blog posts, giving, forms, navigation and branding. Deploy it once for a church,
connect it in the Ministree admin, and the church edits the whole site from there.

Next.js 16 (App Router) · Tailwind CSS v4 · three.js / React Three Fiber · GSAP · Lenis · Stripe.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

With no Ministree connection Flame renders its own demo content, so it looks
finished before a church is attached.

## Connect a church

```bash
# .env.local
NEXT_PUBLIC_MINISTREE_API_URL=https://api.example.church   # the church's Ministree API
NEXT_PUBLIC_ORG_SLUG=grace-community                       # which church this deploy serves
NEXT_PUBLIC_MINISTREE_TEMPLATE_ID=                         # added after connecting (see below)
```

Publish the site, then paste its address into **Templates** in the Ministree
admin. Ministree reads `/ministree-manifest`, and the church gets a Customizer
built from the fields this template declares. The template id only exists after
that first connection — add it, redeploy, and the Customizer's edits start
flowing through.

## Where to edit things

| What | Where |
| --- | --- |
| **What a church can customize** | `ministree.config.ts` — `content.fields` (the form) and `layout.tabs` (how it's grouped) |
| **Colours** | `ministree.config.ts` `tokens[]`, with the defaults mirrored in `src/app/globals.css` |
| **Demo content** (used when no church is connected) | `src/config/site.ts` |
| **CMS section rendering** | `src/sections/index.tsx` — one component per Ministree section type |
| **Reading Ministree data** | `src/lib/ministree.ts` — cached per-request loaders |
| **The WebGL flame** | `src/components/canvas/EmberScene.tsx` |

## How theming works

`tokens[]` in the manifest declares each CSS custom property with a light and a
dark value. A token with `maps` adopts the church's own brand colour; the rest
keep Flame's palette unless the church overrides them in the Customizer.

Ministree returns the resolved CSS, `src/app/layout.tsx` injects it, and
everything downstream — Tailwind utilities, the WebGL flame, even the Stripe
card form — reads the same variables. One change in the admin recolours all of it.

## Effects

`webglHero`, `preloader`, `grain`, `cursor`, `magneticButtons` and `scrollReveals` are per-church
switches under the Customizer's **Effects** tab. Undefined means on. All of them
respect `prefers-reduced-motion`, and the WebGL hero additionally requires a
WebGL context and a screen wider than 768px before it loads.
