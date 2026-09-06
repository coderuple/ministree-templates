import { defineMinistreeTemplate } from "@ministree/template-sdk";
import { site } from "./src/config/site";

/**
 * FLAME manifest — the "theme.json" of this template.
 *
 * Declares what flame supports (every public surface, a broad section set, both
 * colour schemes, header + footer nav), which CSS tokens churches can re-brand,
 * and the demo content defaults. Light is the baseline; dark is opt-in.
 */
export default defineMinistreeTemplate({
  meta: {
    name: "Flame",
    author: "Ministree",
    version: "1.0.0",
    description:
      "A clean, general-purpose multi-page church template: home, pages, sermons, events, blog, giving and forms — light + dark, fully driven by your church's own content.",
  },

  compatibility: {
    sdk: "^0.6.0",
    deploymentMode: "single",
    requiresModules: [],
  },

  // The capability declaration Ministree reads.
  supports: {
    surfaces: [
      "home",
      "page",
      "sermonArchive",
      "sermonDetail",
      "sermonSeries",
      "sermonSpeakers",
      "eventArchive",
      "eventDetail",
      "blogArchive",
      "blogDetail",
      "blogCategory",
      "giving",
      "form",
      "search",
      "notFound",
    ],
    sections: [
      "hero",
      "richText",
      "cta",
      "links",
      "features",
      "accordion",
      "location",
      "video",
      "audio",
      "imageGallery",
      "imageSection",
      "sermonsList",
      "eventsList",
      "givingCta",
      "givingMethods",
      "profileCards",
      "cardBox",
      "marquee",
      "schedule",
      "statement",
      "embed",
      "form",
      "columns",
      "carousel",
      "profileHeader",
      "groupsList",
      "teamsList",
      "sermonGroups",
    ],
    navigation: { header: true, footer: true },
    colorSchemes: ["light", "dark"],
    features: ["rss", "search", "locations", "team", "forms", "sitemap"],
  },

  // Structural tones stay flame's cinematic palette (warm "lit" light + ember dark);
  // only --ember/--flame map to the church brand.
  tokens: [
    { name: "--bg", type: "color", default: "#f4ece0", darkDefault: "#0c0805", label: "Background" },
    { name: "--surface", type: "color", default: "#ece2d2", darkDefault: "#161009", label: "Surface" },
    { name: "--line", type: "color", default: "#ddd0bd", darkDefault: "#2b2316", label: "Hairline" },
    { name: "--ink", type: "color", default: "#1d1510", darkDefault: "#f2e9d8", label: "Text" },
    {
      name: "--muted",
      type: "color",
      // Was #6f6253, which measured 3.54:1 on the page background — under the
      // 4.5:1 a body-sized secondary line needs. Darkened until it passes.
      default: "#5c5044",
      darkDefault: "#a2937c",
      label: "Muted text",
      description: "Dates, captions and secondary lines. Kept dark enough to stay readable.",
    },
    {
      name: "--ember",
      type: "color",
      default: "#c8521f",
      darkDefault: "#d9a441",
      // The brand colour the picker suggests. A suggestion: this default ships,
      // in both schemes, and a church opts in from the picker.
      maps: "--color-primary",
      label: "Backdrop — mid tone",
      description: "The middle colour of the moving backdrop, and the site's main accent. Pick your brand colour from the palette if you want it here.",
    },
    {
      name: "--flame",
      type: "color",
      default: "#e0922b",
      darkDefault: "#ff8a3c",
      maps: "--color-accent", // suggested — see --ember
      label: "Backdrop — brightest",
      description: "The brightest part of the moving backdrop. Pick your brand accent from the palette if you want it here.",
    },
    {
      name: "--crimson",
      type: "color",
      default: "#7a2516",
      darkDefault: "#571610",
      label: "Backdrop — deepest",
      description: "The darkest tone in the moving backdrop. Deliberately not tied to your brand: it is a shadow, and a bright brand colour here washes the whole effect out.",
    },
    {
      name: "--panel",
      type: "color",
      default: "#0c0805",
      darkDefault: "#161009",
      label: "Inverted panel",
      description: "Behind the home hero, calls to action and the giving confirmation.",
    },
    {
      name: "--panel-ink",
      type: "color",
      default: "#f2e9d8",
      darkDefault: "#f2e9d8",
      label: "Inverted panel text",
    },

    // Type + shape. Same override mechanism as the colours; the Customizer
    // renders these as text because they aren't colours.
    {
      name: "--font-display-face",
      type: "font",
      control: "fontFamily",
      default: "var(--font-anton)",
      label: "Display font",
      description: "Headlines and the wordmark.",
    },
    {
      name: "--font-serif-face",
      type: "font",
      control: "fontFamily",
      default: "var(--font-cormorant)",
      label: "Quote font",
      description: "Pull-quotes, the welcome passage and article body text.",
    },
    {
      name: "--font-sans-face",
      type: "font",
      control: "fontFamily",
      default: "var(--font-archivo)",
      label: "Body font",
      description: "Everything else — navigation, buttons, cards.",
    },
    {
      name: "--radius",
      type: "length",
      control: "cornerRadius",
      default: "1rem",
      label: "Corner rounding",
      description: "How round cards and panels are. Pill buttons keep their shape.",
    },
    {
      name: "--backdrop-scrim",
      type: "length",
      control: "opacity",
      default: "0.45",
      label: "Backdrop dimming",
      description:
        "How much the moving backdrop is dimmed behind text. Drag it left to show the backdrop at full strength, right to keep headings readable over it.",
    },
    {
      name: "--radius-button",
      type: "length",
      control: "cornerRadius",
      default: "9999px",
      label: "Button shape",
      description: "How round the buttons are. Separate from cards, because a square card often wants a pill button.",
    },
  ],

  /* Looks this template ships with. The defaults above are "Original"; each of
     these swaps the whole palette, the type and the corners in one click.
     Tokens only — a look never reaches a content field. A preset may name any
     face in `fonts` above, since those are compiled in; anything else has to be
     a system stack, because a preset still cannot load a font. */
  presets: [
    {
      id: "midnight",
      label: "Midnight",
      description: "Cool, deep blues. Reads as night in both schemes.",
      tokens: {
        "--bg": { light: "#0f141c", dark: "#05080d" },
        "--surface": { light: "#171f2b", dark: "#0b111a" },
        "--line": { light: "#26334a", dark: "#16202e" },
        "--ink": "#e6edf7",
        "--muted": { light: "#93a3bb", dark: "#8b9bb3" },
        "--ember": { light: "#4f8cff", dark: "#7cb0ff" },
        "--flame": { light: "#9ad0ff", dark: "#bde0ff" },
        "--crimson": { light: "#1f3a6b", dark: "#142a52" },
        "--panel": { light: "#05080d", dark: "#0b111a" },
        "--panel-ink": "#e6edf7",
        "--radius": "0.5rem",
        "--radius-button": "0.5rem",
        "--backdrop-scrim": "0.5",
      },
    },
    {
      id: "parchment",
      label: "Parchment",
      description: "Warm paper, serif type, square corners \u2014 editorial.",
      tokens: {
        "--bg": { light: "#fbf6ee", dark: "#1a1410" },
        "--surface": { light: "#f3ebdd", dark: "#241c15" },
        "--line": { light: "#e2d6c2", dark: "#3a2e22" },
        "--ink": { light: "#2a1f16", dark: "#f2e9d8" },
        "--muted": { light: "#6b5d4d", dark: "#a2937c" },
        "--ember": { light: "#8a3b12", dark: "#d9a441" },
        "--flame": { light: "#b8651f", dark: "#ff8a3c" },
        "--crimson": { light: "#5c1d10", dark: "#571610" },
        "--panel": { light: "#2a1f16", dark: "#1a1410" },
        "--panel-ink": "#f7efe2",
        /* Georgia was the compromise back when a preset could only name a
           system face. Playfair is the one this look was always after. */
        "--font-display-face": "var(--font-playfair), serif",
        "--font-serif-face": "var(--font-eb-garamond), serif",
        "--radius": "0.25rem",
        "--radius-button": "0.25rem",
        "--backdrop-scrim": "0.35",
      },
    },
    {
      id: "mono",
      label: "Mono",
      description: "Black, white and nothing else. Highest contrast.",
      tokens: {
        "--bg": { light: "#ffffff", dark: "#000000" },
        "--surface": { light: "#f2f2f2", dark: "#111111" },
        "--line": { light: "#d9d9d9", dark: "#2a2a2a" },
        "--ink": { light: "#000000", dark: "#ffffff" },
        "--muted": { light: "#5a5a5a", dark: "#a3a3a3" },
        /* Mid-greys, not black and white. The backdrop draws in these, and a
           white plume behind white display type ate whole letters — the type
           and the particles were the same colour. Grey reads as texture. */
        "--ember": { light: "#6b6b6b", dark: "#8f8f8f" },
        "--flame": { light: "#9a9a9a", dark: "#b5b5b5" },
        "--crimson": { light: "#3a3a3a", dark: "#4a4a4a" },
        "--panel": { light: "#000000", dark: "#111111" },
        "--panel-ink": "#ffffff",
        "--font-display-face": "Helvetica, Arial, sans-serif",
        "--radius": "0px",
        "--radius-button": "0px",
        // Highest contrast look, so the heaviest veil.
        "--backdrop-scrim": "0.6",
      },
    },
  ],

  /* The faces this template compiled in. next/font/google resolves at build
     time, so these are the only ones that can render — the Customizer's picker
     offers exactly them, and a church cannot pick a font that would silently
     fall back. `value` points at the variable layout.tsx defined; the bare
     family name would name a font nobody loaded. The three flame ships are
     listed too, or a church who switched away would have no way to name them
     again — "The template's own" is the token default, not a choice. */
  fonts: [
    { family: "Anton", value: "var(--font-anton), sans-serif" },
    { family: "Bebas Neue", value: "var(--font-bebas), sans-serif" },
    { family: "Playfair Display", value: "var(--font-playfair), serif" },
    { family: "Cormorant Garamond", value: "var(--font-cormorant), serif" },
    { family: "EB Garamond", value: "var(--font-eb-garamond), serif" },
    { family: "Archivo", value: "var(--font-archivo), sans-serif" },
    { family: "Inter", value: "var(--font-inter), sans-serif" },
    { family: "Manrope", value: "var(--font-manrope), sans-serif" },
  ],

  content: {
    defaults: site,
    // Only template-specific presentation copy is editable here. Church data
    // (name, service times, contact, socials) comes from Site Settings and is
    // read via the SDK — not duplicated in the Customizer.
    fields: {
      tagline: { kind: "text", label: "Tagline", help: "Shown in the hero, footer and marquee" },
      hero: {
        kind: "group",
        label: "Home hero",
        visibleWhen: { field: "siteMode", equals: "fullSite" },
        fields: {
          eyebrow: { kind: "text", label: "Eyebrow" },
          title: { kind: "text", label: "Headline", help: "Optional — defaults to your church name" },
          subtitle: { kind: "textarea", label: "Sub-line", help: "Optional — defaults to your tagline" },
          imageUrl: { kind: "media", label: "Background image", help: "Optional — sits behind the ember hero" },
          imageFocalPoint: {
            kind: "choice",
            control: "focalPoint",
            label: "Focus of the picture",
            help: "Which part to keep when the hero crops it on narrow screens.",
            optional: true,
          },
          primaryCta: {
            kind: "group",
            label: "Primary button",
            fields: {
              label: { kind: "text", label: "Label", width: "half" },
              variant: {
                kind: "select",
                label: "Style",
                width: "half",
                options: [
                  { value: "primary", label: "Primary (ember)" },
                  { value: "outline", label: "Outline" },
                  { value: "ghost", label: "Ghost" },
                ],
              },
              href: { kind: "link", label: "Link" },
            },
          },
          secondaryCta: {
            kind: "group",
            label: "Secondary button",
            fields: {
              label: { kind: "text", label: "Label", width: "half" },
              variant: {
                kind: "select",
                label: "Style",
                width: "half",
                options: [
                  { value: "primary", label: "Primary (ember)" },
                  { value: "outline", label: "Outline" },
                  { value: "ghost", label: "Ghost" },
                ],
              },
              href: { kind: "link", label: "Link", help: "Optional — defaults to your sermons page" },
            },
          },
        },
      },
      intro: {
        kind: "group",
        label: "Welcome section",
        visibleWhen: { field: "siteMode", equals: "fullSite" },
        fields: {
          heading: { kind: "text", label: "Heading" },
          body: { kind: "textarea", label: "Body" },
        },
      },
      // What this deploy is. A church running a conference or a one-off
      // gathering points the whole site at that event instead.
      siteMode: {
        kind: "select",
        label: "What is this site?",
        help: "A full church website, or a site for one event.",
        options: [
          { value: "fullSite", label: "Our church website" },
          { value: "singleEvent", label: "A site for one event" },
        ],
      },
      featuredEvent: {
        kind: "entity",
        module: "events",
        label: "Which event?",
        help: "Everything on the site comes from this event — its dates, venue, speakers, schedule and tickets.",
        visibleWhen: { field: "siteMode", equals: "singleEvent" },
      },

      /* Event-mode copy. Everything factual — dates, venue, speakers, schedule,
         tickets — comes from the event's own record; this group is only the
         words around it, so a church never types the same thing twice. Each
         one has a sensible default in EventSite, so an empty group still
         renders a complete site. */
      /* What is left after the running order became sections.
         Every heading, label and piece of copy now lives on the section it
         belongs to, edited where you can see it. Only two kinds of thing stay
         here: the page-level identity above the stack, and the handful of
         values no section prop can carry. */
      event: {
        kind: "group",
        label: "Event site",
        visibleWhen: { field: "siteMode", equals: "singleEvent" },
        /* Ordered as someone fills it in — who it is, what it looks like, how
           to get in — rather than grouped by data type. Widths are real inside
           a group now, so the short pairs sit on one row and every picker gets
           the full width its preview needs. */
        fields: {
          presenter: {
            kind: "text",
            label: "Presented by",
            optional: true,
            width: "half",
            help: "Defaults to your church name.",
          },
          tagline: {
            kind: "text",
            label: "Tagline",
            optional: true,
            width: "half",
            help: "The short line under the title.",
          },
          countdown: {
            kind: "boolean",
            label: "Countdown in the hero",
            help: "Counts down to the start time on the event you picked. It takes itself away once the event begins.",
          },
          backdropVideo: {
            /* `accept: "video"` gets the Customizer's video picker — upload with
               a progress bar, drag-and-drop, and the church's existing videos to
               choose from. Without it a `media` field is an image picker, which
               is why this was briefly a `url` text box asking a church to go and
               find a file's address by hand. Needs SDK >= 0.4.1. */
            kind: "media",
            accept: "video",
            label: "Backdrop video",
            optional: true,
            help: "A short, silent loop behind the whole page, in place of the event image. Keep it small \u2014 phones and anyone on a metered connection are shown the still instead.",
          },
          backdropPoster: {
            kind: "media",
            label: "Backdrop still",
            optional: true,
            help: "Shown before the loop starts, and in place of it for anyone on a phone or asking for less movement. Defaults to the event's own image.",
          },
          venueImages: {
            kind: "media",
            multiple: true,
            max: 2,
            label: "Venue \u2014 extra photos",
            optional: true,
            help: "The event's own image leads; these two sit beside it.",
          },
          flyerUrl: {
            kind: "media",
            label: "Shareable flyer",
            optional: true,
            help: "The picture people send to their friends. Defaults to the event's own image.",
          },
          ticketsCta: {
            kind: "text",
            label: "Tickets \u2014 button",
            optional: true,
            width: "half",
            help: "What the button says. Defaults to \u201cGet tickets\u201d.",
          },
          ticketsPhone: {
            kind: "text",
            label: "Tickets \u2014 info line",
            optional: true,
            width: "half",
            help: "A number to ring about tickets. Shown as a tap-to-call link.",
          },
          ticketPerks: {
            kind: "textarea",
            label: "Tickets \u2014 what's included",
            optional: true,
            help: "One per line. Listed above the ticket tiers.",
          },
          ticketsNote: {
            kind: "textarea",
            label: "Tickets \u2014 small print",
            optional: true,
            help: "Anything that has to be said under the tiers \u2014 age limits, refunds, door times.",
          },
          socialLinks: {
            kind: "repeatable",
            label: "Social links",
            help: "Leave empty to use the accounts on your church profile. Add rows when the event has its own \u2014 any platform, in the order you want them shown.",
            fields: {
              label: {
                kind: "text",
                label: "Which one",
                width: "half",
                help: "Instagram, TikTok, WhatsApp \u2014 whatever it is. This is the wording people see.",
              },
              href: {
                kind: "url",
                label: "Address",
                width: "half",
                help: "Paste the page's address. instagram.com/yourname is fine.",
              },
            },
          },
        },
      },

      eventSections: {
        kind: "sections",
        label: "Event page sections",
        help: "The running order of the event page. Wording is edited on each section. The lineup, schedule, venue and tickets fill themselves from the event you picked \u2014 change those in Events, not here.",
        visibleWhen: { field: "siteMode", equals: "singleEvent" },
      },

      // Home composition.
      homeSource: {
        kind: "select",
        label: "Home page",
        visibleWhen: { field: "siteMode", equals: "fullSite" },
        help: "Use flame's built-in home, or render one of your own pages instead.",
        options: [
          { value: "templateHome", label: "Template home (flame)" },
          { value: "ministreePage", label: "One of your pages" },
        ],
      },
      homePageSlug: {
        // Chosen from your pages, not typed. It was a text box asking for a
        // slug "(e.g. home, welcome)" — which is asking a church to remember an
        // address, and to know that addresses are what pages have.
        kind: "entity",
        module: "pages",
        label: "Which page?",
        help: "The page to show as your home page.",
        // Two conditions, not one: without the siteMode half this field stayed
        // behind in event mode whenever homeSource happened to be saved as
        // "ministreePage", stranded in a card whose every sibling was hidden.
        visibleWhen: [
          { field: "homeSource", equals: "ministreePage" },
          { field: "siteMode", equals: "fullSite" },
        ],
      },
      homeSections: {
        kind: "sections",
        label: "Home sections",
        help: "The composable stack below the hero on the template home. Reorder, add or remove.",
        visibleWhen: { field: "siteMode", equals: "fullSite" },
      },

      // Giving page (the native /give experience).
      giving: {
        kind: "group",
        label: "Giving page",
        fields: {
          layout: {
            kind: "select",
            label: "Layout",
            width: "half",
            options: [
              { value: "scroll", label: "Single scroll page" },
              { value: "wizard", label: "Stepped wizard" },
            ],
          },
          heading: { kind: "text", label: "Heading", width: "half" },
          lede: { kind: "textarea", label: "Intro" },
          showCampaigns: { kind: "boolean", label: "Show campaigns" },
          showOtherWays: { kind: "boolean", label: "Show other ways to give (WhatsApp / text)" },
          successMessage: { kind: "textarea", label: "Thank-you message", help: "Optional — overrides the church's default" },
        },
      },

      // Header + footer chrome.
      chrome: {
        kind: "group",
        label: "Header & footer",
        fields: {
          logoSize: {
            kind: "choice",
            control: "logoSize",
            label: "Logo size",
            help: "How tall your logo sits in the header.",
          },
          logoTextSize: {
            kind: "choice",
            control: "logoSize",
            label: "Church name size",
            help: "The text beside your logo in the header.",
            optional: true,
          },
          showGiveButton: { kind: "boolean", label: "Give button in the header" },
          stickyHeader: {
            kind: "boolean",
            label: "Header follows the page",
            help: "Off means it scrolls away with the rest of the page.",
          },
          footerWordmark: {
            kind: "boolean",
            label: "Big name in the footer",
            help: "The oversized outlined church name above the footer columns.",
          },
        },
      },

      // flame-specific cinematic primitives — toggled per church in the Customizer.
      // Omitted/undefined means ON (cinematic by default); set false to calm it down.
      effects: {
        kind: "group",
        label: "Cinematic effects",
        fields: {
          webglHero: {
            kind: "boolean",
            label: "Moving backdrop",
            help: "A drifting particle backdrop behind the hero. Falls back to a still image on phones, on reduced-motion, and where the browser cannot draw it.",
          },
          backdropElement: {
            kind: "select",
            label: "What it's made of",
            help: "All five cost the same to draw.",
            visibleWhen: { field: "webglHero", equals: true },
            options: [
              { value: "fire", label: "Fire" },
              { value: "smoke", label: "Smoke" },
              { value: "embers", label: "Embers" },
              { value: "dust", label: "Dust" },
              { value: "snow", label: "Snow" },
            ],
          },
          preloader: { kind: "boolean", label: "Intro preloader" },
          grain: { kind: "boolean", label: "Film grain + vignette" },
          cursor: { kind: "boolean", label: "Custom cursor" },
          magneticButtons: {
            kind: "boolean",
            label: "Magnetic buttons",
            help: "Buttons lean towards the pointer as it passes over them, then spring back. It needs a mouse, so a phone barely sees it either way.",
          },
          scrollReveals: { kind: "boolean", label: "Scroll-reveal animations" },
        },
      },
    },

    // Templates lay out their own Customizer form (tabs → groups → ordered fields).
    // Authored as arrays so order survives jsonb storage.
    layout: {
      tabs: [
        {
          id: "home",
          title: "Home",
          description: "Your home page — hero, welcome, and the composable stack beneath it.",
          groups: [
            { columns: 2, fields: ["siteMode", "featuredEvent"] },
            { title: "Event page", fields: ["eventSections", "event"] },
            { title: "Home source", columns: 2, fields: ["homeSource", "homePageSlug"] },
            { title: "Hero", fields: ["hero"] },
            { title: "Welcome", fields: ["intro"] },
            { title: "Sections", fields: ["homeSections"] },
          ],
        },
        {
          id: "giving",
          title: "Giving",
          description: "The native /give experience — funds, amounts, frequency, gift aid and card.",
          groups: [{ title: "Giving page", fields: ["giving"] }],
        },
        {
          id: "brand",
          title: "Brand",
          groups: [
            { title: "Tagline", fields: ["tagline"] },
            { title: "Header & footer", fields: ["chrome"] },
          ],
        },
        {
          id: "effects",
          title: "Effects",
          description: "flame's cinematic motion — toggle per church.",
          groups: [{ fields: ["effects"] }],
        },
      ],
    },
  },

  data: [
    { source: "siteSettings", as: "church", description: "Identity, nav, footer, palette" },
    { source: "giving", as: "give", description: "Giving destination" },
  ],
});
