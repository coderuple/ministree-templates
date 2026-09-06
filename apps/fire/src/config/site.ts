/**
 * Fire's demo conference — what the template renders with no church
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

  hero: {
    headline: "Unstoppable",
    accentMark: "!!",
    subhead: "Living Emboldened",
    ctaLabel: "Get Tickets",
    secondaryLabel: "Discover UWC 2027",
    scrollLabel: "Let it carry you",
    secondaryHref: "#about",
    pullQuote: "I am fully able to do anything through Christ, who empowers me.",
    pullQuoteRef: "Philippians 4:13 TPT",
    image: "",
    imageBrief: "Hero loop — fabric lifting in wind, backlit",
  },

  manifesto: {
    enabled: true,
    eyebrow: "I. Spark",
    headingA: "It starts with",
    headingB: "a spark.",
    lede: "A moment. A stirring. A woman deciding to believe again.",
    body: "A fire does not spread because it is loud. It spreads because the wind carries it.\n\nSome will catch the fire. Some will rediscover embers they thought had disappeared. Others will find that what already burns within them can burn brighter still.",
    closingA: "",
    closingB: "This is Uncommon Woman 2027.",
    image: "",
    imageBrief: "Portrait — hair and fabric moving, backlit at dusk",
  },

  stages: {
    enabled: true,
    one: {
      eyebrow: "One of three",
      word: "Catch",
      phrase: "Catch the Fire",
      body: "For the woman discovering Christ and a life of faith. You don't need to arrive certain. You only need to come close enough to feel the warmth.",
    },
    two: {
      eyebrow: "Two of three",
      word: "Rekindle",
      phrase: "Rekindle the Embers",
      body: "For the woman who is tired, dry or further away than she meant to be. Embers do not need to be replaced. They need breath.",
    },
    three: {
      eyebrow: "Three of three",
      word: "Fan",
      phrase: "Fan the Flames",
      body: "For the woman already serving, already faithful, and sensing that God is asking for more. What burns in you was never meant to stay this size.",
    },
    images: [] as string[],
    imageBriefs: [
      "CATCH — a single point of light in the dark",
      "REKINDLE — embers breathed back to life",
      "FAN — flame carried on the wind, wide",
    ],
  },

  scripture: {
    enabled: true,
    eyebrow: "II. Breath",
    reference: "Philippians 4:13 · The Passion Translation",
    quote: "I am fully able to do anything through Christ, who empowers me.",
    emphasis: "fully able",
  },

  speakers: {
    enabled: true,
    eyebrow: "Voices",
    headingA: "Women who",
    headingB: "carry fire.",
    /* The event's own people fill this section. These three stand in until a
       church connects one, and match the design's placeholder lineup. */
    demo: [
      {
        name: "Pastor Adaeze Okafor",
        role: "Host · Esther's Ministry",
        bio: "Founder of Esther's Ministry and the voice behind Uncommon Woman since its first gathering of forty women in a borrowed hall.",
        imageBrief: "Speaker portrait 01 — editorial, warm ivory backdrop",
      },
      {
        name: "Dr. Marianne Castell",
        role: "Teaching · Saturday",
        bio: "Theologian and author writing on courage, vocation and the interior life of women in ministry.",
        imageBrief: "Speaker portrait 02 — three-quarter turn, soft shadow",
      },
      {
        name: "Naomi Ferreira",
        role: "Worship",
        bio: "Leads worship across three nights, drawing on hymnody, gospel and the songs of her Cape Town childhood.",
        imageBrief: "Speaker portrait 03 — worship leader, candid",
      },
    ],
    /* The fourth cell. A conference announces its bill in waves, and an empty
       grid slot reads as a mistake — this one says the wait is deliberate. */
    placeholder: {
      show: true,
      label: "Still to come",
      title: "Two more voices, announced this autumn.",
      note: "Join the list and you'll hear first — before tickets move to general release.",
      linkLabel: "Keep me posted",
      linkHref: "",
    },
  },

  days: {
    enabled: true,
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
        imageBrief: "Thursday — doors opening, warm lobby light",
        image: "",
      },
      {
        name: "The Breath",
        description:
          "An evening of prayer and honesty. Space to bring what is weary and let it be met.",
        imageBrief: "Friday — hands raised in low light, shot from behind",
        image: "",
      },
      {
        name: "The Sending",
        description:
          "A full day: teaching, workshops, lunch together, and a closing gathering that sends everyone out carrying something.",
        imageBrief: "Saturday — room full of women, wide daylight",
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
    imageBrief: "The room — wide, warm, filling up",
  },

  experience: {
    enabled: true,
    eyebrow: "The Experience",
    headingA: "Three days you'll",
    headingEm: "feel",
    headingB: "for a year.",
    chips: "Worship\nPrayer\nSisterhood\nEncounter\nRenewal",
    images: [] as string[],
    imageBriefs: [
      "Worship",
      "Prayer",
      "Sisterhood",
      "Encounter",
      "Renewal",
    ],
  },

  stories: {
    enabled: true,
    headingA: "Different stories.",
    headingB: "One fire.",
    body: "Sixteen and sixty. First time and fifteenth. Women from a dozen cultures and every stage of faith, in one room, on the same three evenings. Nobody here is a category. Everybody here is carrying something.",
    images: [] as string[],
    imageBriefs: [
      "Portrait — young woman, 20s",
      "Portrait — woman in her 60s",
      "Portrait — teenager, natural light",
      "Portrait — mother and daughter together",
    ],
  },

  finalCta: {
    eyebrow: "VI. Unstoppable",
    headingA: "What if this is the moment",
    headingB: "everything changes?",
    body: "Live boldly. Live fully. Live unashamedly in Christ. Come and find out what it becomes when it is not carried alone.",
    ctaLabel: "Get your ticket",
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
    usePaypal: false,
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
    scrollReveals: true,
  },
};

/* Deliberately NOT `as const`. These are first-run values a church overrides
   with arbitrary strings and booleans, so the type has to be the widened
   shape — under `as const` every default becomes its own literal type and
   `content.effects.embers !== false` reads as a comparison that cannot happen. */
export type SiteContent = typeof site;
