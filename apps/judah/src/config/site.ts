/**
 * Judah's demo conference — what the template renders with no church
 * connected, and the first-run defaults a church starts from.
 *
 * Mantle Men's Conference 2027, invented for the purpose. Every factual line
 * here (title, dates, venue, speakers, tickets) is replaced by the connected
 * event's own record; only the words around them stay editable.
 *
 * Treat this as FIRST-RUN values. The Customizer merges these with a church's
 * overrides and saves the whole merged object the first time they open it, so
 * a default changed later never reaches a church who has already connected.
 */
export const site = {
  name: "Mantle Men's Conference",
  description:
    "Mantle Men's Conference 2027 — The Standard. Two days for men of every generation, winding back through the noise to the first draft of a man.",

  /* Blank on purpose, every one. Blank inherits from the event the church
     picked; typing here overrides it for this site alone and never touches
     the event record. See `event-kit/overrides.ts` for why price is absent. */
  eventDetails: {
    title: "",
    dateLabel: "",
    startAt: "",
    endAt: "",
    description: "",
    venue: { name: "", address: "", city: "", directionsUrl: "" },
    days: [] as Array<{ date: string; time: string }>,
    speakers: [] as Array<{ name: string; role: string; image: string; bio: string }>,
    tickets: [] as Array<{ name: string; description: string }>,
  },

  /* 01 · NOISE — the question, buried in everything shouting an answer. */
  hero: {
    wordmark: "MANTLE",
    wordmarkSuffix: "MMXXVII",
    headline: "What is a man",
    headlineItalic: "today?",
    strapline: "TOO MANY ANSWERS. ALL OF THEM LOUD.",
    scrollLabel: "SCROLL",
    image: "/images/hero-noise.webp",
    /* The drifting columns. Each line is one card in the storm the reader
       scrolls out of — deliberately the culture's voice, not the church's. */
    noise: [
      { label: "FEED / 04:11", shout: "Top 1% or nothing", serif: "Provider." },
      { label: "EPISODE 214 · 2H 06M", shout: "Never apologise", serif: "" },
      { label: "PORTFOLIO", shout: "Numb it, don't name it", serif: "Be wanted." },
      { label: "SCROLLED 4H 12M TODAY", shout: "Dominate the room", serif: "" },
    ],
  },

  /* 02 · INTERRUPT — the tape stops. */
  tension: {
    enabled: true,
    badge: "◀◀ REWIND ENGAGED",
    headingA: "Something",
    headingB: "is wrong",
    headingAccent: "with the tape",
    body: "Every definition you have been handed was recorded over something older. So we stop playing forward. We wind back through the noise, back through our own history, back to the first draft of a man.",
    image: "/images/tension.webp",
  },

  /* 03 · ARCHIVE — years wind backwards behind a rail of old footage. */
  archive: {
    enabled: true,
    eyebrow: "ARCHIVE · REVERSE PLAYBACK",
    /* Counted down, in order, as the section is scrolled. The first is where
       the reader stands; the last is as far back as the church can remember. */
    marks: [
      { year: "2027", era: "PRESENT DAY" },
      { year: "2020", era: "THE LAST GATHERING" },
      { year: "2015", era: "MANTLE ARCHIVE" },
      { year: "2009", era: "MANTLE ARCHIVE" },
      { year: "2004", era: "THE FIRST CALL" },
      { year: "1999", era: "BEFORE THE FIRST CALL" },
    ],
    /* Three captions, shown in order as the rewind runs. */
    captions: ["THE NOISE IS STILL LOUD", "THE NOISE IS THINNING", "THE NOISE IS GONE"],
    footer: "◀◀  WINDING BACK",
    frames: [
      { image: "/images/archive-1.webp", caption: "MAIN AUDITORIUM", tag: "ARCHIVE 01", aspect: "4/3" },
      { image: "/images/archive-2.webp", caption: "DELEGATE PORTRAIT", tag: "", aspect: "3/4" },
      { image: "/images/archive-3.webp", caption: "WORSHIP / WIDE", tag: "ARCHIVE 02", aspect: "16/9" },
      { image: "/images/archive-4.webp", caption: "FILM STILL", tag: "", aspect: "1/1" },
      { image: "/images/archive-5.webp", caption: "MEN GATHERED / GRAIN", tag: "ARCHIVE 03", aspect: "4/3" },
    ],
  },

  /* 04 · SCRIPTURE DESCENT — one verse at a time, back to the beginning. */
  scripture: {
    enabled: true,
    footer: "◀◀ REWINDING THROUGH THE RECORD",
    /* Read backwards, last book first. The rail across the top is built from
       `book`, so the order here IS the order up there. */
    verses: [
      { book: "REVELATION", quote: "Behold, I am making all things new.", reference: "REVELATION 21:5" },
      { book: "1 PETER", quote: "You were not redeemed with silver or gold.", reference: "1 PETER 1:18" },
      { book: "JAMES", quote: "Be doers of the word, and not hearers only.", reference: "JAMES 1:22" },
      { book: "ROMANS", quote: "Do not be conformed to this age.", reference: "ROMANS 12:2" },
      { book: "CORINTHIANS", quote: "Act like men. Be strong.", reference: "1 CORINTHIANS 16:13" },
      { book: "JOHN", quote: "In the beginning was the Word.", reference: "JOHN 1:1" },
      { book: "ISAIAH", quote: "We are the clay, you are the potter.", reference: "ISAIAH 64:8" },
      { book: "PSALMS", quote: "You knitted me together. I was not an accident.", reference: "PSALM 139:13" },
    ],
    /* The rail ends on this one, and the stillness lands on it. */
    origin: "GENESIS",
  },

  /* 05 · STILLNESS — the noise is gone. One line, on black. */
  stillness: {
    enabled: true,
    quote: "“Let us make man\nin our image,",
    quoteItalic: "after our likeness.”",
    reference: "GENESIS 1:26",
  },

  /* 06 · THE STANDARD — the campaign, finally named. */
  standard: {
    eyebrow: "MANTLE PRESENTS",
    headingA: "The",
    headingB: "Standard",
    strapline: "A return to\noriginal design",
    ctaLabel: "RETURN TO THE STANDARD →",
  },

  film: {
    enabled: true,
    label: "The Rewind — teaser film",
    note: "60 SEC CUT",
    image: "/images/film.webp",
    videoUrl: "",
    timecode: "● 00:00:60:00",
  },

  contactSheet: {
    enabled: true,
    heading: "The archive",
    note: "CONTACT SHEET",
    frames: [
      { image: "/images/frame-1.webp", caption: "FRAME 001" },
      { image: "/images/frame-2.webp", caption: "FRAME 014" },
      { image: "/images/frame-3.webp", caption: "FRAME 032" },
      { image: "/images/frame-4.webp", caption: "FRAME 048" },
      { image: "/images/frame-5.webp", caption: "FRAME 061" },
      { image: "/images/frame-6.webp", caption: "FRAME 077" },
    ],
    wideImage: "/images/wide.webp",
    wideCaption: "MEN GATHERED / FULL-BLEED",
  },

  /* 07 · THE FOUR FACTS. When, where and tickets are read from the event;
     only the labels and the sentence under each are typed here. */
  facts: {
    enabled: true,
    whenLabel: "01 / WHEN",
    whenNote: "Two days in October. Doors an hour before the first session.",
    whereLabel: "02 / WHERE",
    whereNote: "Parking on site, and a five-minute walk from the tram.",
    whoLabel: "03 / WHO",
    whoHeading: "Men of every generation",
    whoNote: "Fathers, sons, first-timers, and men who were there the first time.",
    ticketsLabel: "04 / TICKETS",
    ticketsNote: "Group and church-block rates available — ring the number below.",
  },

  speakers: {
    enabled: true,
    heading: "The voices",
    note: "TO BE ANNOUNCED",
    /* Only ever a stand-in. A connected event brings its own people and they
       win outright — an event with nobody on it yet shows the note above
       instead of these, which is the honest answer. */
    demo: [
      { name: "Caleb Osei", role: "MAIN SESSION", image: "/images/speaker-1.webp", bio: "" },
      { name: "Tobi Adeyemi", role: "MAIN SESSION", image: "/images/speaker-2.webp", bio: "" },
      { name: "Marcus Hale", role: "EVENING", image: "/images/speaker-3.webp", bio: "" },
      { name: "Daniel Oyinlola", role: "WORKSHOP", image: "/images/speaker-4.webp", bio: "" },
      { name: "Josiah Bright", role: "WORSHIP", image: "/images/speaker-5.webp", bio: "" },
      { name: "Ade Fashola", role: "HOST", image: "/images/speaker-6.webp", bio: "" },
    ],
  },

  experience: {
    enabled: true,
    heading: "What two days in the room feels like",
    items: [
      { title: "Main sessions", body: "Four teaching moments, each winding one layer further back." },
      { title: "The archive room", body: "An installation of footage, stills and testimony from every year we can find." },
      { title: "Table conversation", body: "Eight men to a table, one question, no stage." },
      { title: "The commissioning", body: "The closing moment. Nobody leaves the room the way they came in." },
    ],
  },

  venue: {
    enabled: true,
    label: "VENUE",
    image: "/images/venue.webp",
    note: "Transport links and accessibility information on the day sheet.",
    /* Only ever a stand-in, and deliberately not in the manifest: a connected
       event brings its own address and it wins outright. Without this the
       demo reads "to be announced", which is true of nothing. */
    demo: { name: "The Old Foundry", address: "Bank Street, Manchester M1 2AB" },
  },

  faq: {
    enabled: true,
    label: "FAQ",
    items: [
      { question: "Who is it for?", answer: "Any man, any age, any starting point." },
      { question: "Do I need to be a Christian?", answer: "No. Come as you are; nothing is assumed of you." },
      { question: "Can I bring a group?", answer: "Yes — group rates apply from six upwards. Ring the number on the tickets page." },
      { question: "What should I expect?", answer: "Two long days, four main sessions, and a lot of conversation in between." },
    ],
  },

  /* 11 · REGISTER — the one loud band on the whole site. */
  register: {
    eyebrow: "TICKETS ON SALE",
    headingA: "Rewind",
    headingB: "and return",
  },

  tickets: {
    ctaLabel: "GET TICKETS",
    stickyLabel: "GET TICKETS",
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
     church's own accounts from its Ministree profile, which is the right
     answer for a church running its first conference. */
  socialLinks: [] as Array<{ label: string; href: string }>,

  footer: {
    organisation: "Cedar Road Church",
    tagline: "SHAPING GODLY MANHOOD SINCE 1999",
    legal: [
      { label: "Privacy", href: "" },
      { label: "Terms", href: "" },
      { label: "Safeguarding", href: "" },
    ],
  },

  nav: {
    logo: "",
    favicon: "",
    stickyHeader: true,
    showTicketBar: true,
    menuLabel: "MENU",
  },

  effects: {
    scrollReveals: true,
    grain: true,
    vignette: true,
    timecode: true,
  },
};

/* Deliberately NOT `as const`. These are first-run values a church overrides
   with arbitrary strings and booleans, so the type has to be the widened
   shape — under `as const` every default becomes its own literal type and
   `content.effects.grain !== false` reads as a comparison that cannot happen. */
export type SiteContent = typeof site;
