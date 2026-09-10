import { defineMinistreeTemplate } from "@ministree/template-sdk";
import { site } from "./src/config/site";

/**
 * IVORY — the manifest Ministree reads to build a church's Customizer.
 *
 * A single-event template: the whole site is one conference. Everything
 * factual — dates, venue, speakers, schedule, tickets — comes from the event
 * the church picks, so this declares only the words around it.
 *
 * One colour scheme, deliberately. Ivory is ink on bone with crimson blocks;
 * there is no dark variant of it, and inventing one would be a second design.
 */
export default defineMinistreeTemplate({
  meta: {
    name: "Ivory",
    author: "{{app_name}}",
    version: "1.0.0",
    description:
      "A conference template set like a fashion title's March issue. Didone display type, hard colour blocking, and three panels that move sideways as you scroll down.",
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
      default: "#ede7df",
      label: "Page",
      description: "The bone the whole issue is printed on.",
    },
    {
      name: "--ink",
      type: "color",
      default: "#171310",
      label: "Ink",
      description:
        "Text, the menu bar, and the first of the three panels. Body copy is a lighter mix of it.",
    },
    {
      name: "--accent",
      type: "color",
      default: "#8e1f2b",
      maps: "--color-primary",
      label: "Crimson",
      description:
        "The block behind the opening word, the second panel, and the closing section. Pick your brand colour here if you want it carried through.",
    },
    {
      name: "--gold",
      type: "color",
      default: "#c99a45",
      maps: "--color-accent",
      label: "Gold",
      description: "Small labels, the menu button and the italic lines.",
    },
    {
      name: "--orange",
      type: "color",
      default: "#d2601a",
      label: "Burnt orange",
      description: "The third panel and the last day. The warmest thing on the page.",
    },
    {
      name: "--font-display",
      type: "font",
      control: "fontFamily",
      default: "var(--font-bodoni), Didot, serif",
      label: "Display font",
      description: "The opening word, headings and the day numerals.",
    },
    {
      name: "--font-body",
      type: "font",
      control: "fontFamily",
      default: "var(--font-archivo), system-ui, sans-serif",
      label: "Body font",
      description: "Navigation, labels, buttons and body copy.",
    },
    /* No corner-rounding token, deliberately. Every edge in this concept is
       square — buttons, panels, photographs — and rounding any one of them is
       the single change that stops it reading as a printed page. A church who
       wants soft corners wants Alabaster. */
    {
      name: "--hero-photo",
      type: "length",
      control: "opacity",
      default: "1",
      label: "Opening photo strength",
      description:
        "How much the photo behind the opening shows through. Drag left to fade it back so the words lead, right for the photo at full strength.",
    },
  ],

  presets: [
    {
      id: "issue",
      label: "Issue",
      description: "The original. Bone, ink, crimson and burnt orange.",
      tokens: {
        "--bg": "#ede7df",
        "--ink": "#171310",
        "--accent": "#8e1f2b",
        "--gold": "#c99a45",
        "--orange": "#d2601a",
      },
    },
    {
      id: "press",
      label: "Press",
      description: "Newsprint and a single red. The loudest of the three.",
      tokens: {
        "--bg": "#e8e6e1",
        "--ink": "#111111",
        "--accent": "#c8102e",
        "--gold": "#8a8378",
        "--orange": "#e4572e",
      },
    },
    {
      id: "atlantic",
      label: "Atlantic",
      description: "Deep blue blocks against warm paper.",
      tokens: {
        "--bg": "#eae6dd",
        "--ink": "#12161f",
        "--accent": "#1f3a63",
        "--gold": "#b08d4f",
        "--orange": "#c66a2e",
      },
    },
  ],

  /* next/font resolves at build time, so these two are the only faces that
     can render. The picker offers exactly them — offering a church a face
     nobody compiled in is offering them a button that silently falls back. */
  fonts: [
    { family: "Bodoni Moda", value: "var(--font-bodoni), Didot, serif" },
    { family: "Archivo", value: "var(--font-archivo), system-ui, sans-serif" },
  ],

  content: {
    defaults: site,
    fields: {
      eventSource: {
        kind: "select",
        label: "Where do the details come from?",
        options: [
          { value: "event", label: "An event, exactly as it is" },
          { value: "eventTweaked", label: "An event, with some details changed" },
          { value: "manual", label: "I’ll type them myself" },
        ],
        help: "Picking an event keeps this site in step with Events and lets people buy tickets here. Typing them yourself is for an event that isn’t in Events yet — nobody can buy tickets on this site then, so say where they can in the Tickets tab.",
      },

      featuredEvent: {
        kind: "entity",
        module: "events",
        visibleWhen: { field: "eventSource", in: ["event", "eventTweaked"] },
        label: "Which event?",
        help: "The whole site is built from this one — its dates, venue, speakers and tickets.",
      },

      issue: {
        kind: "group",
        label: "The masthead line",
        help: "The small bar under the menu, the way a magazine prints its issue.",
        fields: {
          label: { kind: "text", label: "Left", width: "half" },
          number: { kind: "text", label: "Middle", width: "half" },
        },
      },

      marquee: {
        kind: "group",
        label: "Moving strip",
        fields: {
          enabled: { kind: "boolean", label: "Show it" },
          phrases: { kind: "textarea", label: "Phrases", help: "One per line. They loop." },
        },
      },

      eventDetails: {
        kind: "group",
        label: "The details",
        visibleWhen: { field: "eventSource", in: ["eventTweaked", "manual"] },
        help: "With an event picked, an empty box keeps saying what the event says, and a filled one says yours instead — the event itself is never changed. Typing them yourself, an empty box is simply left off the site.",
        fields: {
          title: {
            kind: "text",
            label: "What it’s called",
            width: "half",
            optional: true,
            help: "Typing the details yourself? The site switches over to them once this has something in it.",
          },
          dateLabel: {
            kind: "text",
            label: "Word the dates",
            width: "half",
            optional: true,
            help: "“October 2027, exact dates on release”. Printed in place of the dates below.",
          },
          startAt: {
            kind: "date",
            label: "Starts",
            width: "half",
            optional: true,
            help: "The dates printed on the site, and anything counting down to them.",
          },
          endAt: { kind: "date", label: "Ends", width: "half", optional: true, help: "Leave it empty for a one-day event." },
          description: {
            kind: "textarea",
            label: "Describe it",
            optional: true,
            help: "Used for search results and share cards.",
          },
          venue: {
            kind: "group",
            label: "Venue",
            help: "Useful when the room is not announced yet, or the event is filed at your office address.",
            fields: {
              name: { kind: "text", label: "Where", width: "half", optional: true },
              city: { kind: "text", label: "Town or city", width: "half", optional: true },
              address: { kind: "text", label: "Full address", optional: true, help: "Printed exactly as you type it." },
              directionsUrl: {
                kind: "url",
                label: "Map link",
                optional: true,
                help: "Empty builds one from the name and address.",
              },
            },
          },
          days: {
            kind: "repeatable",
            label: "The dates",
            help: "One row is one day, and the first row replaces all of them. A row with no times shows just the date.",
            fields: {
              date: { kind: "date", label: "Date", width: "half" },
              time: { kind: "text", label: "Times", width: "half", optional: true, help: "“Doors 6:30 · starts 7:30”. Anything you like." },
            },
          },
          speakers: {
            kind: "repeatable",
            label: "The lineup",
            help: "The first row replaces the whole lineup, so list everyone you want shown.",
            fields: {
              name: { kind: "text", label: "Name", width: "half" },
              role: { kind: "text", label: "What they do", width: "half", optional: true },
              image: { kind: "media", label: "Portrait", optional: true },
              bio: { kind: "textarea", label: "About them", optional: true },
            },
          },
        },
      },

      eventTicketNames: {
        kind: "repeatable",
        label: "What the tickets are called",
        visibleWhen: { field: "eventSource", equals: "eventTweaked" },
        help: "In the same order as the event’s tickets — the first row renames the first one. Wording only: people are charged the event’s price, and their ticket keeps the event’s name.",
        fields: {
          name: { kind: "text", label: "Name", width: "half", optional: true },
          description: { kind: "text", label: "What it includes", width: "half", optional: true },
        },
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
          secondaryHref: { kind: "link", label: "\u2026goes to", width: "half", optional: true, help: "Empty scrolls to the About section." },
          intro: { kind: "textarea", label: "The paragraph at the bottom", optional: true },
          pullQuoteRef: {
            kind: "text",
            label: "Scripture, set sideways",
            optional: true,
            help: "Runs vertically down the right edge. Hidden on a phone.",
          },
          image: {
            kind: "media",
            label: "Behind the words",
            optional: true,
            help: "Cover portrait \u2014 direct gaze, crimson grade, cropped at the shoulders. The headline crosses it, so keep the face high.",
          },
        },
      },

      manifesto: {
        kind: "group",
        label: "Opening statement",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          marker: { kind: "text", label: "Numeral", width: "half", optional: true, help: "Such as \u201cI \u2014 Manifesto\u201d." },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "Heading" },
          headingB: { kind: "text", label: "…and its italic second line", optional: true },
          lede: { kind: "textarea", label: "Opening paragraph", optional: true, help: "Its first letter is set as a drop cap." },
          body: {
            kind: "textarea",
            label: "The rest",
            optional: true,
            help: "A blank line starts a new paragraph. Left empty, the event's own description is used.",
          },
          pullLine: { kind: "text", label: "Pull quote", optional: true },
          image: {
            kind: "media",
            label: "Picture",
            optional: true,
            help: "Editorial portrait \u2014 hard crop, face at the frame edge.",
          },
          insetImage: {
            kind: "media",
            label: "The square one",
            optional: true,
            help: "A detail: hands, crimson grade.",
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
          images: {
            kind: "media",
              help: "One picture each, in order: CATCH \u2014 stepping into light, dark surround. REKINDLE \u2014 a turn of the head, crimson grade. FAN \u2014 walking into frame, burnt orange.",
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
          marker: { kind: "text", label: "Numeral", width: "half", optional: true },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingB: { kind: "text", label: "…and its italic second line", width: "half", optional: true },
          note: {
            kind: "text",
            label: "The line underneath",
            optional: true,
            help: "Such as \u201cTwo further speakers announced this autumn.\u201d",
          },
        },
      },

      days: {
        kind: "group",
        label: "The days",
        help: "Dates and times come from the event's own dates. What each day is called is up to you.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          marker: { kind: "text", label: "Numeral", width: "half", optional: true },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "Heading", width: "half" },
          headingEm: { kind: "text", label: "…its italic word", width: "half", optional: true },
          headingB: { kind: "text", label: "…and the rest", optional: true },
          beats: {
            kind: "repeatable",
            label: "What each day is called",
            help: "In the same order as the event's dates. A day with no row here still shows its date; rows beyond the event's dates are not shown.",
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
        help: "The address comes from the event; this is the wording around it. Shown when the event has a venue, or when you add pictures here.",
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
          marker: { kind: "text", label: "Numeral", width: "half", optional: true },
          eyebrow: { kind: "text", label: "Small label", width: "half" },
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
            help: "Four frames for the contact strip, in this order: 1) worship, hard crop, eyes closed. 2) two people talking, natural laughter. 3) hands open on an open Bible. 4) walking into frame, backlit.",
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
            max: 3,
            label: "Faces",
            optional: true,
            help: "Three portraits, in this order: 1) someone in their twenties. 2) someone in their sixties. 3) two generations together.",
          },
        },
      },

      finalCta: {
        kind: "group",
        label: "The last word",
        fields: {
          eyebrow: { kind: "text", label: "Small label" },
          lineOne: { kind: "text", label: "First line", width: "half" },
          lineTwo: { kind: "text", label: "Second line", width: "half" },
          lineThree: { kind: "text", label: "Third line, in italic" },
          watermark: {
            kind: "text",
            label: "The number behind it",
            width: "half",
            optional: true,
            help: "Set enormous and barely visible. Two characters at most.",
          },
          ctaLabel: { kind: "text", label: "Button", width: "half" },
        },
      },

      faq: {
        kind: "group",
        label: "Questions",
        help: "The section appears once it has at least one question.",
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
          soldOutMessage: {
            kind: "text",
            label: "When they've all gone",
            width: "half",
            visibleWhen: { field: "ticketing.mode", equals: "onSite" },
          },
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
          logo: {
            kind: "media",
            label: "Your own logo",
            optional: true,
            help: "Sits in the header in place of the church's logo. Leave it empty to use the church's own \u2014 or the conference name, if the church has none.",
          },
          favicon: {
            kind: "media",
            label: "Browser tab icon",
            optional: true,
            help: "The little square in the browser tab. A square PNG works best. Leave it empty to use the church's.",
          },
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
            { fields: ["eventSource", "featuredEvent"] },
            { title: "The details", fields: ["eventDetails", "eventTicketNames"] },
            { title: "Opening", fields: ["hero", "issue"] },
            { title: "Statement", fields: ["manifesto", "marquee"] },
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
