/**
 * Ivory's demo conference — what the template renders with no church
 * connected, and the first-run defaults a church starts from.
 *
 * The copy is Uncommon Woman Conference 2027, verbatim from the design. Every
 * factual line here (title, dates, venue, speakers, tickets) is replaced by the
 * connected event's own record; only the words around them stay editable.
 *
 * Treat this as FIRST-RUN values. The Customizer merges these with a church's
 * overrides and saves the whole merged object the first time they open it, so
 * a default changed later never reaches a church who has already connected.
 */
export const site = {
  name: "Uncommon Woman Conference",
  description:
    "Uncommon Woman Conference 2027 — Unstoppable!! Living Emboldened. Three days for women who want to live boldly, fully and unashamedly in Christ.",

  issue: {
    label: "Uncommon Woman Conference",
    number: "Issue 2027",
  },

  marquee: {
    enabled: true,
    phrases: "Catch the Fire\nRekindle the Embers\nFan the Flames",
  },

  hero: {
    headline: "Unstoppable",
    accentMark: "!!",
    subhead: "Living Emboldened",
    ctaLabel: "Get Tickets",
    secondaryLabel: "Discover",
    secondaryHref: "#about",
    intro:
      "Three days for women who intend to live boldly, fully and unashamedly in Christ. What God ignites cannot be contained.",
    pullQuoteRef: "Philippians 4:13 TPT",
    image: "",
  },

  manifesto: {
    enabled: true,
    marker: "I — Manifesto",
    eyebrow: "Spark",
    headingA: "It starts with",
    headingB: "a spark.",
    lede: "A moment. A stirring. A woman deciding to believe again.",
    body: "And when that spark meets the breath of God, something begins that cannot easily be contained.\n\nSome will catch the fire. Some will rediscover embers they thought had disappeared. Others will find that what already burns within them can burn brighter still.",
    closingA: "This is Uncommon Woman 2027.",
    closingB: "Unstoppable. Living Emboldened.",
    pullLine: "What God ignites cannot be contained.",
    image: "",
    insetImage: "",
  },

  stages: {
    enabled: true,
    one: {
      eyebrow: "Stage One",
      word: "Catch",
      phrase: "Catch the Fire",
      body: "For the woman discovering Christ and a life of faith. You don't need to arrive certain. You only need to come close enough to feel the warmth.",
    },
    two: {
      eyebrow: "Stage Two",
      word: "Rekindle",
      phrase: "Rekindle the Embers",
      body: "For the woman who is tired, dry or further away than she meant to be. Embers do not need to be replaced. They need breath.",
    },
    three: {
      eyebrow: "Stage Three",
      word: "Fan",
      phrase: "Fan the Flames",
      body: "For the woman already serving, already faithful, and sensing that God is asking for more. What burns in you was never meant to stay this size.",
    },
    images: [] as string[],
    /* How many frames this section draws. The shot list for them

       lives on the matching field in the Customizer. */

    slots: 5,
  },

  scripture: {
    enabled: true,
    reference: "Philippians 4:13 · The Passion Translation",
    quote: "I am fully able to do anything through Christ, who empowers me.",
    emphasis: "fully able",
  },

  speakers: {
    enabled: true,
    marker: "II — The Bill",
    eyebrow: "Voices",
    headingA: "Women who",
    headingB: "carry fire.",
    /* The event's own people fill this section. These three stand in until a
       church connects one, and match the design's placeholder lineup. */
    demo: [
      {
        name: "Hannah Vasquez",
        role: "Host · Esther's Ministry",
        bio: "Founder of Esther's Ministry and the voice behind Uncommon Woman since its first gathering of forty women in a borrowed hall.",
      },
      {
        name: "Dr. Claire Beaumont",
        role: "Teaching · Saturday",
        bio: "Theologian and author writing on courage, vocation and the interior life of women in ministry.",
      },
      {
        name: "Ingrid Solberg",
        role: "Worship",
        bio: "Leads worship across three nights, drawing on hymnody, gospel and the songs she grew up singing.",
      },
    ],
    /* The fourth cell. A conference announces its bill in waves, and an empty
       grid slot reads as a mistake — this one says the wait is deliberate. */
    note: "Two further speakers announced autumn 2026.",
  },

  days: {
    enabled: true,
    marker: "III — Three Days",
    eyebrow: "Three Days",
    headingA: "The fire is",
    headingEm: "carried",
    headingB: "across three evenings.",
    /* The dates, times and weekdays come from the event's own occurrences.
       What a day is CALLED is not something Ministree stores, so it lives here,
       matched to the dates in order. */
    beats: [
      {
        name: "The Spark",
        description:
          "Opening night. Worship, welcome and the first word — why now, why us, why this.",
        image: "",
      },
      {
        name: "The Breath",
        description:
          "An evening of prayer and honesty. Space to bring what is weary and let it be met.",
        image: "",
      },
      {
        name: "The Sending",
        description:
          "A full day: teaching, workshops, lunch together, and a closing gathering that sends everyone out carrying something.",
        image: "",
      },
    ],
    /* Only used when no church is connected — a real event brings its own. */
    demoDates: [
      { numeral: "18", weekday: "Thursday", time: "7:30 PM" },
      { numeral: "19", weekday: "Friday", time: "7:30 PM" },
      { numeral: "20", weekday: "Saturday", time: "10:00 AM – 6:00 PM" },
    ],
  },

  venue: {
    enabled: true,
    eyebrow: "The Venue",
    heading: "Where we gather.",
    blurb: "",
    images: [] as string[],
  },

  experience: {
    enabled: true,
    eyebrow: "The Experience",
    marker: "IV — The Experience",
    headingA: "What three",
    headingEm: "days",
    headingB: "feel like.",
    chips: "Worship\nTeaching\nPrayer\nEncounter\nCommunity\nPurpose\nSisterhood\nRenewal",
    images: [] as string[],
    /* How many frames this section draws. The shot list for them

       lives on the matching field in the Customizer. */

    slots: 4,
  },

  stories: {
    enabled: true,
    headingA: "Different stories.",
    headingB: "One fire.",
    body: "Sixteen and sixty. First time and fifteenth. Women from a dozen cultures and every stage of faith, in one room, on the same three evenings. Nobody here is a category. Everybody here is carrying something.",
    images: [] as string[],
    /* How many frames this section draws. The shot list for them

       lives on the matching field in the Customizer. */

    slots: 3,
  },

  finalCta: {
    eyebrow: "V — The Invitation",
    lineOne: "Live boldly.",
    lineTwo: "Live fully.",
    lineThree: "Live emboldened.",
    ctaLabel: "Get your ticket",
    watermark: "27",
  },

  faq: {
    enabled: true,
    eyebrow: "Know before you go",
    heading: "Good to know.",
    items: [] as Array<{ question: string; answer: string }>,
  },

  tickets: {
    ctaLabel: "Get Tickets",
    stickyLabel: "Get Tickets",
    perks: "",
    note: "",
    phone: "",
    ticketing: {
      mode: "onSite",
      eventPageUrl: "",
      sellerName: "",
      sellerUrl: "",
      secondSellerName: "",
      secondSellerUrl: "",
    },
    soldOutMessage: "Tickets for this one have all gone.",
  },

  /* Left empty on purpose. With no rows here the site falls back to the
     church's own four from its Ministree profile, which is the right answer
     for a church running its first conference. A conference with its own
     handles adds them and they win outright. */
  socialLinks: [] as Array<{ label: string; href: string }>,

  footer: {
    organisation: "Esther's Ministry",
    description:
      "Uncommon Woman Conference — an annual gathering for women who want to live emboldened.",
    legal: [
      { label: "Privacy", href: "" },
      { label: "Terms", href: "" },
      { label: "Safeguarding", href: "" },
    ],
  },

  nav: {
    stickyHeader: true,
    showTicketBar: true,
  },

  effects: {
    embers: true,
    scrollReveals: true,
  },
};

/* Deliberately NOT `as const`. These are first-run values a church overrides
   with arbitrary strings and booleans, so the type has to be the widened
   shape — under `as const` every default becomes its own literal type and
   `content.effects.embers !== false` reads as a comparison that cannot happen. */
export type SiteContent = typeof site;
