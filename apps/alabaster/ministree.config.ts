import { defineMinistreeTemplate } from "@ministree/template-sdk";
import { site } from "./src/config/site";

/**
 * ALABASTER — the manifest Ministree reads to build a church's Customizer.
 *
 * A single-event template: the whole site is one conference. Everything
 * factual — dates, venue, speakers, schedule, tickets — comes from the event
 * the church picks, so this declares only the words around it.
 *
 * One colour scheme, deliberately. Alabaster is a lit object on ivory; there
 * is no dark variant of it, and inventing one would be a second design.
 */
export default defineMinistreeTemplate({
  meta: {
    name: "Alabaster",
    author: "{{app_name}}",
    version: "1.0.0",
    description:
      "A serene, editorial conference template. One event, told as a single scroll — from a first spark to a room that cannot be contained.",
  },

  compatibility: {
    sdk: "^0.5.0",
    deploymentMode: "single",
    requiresModules: ["events"],
  },

  supports: {
    surfaces: ["home"],
    sections: [],
    navigation: { header: false, footer: false },
    colorSchemes: ["light"],
    features: ["ticketing"],
  },

  /* Five colours. Every hairline, scrim and gradient stop in the stylesheet is
     mixed from these, so a church that changes the ground gets a page that
     still agrees with itself rather than one rule left behind at the old hue.
     Exposing all twenty of the design's literals would let a church take the
     page apart; these five cannot make it unreadable. */
  tokens: [
    {
      name: "--bg",
      type: "color",
      default: "#f7f2ea",
      label: "Page",
      description:
        "The ivory the whole site sits on. The parchment and champagne bands are mixed from it.",
    },
    {
      name: "--ink",
      type: "color",
      default: "#2b211c",
      label: "Text",
      description: "Headlines and body copy. Body text and captions are lighter mixes of it.",
    },
    {
      name: "--accent",
      type: "color",
      default: "#7a2433",
      maps: "--color-primary",
      label: "Accent",
      description:
        "The crimson on buttons, italics and the final section. Pick your brand colour here if you want it carried through.",
    },
    {
      name: "--gold",
      type: "color",
      default: "#b4884a",
      maps: "--color-accent",
      label: "Gold",
      description: "Eyebrows, hairlines and the ember light. Keep it warm — it is the light source.",
    },
    {
      name: "--dark",
      type: "color",
      default: "#1e1614",
      label: "Dark sections",
      description:
        "Behind the scripture moment and the footer. Deliberately not your brand colour: it is a shadow, and a bright one washes the type out.",
    },
    {
      name: "--font-display",
      type: "font",
      control: "fontFamily",
      default: "var(--font-cormorant), Georgia, serif",
      label: "Display font",
      description: "Headlines, numerals and pull quotes.",
    },
    {
      name: "--font-body",
      type: "font",
      control: "fontFamily",
      default: "var(--font-jost), system-ui, sans-serif",
      label: "Body font",
      description: "Navigation, labels, buttons and body copy.",
    },
    {
      name: "--radius-action",
      type: "length",
      control: "cornerRadius",
      default: "9999px",
      label: "Button shape",
      description:
        "Pills by default. Imagery stays square whatever this is — the contrast between soft actions and hard photo edges is the look.",
    },
  ],

  presets: [
    {
      id: "ember",
      label: "Ember",
      description: "The original. Ivory, crimson and antique gold.",
      tokens: {
        "--bg": "#f7f2ea",
        "--ink": "#2b211c",
        "--accent": "#7a2433",
        "--gold": "#b4884a",
        "--dark": "#1e1614",
      },
    },
    {
      id: "sage",
      label: "Sage",
      description: "Cooler and quieter — linen, deep green and brass.",
      tokens: {
        "--bg": "#f2f4ef",
        "--ink": "#1f2621",
        "--accent": "#2f5040",
        "--gold": "#a08a53",
        "--dark": "#161c18",
      },
    },
    {
      id: "indigo",
      label: "Indigo",
      description: "Evening blues with the same warm gold light.",
      tokens: {
        "--bg": "#f2f1f6",
        "--ink": "#1d1c2b",
        "--accent": "#2f3670",
        "--gold": "#b08a4a",
        "--dark": "#14131f",
      },
    },
  ],

  /* next/font resolves at build time, so these two are the only faces that
     can render. The picker offers exactly them — offering a church a face
     nobody compiled in is offering them a button that silently falls back. */
  fonts: [
    { family: "Cormorant Garamond", value: "var(--font-cormorant), Georgia, serif" },
    { family: "Jost", value: "var(--font-jost), system-ui, sans-serif" },
  ],

  content: {
    defaults: site,
    fields: {
      featuredEvent: {
        kind: "entity",
        module: "events",
        label: "Which event?",
        help: "The whole site is built from this one — its dates, venue, speakers and tickets.",
      },

      hero: {
        kind: "group",
        label: "Opening",
        fields: {
          headline: {
            kind: "text",
            label: "The big word",
            width: "half",
            help: "Your theme, not the event's name — the name sits above it.",
          },
          accentMark: {
            kind: "text",
            label: "…and its flourish",
            width: "half",
            optional: true,
            help: "Set in gold beside the headline. Leave empty for none.",
          },
          subhead: { kind: "text", label: "The line under it", optional: true },
          ctaLabel: { kind: "text", label: "Button", width: "half" },
          secondaryLabel: { kind: "text", label: "Second button", width: "half", optional: true },
          pullQuote: { kind: "textarea", label: "Corner quote", optional: true },
          pullQuoteRef: { kind: "text", label: "…where it's from", optional: true },
          image: {
            kind: "media",
            label: "Behind the words",
            optional: true,
            help: "Soft-lit portrait, eyes closed, warm rim light. It sits behind the words and fades up as the page scrolls, so leave room around the face.",
          },
        },
      },

      manifesto: {
        kind: "group",
        label: "Opening statement",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingB: { kind: "text", label: "…and its italic second line", optional: true },
          lede: { kind: "textarea", label: "Opening line", optional: true },
          body: {
            kind: "textarea",
            label: "The rest",
            optional: true,
            help: "A blank line starts a new paragraph. Left empty, the event's own description is used.",
          },
          closingA: { kind: "text", label: "Closing line", optional: true },
          closingB: { kind: "text", label: "…and its italic half", optional: true },
          image: {
            kind: "media",
            label: "Picture",
            optional: true,
            help: "Close-up — hands cupped around a single point of light.",
          },
          insetImage: {
            kind: "media",
            label: "The small overlapping one",
            optional: true,
            help: "A detail: linen texture, warm shadow.",
          },
        },
      },

      stages: {
        kind: "group",
        label: "The three invitations",
        help: "Three moments that cross-fade as the reader scrolls, and the room warms behind them.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          one: {
            kind: "group",
            label: "First",
            fields: {
              eyebrow: { kind: "text", label: "Small label", width: "half" },
              word: { kind: "text", label: "The word", width: "half" },
              phrase: { kind: "text", label: "The full phrase" },
              body: { kind: "textarea", label: "Who it's for" },
            },
          },
          two: {
            kind: "group",
            label: "Second",
            fields: {
              eyebrow: { kind: "text", label: "Small label", width: "half" },
              word: { kind: "text", label: "The word", width: "half" },
              phrase: { kind: "text", label: "The full phrase" },
              body: { kind: "textarea", label: "Who it's for" },
            },
          },
          three: {
            kind: "group",
            label: "Third",
            fields: {
              eyebrow: { kind: "text", label: "Small label", width: "half" },
              word: { kind: "text", label: "The word", width: "half" },
              phrase: { kind: "text", label: "The full phrase" },
              body: { kind: "textarea", label: "Who it's for" },
            },
          },
          image: {
            kind: "media",
            label: "Behind all three",
            optional: true,
            help: "A woman in profile, low warm light. It sits behind all three words, so nothing important near the middle.",
          },
        },
      },

      scripture: {
        kind: "group",
        label: "Scripture moment",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          quote: { kind: "textarea", label: "The verse" },
          emphasis: {
            kind: "text",
            label: "Words to light up",
            optional: true,
            help: "Any words from the verse. They are set in gold where they fall.",
          },
          reference: { kind: "text", label: "Reference" },
        },
      },

      speakers: {
        kind: "group",
        label: "Speakers",
        help: "The people come from the event itself — add them in Events, not here.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingB: { kind: "text", label: "…and its italic second line", optional: true },
          placeholder: {
            kind: "group",
            label: "The 'more to come' card",
            fields: {
              show: { kind: "boolean", label: "Show it" },
              label: { kind: "text", label: "Small label", width: "half" },
              title: { kind: "text", label: "Heading", width: "half" },
              note: { kind: "textarea", label: "The line under it", optional: true },
              linkLabel: { kind: "text", label: "Link", width: "half", optional: true },
              linkHref: { kind: "link", label: "…goes to", width: "half", optional: true },
            },
          },
        },
      },

      days: {
        kind: "group",
        label: "The days",
        help: "Dates and times come from the event's own dates. What each day is called is up to you.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingEm: { kind: "text", label: "…its italic word", width: "half", optional: true },
          headingB: { kind: "text", label: "…and the rest", optional: true },
          beats: {
            kind: "repeatable",
            label: "What each day is called",
            help: "In the same order as the event's dates. A day with no row here still shows its date.",
            fields: {
              name: { kind: "text", label: "Name", width: "half" },
              description: { kind: "textarea", label: "What happens" },
              image: {
                kind: "media",
                label: "Picture",
                optional: true,
                help: "Something from that day \u2014 doors opening, hands raised in low light, the room full in daylight.",
              },
            },
          },
        },
      },

      venue: {
        kind: "group",
        label: "Venue",
        help: "The address comes from the event. This is the wording around it.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          heading: { kind: "text", label: "Heading", width: "half" },
          blurb: { kind: "textarea", label: "Anything worth knowing", optional: true },
          images: {
            kind: "media",
            multiple: true,
            max: 3,
            label: "Pictures",
            optional: true,
            help: "The room \u2014 wide, warm, filling up.",
          },
        },
      },

      experience: {
        kind: "group",
        label: "What it's like",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingEm: { kind: "text", label: "…its italic word", width: "half", optional: true },
          headingB: { kind: "text", label: "…and the rest", optional: true },
          chips: { kind: "textarea", label: "The words around it", help: "One per line." },
          images: {
            kind: "media",
            multiple: true,
            max: 4,
            label: "Pictures",
            optional: true,
            help: "Four pictures, in this order: 1) worship, close crop, eyes closed. 2) two people talking, natural laughter. 3) hands open on an open Bible. 4) light moving across a face.",
          },
        },
      },

      stories: {
        kind: "group",
        label: "Who comes",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingB: { kind: "text", label: "…and its italic second line", width: "half" },
          body: { kind: "textarea", label: "The paragraph" },
          images: {
            kind: "media",
            multiple: true,
            max: 4,
            label: "Faces",
            optional: true,
            help: "Four portraits, in this order: 1) someone in their twenties. 2) someone in their sixties. 3) a teenager, natural light. 4) two generations together.",
          },
        },
      },

      finalCta: {
        kind: "group",
        label: "The last word",
        fields: {
          eyebrow: { kind: "text", label: "Small label" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingB: { kind: "text", label: "…and its italic second line", width: "half" },
          body: { kind: "textarea", label: "The paragraph" },
          ctaLabel: { kind: "text", label: "Button" },
        },
      },

      faq: {
        kind: "group",
        label: "Questions",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          heading: { kind: "text", label: "Heading", width: "half" },
          items: {
            kind: "repeatable",
            label: "Questions",
            fields: {
              question: { kind: "text", label: "Question" },
              answer: { kind: "textarea", label: "Answer" },
            },
          },
        },
      },

      tickets: {
        kind: "group",
        label: "Tickets",
        help: "Prices and tiers come from the event. People buy without leaving the site.",
        fields: {
          ctaLabel: { kind: "text", label: "What the buttons say", width: "half" },
          stickyLabel: { kind: "text", label: "…and the bar at the bottom", width: "half" },
          perks: { kind: "textarea", label: "What a ticket includes", optional: true, help: "One per line." },
          note: { kind: "textarea", label: "Small print", optional: true, help: "Age limits, refunds, door times." },
          phone: { kind: "text", label: "A number to ring", optional: true, width: "half" },
          soldOutMessage: { kind: "text", label: "When they've all gone", width: "half" },
          ticketing: {
            kind: "group",
            label: "Where people buy",
            help: "Change this and every ticket button on the site follows \u2014 the header, the hero, the bar at the bottom, all of them.",
            fields: {
              mode: {
                kind: "select",
                label: "Tickets are sold",
                options: [
                  { value: "onSite", label: "On this site" },
                  { value: "eventPage", label: "On your {{app_name}} event page" },
                  { value: "external", label: "Somewhere else" },
                ],
                help: "On this site takes payment here. Your event page sends people to the ticket page {{app_name}} already hosts. Somewhere else links out to whoever is selling.",
              },
              eventPageUrl: {
                kind: "url",
                label: "Your event page",
                optional: true,
                visibleWhen: { field: "mode", equals: "eventPage" },
                help: "Leave empty to use the events page on your church website.",
              },
              sellerName: {
                kind: "text",
                label: "Who sells them",
                width: "half",
                optional: true,
                visibleWhen: { field: "mode", equals: "external" },
                help: "Eventbrite, the venue box office \u2014 the name on the button.",
              },
              sellerUrl: {
                kind: "url",
                label: "\u2026and where",
                width: "half",
                optional: true,
                visibleWhen: { field: "mode", equals: "external" },
              },
              secondSellerName: {
                kind: "text",
                label: "A second outlet",
                width: "half",
                optional: true,
                visibleWhen: { field: "mode", equals: "external" },
                help: "For VIP or accessible seating sold separately. Leave empty if there is only one.",
              },
              secondSellerUrl: {
                kind: "url",
                label: "\u2026and where",
                width: "half",
                optional: true,
                visibleWhen: { field: "mode", equals: "external" },
              },
            },
          },
        },
      },

      socialLinks: {
        kind: "repeatable",
        label: "Social links",
        help: "Leave empty to use the accounts on your church profile. Add rows here when the event has its own — any platform, in the order you want them shown.",
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

      footer: {
        kind: "group",
        label: "Footer",
        fields: {
          organisation: { kind: "text", label: "Who runs it", help: "Defaults to your church name." },
          description: { kind: "textarea", label: "The paragraph" },
          legal: {
            kind: "repeatable",
            label: "Small links",
            fields: {
              label: { kind: "text", label: "Label", width: "half" },
              href: { kind: "link", label: "Goes to", width: "half" },
            },
          },
        },
      },

      nav: {
        kind: "group",
        label: "Navigation",
        fields: {
          stickyHeader: {
            kind: "boolean",
            label: "Menu follows the page",
            help: "Off means it scrolls away with everything else.",
          },
          showTicketBar: {
            kind: "boolean",
            label: "Ticket button always visible",
            help: "A small button that stays at the bottom of the screen.",
          },
        },
      },

      effects: {
        kind: "group",
        label: "Motion",
        fields: {
          embers: {
            kind: "boolean",
            label: "Drifting embers",
            help: "A few points of warm light behind the opening, the three invitations and the last section. Off for anyone who asks for less movement.",
          },
          scrollReveals: {
            kind: "boolean",
            label: "Sections fade in",
            help: "Off means everything is simply there as you reach it.",
          },
        },
      },
    },

    /* Ordered as someone fills it in: what the site is, then the page top to
       bottom, then how people pay, then the look. Arrays, because jsonb does
       not preserve object key order. */
    layout: {
      tabs: [
        {
          id: "event",
          title: "Event",
          description: "Which conference this site is for, and the words that open it.",
          groups: [
            { fields: ["featuredEvent"] },
            { title: "Opening", fields: ["hero"] },
            { title: "Statement", fields: ["manifesto"] },
          ],
        },
        {
          id: "page",
          title: "The page",
          description: "Everything between the opening and the footer, in the order it appears.",
          groups: [
            { fields: ["stages", "scripture", "speakers"] },
            { fields: ["days", "venue", "experience"] },
            { fields: ["stories", "finalCta", "faq"] },
          ],
        },
        {
          id: "tickets",
          title: "Tickets",
          description: "How people buy, and what the buttons say.",
          groups: [{ fields: ["tickets"] }],
        },
        {
          id: "chrome",
          title: "Footer & menu",
          groups: [{ title: "Social links", fields: ["socialLinks"] }, { fields: ["footer", "nav", "effects"] }],
        },
      ],
    },
  },

  data: [
    { source: "events", as: "event", description: "The conference this site is for" },
    { source: "siteSettings", as: "church", description: "Name, logo, socials" },
  ],
});
