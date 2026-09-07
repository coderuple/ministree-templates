import { defineMinistreeTemplate } from "@ministree/template-sdk";
import { site } from "./src/config/site";

/**
 * FIRE — the manifest Ministree reads to build a church's Customizer.
 *
 * A single-event template: the whole site is one conference. Everything
 * factual — dates, venue, speakers, schedule, tickets — comes from the event
 * the church picks, so this declares only the words around it.
 *
 * One colour scheme, deliberately. Fire's single ground is dark — that is its
 * :root, not a dark mode. There is no light variant of this concept, and
 * inventing one would be a second design.
 */
export default defineMinistreeTemplate({
  meta: {
    name: "Fire",
    author: "{{app_name}}",
    version: "1.0.0",
    description:
      "An atmospheric conference template. One unbroken composition that warms from smoke to gold as you scroll, threaded on a single ribbon of light.",
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
    /* Dark, and only dark. No token declares a darkDefault, so `:root` and
       the dark block resolve to the same values and the page renders the same
       either way — this says what the template IS rather than leaving a
       church's gallery describing a near-black site as "light". */
    colorSchemes: ["dark"],
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
      default: "#100b0c",
      label: "Ground",
      description: "The smoke the whole page sits on, before it warms.",
    },
    {
      name: "--ink",
      type: "color",
      default: "#f5ede1",
      label: "Text",
      description: "Warm ivory. Headlines and body copy; captions are dimmer mixes of it.",
    },
    {
      name: "--accent",
      type: "color",
      default: "#e2762c",
      maps: "--color-primary",
      label: "Ember",
      description:
        "Buttons, small labels and the warmest part of the atmosphere. Pick your brand colour here if you want it carried through.",
    },
    {
      name: "--gold",
      type: "color",
      default: "#e8c79a",
      maps: "--color-accent",
      label: "Champagne",
      description: "Italic lines, hairline rings and the top of the ribbon of light.",
    },
    {
      name: "--oxblood",
      type: "color",
      default: "#4a1721",
      label: "Deep tone",
      description:
        "The floor of the atmosphere and the bottom of the ribbon. Deliberately not your brand colour: it is a shadow, and a bright one washes the whole effect out.",
    },
    {
      name: "--font-display",
      type: "font",
      control: "fontFamily",
      default: "var(--font-instrument), Georgia, serif",
      label: "Display font",
      description: "Headlines, day numerals and the italic lines.",
    },
    {
      name: "--font-body",
      type: "font",
      control: "fontFamily",
      default: "var(--font-schibsted), system-ui, sans-serif",
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
      id: "wind",
      label: "Wind",
      description: "The original. Smoke warming to ember and champagne.",
      tokens: {
        "--bg": "#100b0c",
        "--ink": "#f5ede1",
        "--accent": "#e2762c",
        "--gold": "#e8c79a",
        "--oxblood": "#4a1721",
      },
    },
    {
      id: "tide",
      label: "Tide",
      description: "The same atmosphere at sea — deep teal warming to sand.",
      tokens: {
        "--bg": "#08110f",
        "--ink": "#e9f0ea",
        "--accent": "#2f9c8a",
        "--gold": "#d8c9a3",
        "--oxblood": "#123a3a",
      },
    },
    {
      id: "vigil",
      label: "Vigil",
      description: "Candlelight in a dark room. Violet shadow, warm flame.",
      tokens: {
        "--bg": "#0d0a14",
        "--ink": "#f2ecf5",
        "--accent": "#e0a038",
        "--gold": "#efd9a8",
        "--oxblood": "#2d1b46",
      },
    },
  ],

  /* next/font resolves at build time, so these two are the only faces that
     can render. The picker offers exactly them — offering a church a face
     nobody compiled in is offering them a button that silently falls back. */
  fonts: [
    { family: "Instrument Serif", value: "var(--font-instrument), Georgia, serif" },
    { family: "Schibsted Grotesk", value: "var(--font-schibsted), system-ui, sans-serif" },
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
          scrollLabel: { kind: "text", label: "The sideways scroll cue", optional: true },
          pullQuoteRef: { kind: "text", label: "…where it's from", optional: true },
          image: {
            kind: "media",
            label: "Behind the words",
            optional: true,
            help: "A loop or a still of fabric lifting in wind, backlit. It fills a circle at the centre of the screen, so keep the subject central.",
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
          image: { kind: "media", label: "Picture", optional: true, help: "Cropped to a soft organic shape." },
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
          images: {
            kind: "media",
              help: "One picture each, in order: CATCH \u2014 a single point of light in the dark. REKINDLE \u2014 embers breathed back to life. FAN \u2014 flame carried on the wind, wide.",
            multiple: true,
            max: 3,
            label: "One picture each",
            optional: true,
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
                help: "Something from that day, cropped to a circle \u2014 doors opening, hands raised in low light, the room full in daylight.",
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
            help: "The room \u2014 wide, warm, filling up. Cropped to a circle.",
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
            help: "Five circles, one per word: worship, prayer, sisterhood, encounter, renewal.",
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
            help: "Four portraits, in this order: 1) someone in their twenties. 2) someone in their sixties. 3) a teenager, natural light. 4) two generations together. They overlap into one group, so plain backgrounds work best.",
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
