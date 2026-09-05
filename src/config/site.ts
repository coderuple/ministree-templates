/**
 * FLAME — demo content (the template's defaults).
 *
 * This is what renders when no church is connected, and the `content.defaults`
 * in ministree.config.ts. A connected church overrides identity/nav/footer from
 * its live settings; this stays as the standalone fallback.
 */
export const site = {
  name: "Flame Church",
  tagline: "A community of grace, growing in faith together",
  description:
    "A clean, general-purpose church website template. Connect a church to see its real sermons, events and giving flow in.",

  hero: {
    eyebrow: "Welcome home",
    // Optional overrides — blank by default so the hero shows the church name +
    // tagline. A church fills these in (in the Customizer) to override.
    title: "",
    subtitle: "",
    primaryCta: { label: "Plan your visit", href: "/about", variant: "primary" },
    secondaryCta: { label: "Watch a message", href: "/sermons", variant: "outline" },
    imageUrl: "",
    imageFocalPoint: "center",
  },

  intro: {
    heading: "There's a place for you",
    body: "Sunday gatherings, midweek groups, and a family that shows up for one another. New here? Start with a service — we'll save you a seat.",
  },

  // The native /give experience (Customizer-editable).
  giving: {
    layout: "scroll",
    heading: "Give",
    lede: "Your generosity fuels the mission — here and beyond. Every gift makes a difference.",
    showCampaigns: true,
    showOtherWays: true,
    successMessage: "",
  },

  // Home composition (Customizer-editable). `templateHome` = flame's hero + the
  // composable section stack below; `ministreePage` renders a CMS page instead.
  siteMode: "fullSite",
  featuredEvent: "",
  homeSource: "templateHome",
  homePageSlug: "",
  homeSections: {
    sections: [
      {
        id: "home-marquee",
        type: "marquee",
        props: {
          speed: "normal",
          direction: "left",
          separator: "✝",
          items: [{ text: "One Church" }, { text: "One Family" }, { text: "One Mission" }],
        },
      },
      {
        id: "home-welcome",
        type: "statement",
        props: {
          eyebrow: "Welcome",
          statement: "There's a place for you here.",
          size: "xl",
          containerSize: "normal",
        },
      },
      {
        id: "home-schedule",
        type: "schedule",
        title: "Service times",
        props: {
          heading: "When we gather",
          orientation: "vertical",
          showRail: true,
          containerSize: "normal",
          items: [
            { time: "9:00am & 11:00am", label: "Sunday" },
            { time: "7:00pm", label: "Wednesday — Midweek" },
          ],
        },
      },
      {
        id: "home-sermons",
        type: "sermonsList",
        title: "Latest messages",
        props: { source: "latest", limit: 3, layout: "grid" },
      },
      {
        id: "home-events",
        type: "eventsList",
        title: "Upcoming events",
        props: { source: "upcoming", limit: 3, layout: "list" },
      },
      {
        id: "home-giving",
        type: "givingCta",
        props: {
          heading: "Be part of the story",
          description: "Your generosity fuels the mission — here and beyond.",
        },
      },
    ],
  },

  serviceTimes: [
    { label: "Sunday", value: "9:00am & 11:00am" },
    { label: "Wednesday", value: "7:00pm — Midweek" },
  ],

  contact: {
    address: "100 Grace Avenue, Your City",
    email: "hello@flamechurch.org",
    phone: "(555) 010-1234",
  },

  socials: [
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "Facebook", href: "#" },
  ],

  // Fallback navigation when a church has no menu configured.
  nav: [
    { label: "Visit", href: "/locations" },
    { label: "Sermons", href: "/sermons" },
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
    { label: "Give", href: "/give" },
  ],

  chrome: {
    logoSize: "default",
    logoTextSize: "default",
    showGiveButton: true,
    stickyHeader: true,
    footerWordmark: true,
  },

  footerNote: "",

  /**
   * Single-event mode's running order, as sections.
   *
   * This reproduces EXACTLY what the fixed order rendered before it was
   * composable — same beats, same sequence, same labels — so the day this ships
   * no live event site changes. That matters more than usual here: the
   * Customizer freezes a church's merged defaults the first time they edit
   * anything, so this list becomes their copy and a later correction never
   * reaches them.
   *
   * Content props are deliberately EMPTY. Each beat inherits from the event's
   * own record (see `flameEventSections`); filling a prop is how a church
   * overrides it. Only the labels are seeded, because those are wording rather
   * than data.
   *
   * `evt-` ids so these can never collide with `homeSections`.
   */
  /* Event-mode settings. Everything factual — lineup, times, tickets, venue —
     comes from the event record itself; this is only what the template needs to
     be told. Read in code as `!== false`, never `=== true`: a church's merged
     defaults freeze the first time they edit anything, so a switch added later
     never reaches an existing church and has to default to on by absence. */
  event: {
    countdown: true,
    backdropVideo: "",
    backdropPoster: "",
    flyerUrl: "",
    ticketPerks: "",
    ticketsPhone: "",
  },

  eventSections: {
    sections: [
      { id: "evt-marquee-open", type: "marquee", props: {} },
      {
        id: "evt-vision",
        type: "statement",
        title: "The vision",
        // `statement` left empty on purpose: it inherits the event's own
        // description, so a church writes the event once. Type here to override.
        props: { eyebrow: "The vision", statement: "" },
      },
      {
        id: "evt-lineup",
        type: "profileCards",
        title: "Who you'll hear",
        // `source: people` is Ministree's own way of saying "pull it live" —
        // the billing comes from the event, not from cards typed twice.
        props: { source: "people", eyebrow: "The lineup" },
      },
      {
        id: "evt-timeline",
        type: "schedule",
        title: "How the evening unfolds",
        props: { eyebrow: "The night", items: [], note: "" },
      },
      { id: "evt-marquee-close", type: "marquee", props: { speed: "slow" } },
      {
        id: "evt-venue",
        type: "location",
        title: "The venue",
        props: { eyebrow: "The venue", serviceTimes: "" },
      },
      {
        id: "evt-tickets",
        type: "cta",
        title: "Be in the room",
        props: { eyebrow: "Tickets", description: "" },
      },
      {
        id: "evt-give",
        type: "givingMethods",
        title: "Ways to give",
        props: {
          eyebrow: "Giving",
          description: "Partner with what happens here \u2014 every gift keeps a place open for someone.",
          methods: [
            {
              kind: "online",
              title: "Online",
              description:
                "The fastest way to give \u2014 securely, from anywhere, before or after the night.",
              ctaLabel: "Give now",
            },
          ],
        },
      },
      {
        id: "evt-faq",
        type: "accordion",
        title: "Good to know",
        props: {
          eyebrow: "Know before you go",
          items: [
            { title: "What time should I arrive?", content: "Doors open thirty minutes before we start." },
            { title: "Is there parking?", content: "Yes \u2014 and the nearest station is a short walk." },
            { title: "Can I bring someone?", content: "Please do. Bring the person you were thinking of." },
          ],
        },
      },
    ],
  },
};

export type SiteContent = typeof site;
