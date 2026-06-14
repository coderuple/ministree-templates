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
      "A clean, general-purpose multi-page church template: home, pages, sermons, events, blog, giving and forms — light + dark, fully driven by the church's Ministree data.",
  },

  compatibility: {
    sdk: "^0.2.0",
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
    ],
    navigation: { header: true, footer: true },
    colorSchemes: ["light", "dark"],
    features: ["rss", "search"],
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
      label: "Ember (accent)",
    },
    {
      name: "--flame",
      type: "color",
      default: "#e0922b",
      darkDefault: "#ff8a3c",
      maps: "--color-accent",
      label: "Flame (hot accent)",
    },
    { name: "--crimson", type: "color", default: "#7a2516", darkDefault: "#571610", label: "Deep undertone" },
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
        fields: {
          eyebrow: { kind: "text", label: "Eyebrow" },
          title: { kind: "text", label: "Headline", help: "Optional — defaults to your church name" },
          subtitle: { kind: "textarea", label: "Sub-line", help: "Optional — defaults to your tagline" },
          imageUrl: { kind: "media", label: "Background image", help: "Optional — sits behind the ember hero" },
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
        fields: {
          heading: { kind: "text", label: "Heading" },
          body: { kind: "textarea", label: "Body" },
        },
      },
      // Home composition.
      homeSource: {
        kind: "select",
        label: "Home page",
        help: "Use flame's built-in home, or render a Ministree CMS page instead.",
        options: [
          { value: "templateHome", label: "Template home (flame)" },
          { value: "ministreePage", label: "A Ministree page" },
        ],
      },
      homePageSlug: {
        kind: "text",
        label: "Ministree page slug",
        help: "Used when 'A Ministree page' is selected (e.g. home, welcome).",
      },
      homeSections: {
        kind: "sections",
        label: "Home sections",
        help: "The composable stack below the hero on the template home. Reorder, add or remove.",
      },

      // flame-specific cinematic primitives — toggled per church in the Customizer.
      // Omitted/undefined means ON (cinematic by default); set false to calm it down.
      effects: {
        kind: "group",
        label: "Cinematic effects",
        fields: {
          webglHero: { kind: "boolean", label: "WebGL ember hero", help: "GPU particle flame on the home hero (falls back to a poster on mobile / reduced-motion)" },
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
            { title: "Home source", columns: 2, fields: ["homeSource", "homePageSlug"] },
            { title: "Hero", fields: ["hero"] },
            { title: "Welcome", fields: ["intro"] },
            { title: "Sections", fields: ["homeSections"] },
          ],
        },
        {
          id: "brand",
          title: "Brand",
          groups: [{ title: "Tagline", fields: ["tagline"] }],
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
