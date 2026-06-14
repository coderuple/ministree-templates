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
    "Flame is a clean, general-purpose church website template built on the Ministree template SDK. Connect a church to see its real sermons, events and giving flow in.",

  hero: {
    eyebrow: "Welcome home",
    // Optional overrides — blank by default so the hero shows the church name +
    // tagline. A church fills these in (in the Customizer) to override.
    title: "",
    subtitle: "",
    primaryCta: { label: "Plan your visit", href: "/about", variant: "primary" },
    secondaryCta: { label: "Watch a message", href: "/sermons", variant: "outline" },
    imageUrl: "",
  },

  intro: {
    heading: "There's a place for you",
    body: "Sunday gatherings, midweek groups, and a family that shows up for one another. New here? Start with a service — we'll save you a seat.",
  },

  // Home composition (Customizer-editable). `templateHome` = flame's hero + the
  // composable section stack below; `ministreePage` renders a CMS page instead.
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
    { label: "About", href: "/about" },
    { label: "Sermons", href: "/sermons" },
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
    { label: "Give", href: "/give" },
  ],

  footerNote: "Built with the Ministree template SDK.",
};

export type SiteContent = typeof site;
