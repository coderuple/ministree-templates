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
    sdk: "^0.4.0",
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
    { name: "--muted", type: "color", default: "#6f6253", darkDefault: "#8d7f68", label: "Muted text" },
    {
      name: "--ember",
      type: "color",
      default: "#c8521f",
      darkDefault: "#d9a441",
      maps: "--color-primary",
      label: "Backdrop — mid tone",
      description: "The middle colour of the moving backdrop, and the site's main accent. Follows your brand colour unless you change it.",
    },
    {
      name: "--flame",
      type: "color",
      default: "#e0922b",
      darkDefault: "#ff8a3c",
      maps: "--color-accent",
      label: "Backdrop — brightest",
      description: "The hottest part of the moving backdrop, and the accent used across the site. Follows your brand accent unless you change it.",
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
        fields: {
          presenter: { kind: "text", label: "Presented by", optional: true, help: "Defaults to your church name." },
          tagline: { kind: "text", label: "Tagline", optional: true, help: "The short line under the title." },
          venueImages: {
            kind: "media",
            multiple: true,
            max: 2,
            label: "Venue \u2014 extra photos",
            optional: true,
            help: "The event's own image leads; these two sit beside it. The venue section carries the rest.",
          },
          ticketsCta: { kind: "text", label: "Tickets \u2014 button", optional: true },
          ticketsNote: { kind: "textarea", label: "Tickets \u2014 small print", optional: true },
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
        kind: "text",
        label: "Page address",
        help: "Which of your pages to show as home (e.g. home, welcome).",
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
