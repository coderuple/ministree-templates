import { defineMinistreeTemplate } from "@ministree/template-sdk";
import { site } from "./src/config/site";

/**
 * JUDAH — the manifest {{app_name}} reads to build a church's Customizer.
 *
 * A single-event template: the whole site is one conference. Everything
 * factual — dates, venue, speakers, schedule, tickets — comes from the event
 * the church picks, so this declares the words around it, plus the one group
 * that lets a church say something different from the record where they have
 * to.
 *
 * Light by default — cream paper, near-black ink, oxide red and ochre gold —
 * with the original near-black as the dark scheme. The church picks one in
 * the Customizer (`scheme`, or Automatic) and each visitor can override it
 * from the header; the stillness, the tape interruption, the film,
 * the index and the footer stay dark bands in both.
 */
/* The same three controls on every photo scene — the opening, the tape
   stopping and the film. A function so each scene can say in its own words
   what the overlay is doing there. */
const overlayGroup = (help: string) => ({
  kind: "group" as const,
  label: "Overlay on the photo",
  help,
  fields: {
    strength: {
      kind: "choice" as const,
      control: "opacity" as const,
      label: "Strength",
      help: "Left lets the photo through; right covers it. Keep enough that the words on top stay readable.",
    },
    colour: {
      kind: "select" as const,
      label: "Colour",
      width: "half" as const,
      options: [
        { value: "ground", label: "The scene's own ground" },
        { value: "black", label: "Black" },
        { value: "signal", label: "Your signal colour" },
        { value: "custom", label: "A colour of your own" },
      ],
    },
    customColour: {
      kind: "color" as const,
      label: "Your colour",
      width: "half" as const,
      optional: true,
      visibleWhen: { field: "colour", equals: "custom" },
    },
    fade: {
      kind: "select" as const,
      label: "Shape",
      options: [
        { value: "edges", label: "Heavier at the top and bottom (as designed)" },
        { value: "bottom", label: "Heavier at the bottom" },
        { value: "even", label: "Even all over" },
      ],
    },
    text: {
      kind: "select" as const,
      label: "Text on top",
      width: "half" as const,
      options: [
        { value: "auto", label: "Automatic — whatever reads on the overlay" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "custom", label: "A colour of your own" },
      ],
      help: "Automatic turns the text light on a dark overlay and dark on a light one.",
    },
    textColour: {
      kind: "color" as const,
      label: "Your text colour",
      width: "half" as const,
      optional: true,
      visibleWhen: { field: "text", equals: "custom" },
    },
  },
});

export default defineMinistreeTemplate({
  meta: {
    name: "Judah",
    author: "{{app_name}}",
    version: "1.0.0",
    description:
      "A conference site that plays backwards. The reader arrives inside the noise, the tape catches, and every scroll winds the record further back — through your own archive, through scripture, to one line in Genesis. Built for a men's conference.",
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
    colorSchemes: ["light", "dark"],
    features: ["ticketing"],
  },

  /* Six colours. Every hairline, scrim, scanline and dim in the stylesheet is
     mixed from these, so a church that changes the ground gets a page that
     still agrees with itself rather than one rule left behind at the old hue.
     Exposing all twenty of the design's literals would let a church take the
     page apart; these six cannot make it unreadable. */
  tokens: [
    {
      name: "--bg",
      type: "color",
      default: "#f3ecdf",
      darkDefault: "#090807",
      label: "Ground",
      description: "What the whole page sits on — cream paper, or near-black in the dark look.",
    },
    {
      name: "--ink",
      type: "color",
      default: "#17130f",
      darkDefault: "#e7dccb",
      label: "Text",
      description: "Headlines and body copy; the small labels are dimmer mixes of it.",
    },
    {
      name: "--flare",
      type: "color",
      default: "#be331e",
      darkDefault: "#e5533b",
      maps: "--color-primary",
      label: "Signal",
      description:
        "Every ticket button, the tape marker, and the ground of the last band on the page. Pick your brand colour here if you want it carried through.",
    },
    {
      name: "--gold",
      type: "color",
      default: "#b8862b",
      darkDefault: "#d4a24a",
      label: "Accent",
      description:
        "The second colour: italic words in the big lines, the small labels, and the rules over the facts.",
    },
    {
      name: "--panel",
      type: "color",
      default: "#e9dfcb",
      darkDefault: "#14100c",
      label: "Warm band",
      description:
        "The alternate ground the flat sections sit on. Keep it close to the ground — the rhythm is meant to be felt rather than seen.",
    },
    {
      name: "--deep",
      type: "color",
      default: "#17130f",
      darkDefault: "#050403",
      label: "Deep tone",
      description:
        "The dark bands: the stillness, the tape stopping, the film, the index and the footer. Dark in both looks — the type on it is always light. Deliberately not your brand colour.",
    },
    {
      name: "--font-display",
      type: "font",
      control: "fontFamily",
      default: "var(--font-newsreader), Georgia, serif",
      label: "Display font",
      description: "The verses, the year, and the big words.",
    },
    {
      name: "--font-condensed",
      type: "font",
      control: "fontFamily",
      default: "var(--font-barlow), 'Helvetica Neue', sans-serif",
      label: "Headline font",
      description: "The shouted lines and the section headings, all uppercase.",
    },
    {
      name: "--font-mono",
      type: "font",
      control: "fontFamily",
      default: "var(--font-plex-mono), ui-monospace, monospace",
      label: "Label font",
      description:
        "Every small label, caption and timecode. This is the voice of the tape machine — changing it changes the whole feel.",
    },
    /* Two corners, not one: square photographs with pill buttons is the most
       common thing a church will want, and one control can't say it. Both
       start square — hard edges are the design. Full-width bands, the header,
       the phone ticket bar and the rules never round, whatever these say. */
    {
      name: "--radius-button",
      type: "length",
      control: "cornerRadius",
      default: "0px",
      label: "Button shape",
      description:
        "How round the buttons are — every ticket button, the menu and light/dark buttons, and the checkout's fields. Square, rounded, or all the way to a pill.",
    },
    {
      name: "--radius",
      type: "length",
      control: "cornerRadius",
      default: "0px",
      label: "Corner rounding",
      description:
        "How round the photographs and cards are — the archive reel, the contact sheet, the speakers, the venue and the checkout's boxes.",
    },
  ],

  /* Each preset carries both looks, so switching Light/Dark never pairs one
     scheme's ground with the other's ink. */
  presets: [
    {
      id: "rewind",
      label: "Rewind",
      description: "The original. Cream paper and oxide red; near-black in the dark look.",
      tokens: {
        "--bg": { light: "#f3ecdf", dark: "#090807" },
        "--ink": { light: "#17130f", dark: "#e7dccb" },
        "--flare": { light: "#be331e", dark: "#e5533b" },
        "--gold": { light: "#b8862b", dark: "#d4a24a" },
        "--panel": { light: "#e9dfcb", dark: "#14100c" },
        "--deep": { light: "#17130f", dark: "#050403" },
      },
    },
    {
      id: "signal",
      label: "Signal",
      description: "The same tape, colder. Blue-grey paper and a broadcast cyan.",
      tokens: {
        "--bg": { light: "#eef2f4", dark: "#06080b" },
        "--ink": { light: "#0e1419", dark: "#dfe6ea" },
        "--flare": { light: "#19708a", dark: "#3ba7c4" },
        "--gold": { light: "#a87a28", dark: "#d4a24a" },
        "--panel": { light: "#e1e8ec", dark: "#0d1319" },
        "--deep": { light: "#0e1419", dark: "#030507" },
      },
    },
    {
      id: "ledger",
      label: "Ledger",
      description: "Warm paper, warm ink and a brass mark.",
      tokens: {
        "--bg": { light: "#f4eee2", dark: "#0b0a08" },
        "--ink": { light: "#1a1610", dark: "#ece3d2" },
        "--flare": { light: "#8a5f1c", dark: "#c79340" },
        "--gold": { light: "#a8311c", dark: "#e5533b" },
        "--panel": { light: "#e9e0ce", dark: "#171410" },
        "--deep": { light: "#1a1610", dark: "#050403" },
      },
    },
  ],

  /* next/font resolves at build time, so these three are the only faces that
     can render. The picker offers exactly them — offering a church a face
     nobody compiled in is offering them a button that silently falls back. */
  fonts: [
    { family: "Newsreader", value: "var(--font-newsreader), Georgia, serif" },
    { family: "Barlow Condensed", value: "var(--font-barlow), 'Helvetica Neue', sans-serif" },
    { family: "IBM Plex Mono", value: "var(--font-plex-mono), ui-monospace, monospace" },
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
              image: { kind: "media", label: "Portrait", optional: true, help: "Shot tall. Cropped to a 3:4 frame." },
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
        label: "The opening",
        help: "The reader lands inside the noise. Everything here is what they have to scroll out of.",
        fields: {
          wordmark: {
            kind: "text",
            label: "The mark in the corner",
            width: "half",
            help: "Short. It sits top-left the whole way down and is set in capitals.",
          },
          wordmarkSuffix: {
            kind: "text",
            label: "…and what follows it",
            width: "half",
            optional: true,
            help: "The year, usually. Set dimmer, after a slash.",
          },
          headline: { kind: "text", label: "The question", width: "half", help: "The first line, upright." },
          headlineItalic: {
            kind: "text",
            label: "…and its italic second line",
            width: "half",
            optional: true,
          },
          strapline: {
            kind: "text",
            label: "The line that fades in under it",
            optional: true,
            help: "Set in capitals, in your signal colour, as the noise thins.",
          },
          scrollLabel: { kind: "text", label: "The scroll cue", width: "half", optional: true },
          image: {
            kind: "media",
            label: "Behind the noise",
            optional: true,
            help: "A wide, dark film still — men in low light, faces not quite readable. It fills the screen and everything sits on top, so nothing important should be near the middle. Empty uses the event's own picture. With a video below, this is its still.",
          },
          video: {
            kind: "media",
            accept: "video",
            label: "…or a video behind the noise",
            optional: true,
            help: "A short, silent loop, played over the picture above. Keep it small — it plays on phones too. Anyone who has asked their device for less motion or data sees the picture instead.",
          },
          videoUrl: {
            kind: "url",
            label: "…or a YouTube or Vimeo link",
            optional: true,
            help: "Used only when no video is uploaded. It plays muted and looping, but takes longer to start than an upload, and Vimeo hides its controls only on a paid plan.",
          },
          overlay: overlayGroup(
            "The wash between the picture and the question. As designed it is the page's own ground — cream in the light look, near-black in the dark — so the words read whatever is behind them.",
          ),
          noiseColour: {
            kind: "select",
            label: "Colour of the drifting text",
            width: "half",
            options: [
              { value: "same", label: "Same as the text on top" },
              { value: "signal", label: "Your signal colour" },
              { value: "accent", label: "Your accent colour" },
              { value: "custom", label: "A colour of your own" },
            ],
            help: "The columns that drift up behind the question — the culture's voice, so it can be set apart from yours.",
          },
          noiseCustom: {
            kind: "color",
            label: "Your drifting-text colour",
            width: "half",
            optional: true,
            visibleWhen: { field: "noiseColour", equals: "custom" },
          },
          noise: {
            kind: "repeatable",
            label: "What the culture says",
            help: "Four columns of this drift up the screen and blur as the reader scrolls past. Deliberately not your voice — it is what a man is told everywhere else. Four rows fills the design; fewer leaves gaps.",
            fields: {
              label: { kind: "text", label: "Small print", width: "half", help: "“FEED / 04:11”, “EPISODE 214”. The furniture around the shouting." },
              shout: { kind: "text", label: "The shout", width: "half", help: "Set large and uppercase." },
              serif: { kind: "text", label: "…and a quieter word", optional: true, help: "One word, set in the display face. Leave empty for none." },
            },
          },
        },
      },

      tension: {
        kind: "group",
        label: "The tape catches",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          badge: { kind: "text", label: "The blinking badge", width: "half", optional: true },
          headingA: { kind: "text", label: "Heading, line one", width: "half" },
          headingB: { kind: "text", label: "…line two", width: "half" },
          headingAccent: {
            kind: "text",
            label: "…and the line in your signal colour",
            width: "half",
            optional: true,
          },
          body: { kind: "textarea", label: "The paragraph under it", optional: true },
          image: {
            kind: "media",
            label: "Behind the words",
            optional: true,
            help: "One man, alone, harshly lit. Darker than the opening — the whole screen is scrimmed almost to black.",
          },
          overlay: overlayGroup("As designed, the dark band's own near-black, so the type stays light on it."),
        },
      },

      archive: {
        kind: "group",
        label: "Your own archive",
        help: "Old footage slides past while the years count backwards. This is the section that makes the site about YOUR church rather than a conference in general.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          eyebrow: { kind: "text", label: "Small label, top left" },
          marks: {
            kind: "repeatable",
            label: "The years, counting back",
            help: "Start with this year and work backwards to the first one you can remember. The number on screen counts down between them as the reader scrolls, so five or six rows is plenty.",
            fields: {
              year: { kind: "text", label: "Year", width: "half" },
              era: { kind: "text", label: "What to call it", width: "half", help: "“THE FIRST CALL”, “BEFORE ANY OF THIS”. Shown top right." },
            },
          },
          captions: {
            kind: "textarea",
            label: "The line under the scrub bar",
            help: "One per line. They are shown in order as the rewind runs — three works well.",
          },
          footer: { kind: "text", label: "…and the line beside it", optional: true },
          frames: {
            kind: "repeatable",
            label: "The footage",
            help: "Five frames slide past, in the shapes the design sets — wide, tall, wide, square, wide. Real photographs from past years are what this section is for.",
            fields: {
              image: { kind: "media", label: "Picture", optional: true },
              caption: { kind: "text", label: "Caption", width: "half", help: "“MAIN AUDITORIUM”, “WORSHIP / WIDE”." },
              tag: { kind: "text", label: "…and its reference", width: "half", optional: true },
            },
          },
        },
      },

      scripture: {
        kind: "group",
        label: "The descent through scripture",
        help: "One verse at a time, read backwards through the Bible, each cleaner than the last. The books listed across the top are built from the verses below, in the same order.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          verses: {
            kind: "repeatable",
            label: "The verses, last book first",
            help: "The order is the point: the reader is winding back toward the beginning. Eight is the design's own count — more makes the section longer, fewer makes it quicker.",
            fields: {
              book: { kind: "text", label: "Book", width: "half", help: "Shown in the rail across the top. Capitals." },
              quote: { kind: "textarea", label: "The verse" },
              reference: { kind: "text", label: "Reference", width: "half" },
            },
          },
          origin: {
            kind: "text",
            label: "The book it ends on",
            width: "half",
            help: "The last name in the rail — the one that lights as the section hands over. Usually Genesis.",
          },
          footer: { kind: "text", label: "The line at the bottom", width: "half", optional: true },
        },
      },

      stillness: {
        kind: "group",
        label: "The stillness",
        help: "The noise is gone. One line, on black, as a hairline opens into a horizon.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          quote: { kind: "textarea", label: "The line", help: "Line breaks are kept exactly as you type them." },
          quoteItalic: { kind: "text", label: "…and its italic ending", optional: true },
          reference: { kind: "text", label: "Reference", width: "half" },
        },
      },

      standard: {
        kind: "group",
        label: "Naming the conference",
        help: "The first section that scrolls normally, which is what makes it land. The name, dates and venue printed here come from the event.",
        fields: {
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "The big word, line one", width: "half" },
          headingB: { kind: "text", label: "…line two", width: "half" },
          strapline: { kind: "text", label: "The line beside it", help: "Set uppercase. Line breaks are kept." },
          ctaLabel: { kind: "text", label: "Button", width: "half" },
        },
      },

      film: {
        kind: "group",
        label: "Teaser film",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          label: { kind: "text", label: "What it's called", width: "half" },
          note: { kind: "text", label: "…and its small print", width: "half", optional: true },
          image: {
            kind: "media",
            label: "The still",
            optional: true,
            help: "Very wide — the frame is 21:9. A single frame from the film itself works best.",
          },
          overlay: overlayGroup("As designed, the dark band's own near-black, so the title and play button stay light on it."),
          videoUrl: {
            kind: "url",
            label: "Where the film plays",
            optional: true,
            help: "Paste a YouTube or Vimeo address and the still becomes a link. Leave empty and it is just a picture.",
          },
          timecode: { kind: "text", label: "The timecode in the corner", width: "half", optional: true },
        },
      },

      contactSheet: {
        kind: "group",
        label: "Contact sheet",
        help: "Six frames and one wide one, laid out like a strip of negatives.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          heading: { kind: "text", label: "Heading", width: "half" },
          note: { kind: "text", label: "…and its small print", width: "half", optional: true },
          frames: {
            kind: "repeatable",
            label: "The frames",
            help: "Six fills the row. Each is cropped tall, 4:5.",
            fields: {
              image: { kind: "media", label: "Picture", optional: true },
              caption: { kind: "text", label: "Caption", help: "“FRAME 014 · 2019”. Kept short." },
            },
          },
          wideImage: {
            kind: "media",
            label: "The wide one underneath",
            optional: true,
            help: "Very wide — 32:9. A full room, seen from the back.",
          },
          wideCaption: { kind: "text", label: "…and its caption", optional: true },
        },
      },

      facts: {
        kind: "group",
        label: "When, where, who, how much",
        help: "Four columns. Three of them read from the event — you write the labels and the sentence under each.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          whenLabel: { kind: "text", label: "First column's label", width: "half" },
          whenNote: { kind: "text", label: "…and the line under the dates", width: "half", optional: true },
          whereLabel: { kind: "text", label: "Second column's label", width: "half" },
          whereNote: {
            kind: "text",
            label: "…and the line under the venue",
            width: "half",
            optional: true,
            help: "Only used when the event has no address of its own.",
          },
          whoLabel: { kind: "text", label: "Third column's label", width: "half" },
          whoHeading: { kind: "text", label: "…who it's for", width: "half" },
          whoNote: { kind: "text", label: "…and the line under that", optional: true },
          ticketsLabel: { kind: "text", label: "Fourth column's label", width: "half" },
          ticketsNote: { kind: "text", label: "…and the line under the price", width: "half", optional: true },
        },
      },

      speakers: {
        kind: "group",
        label: "The voices",
        help: "The people come from the event itself — add them in Events, not here.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          heading: { kind: "text", label: "Heading", width: "half" },
          note: {
            kind: "text",
            label: "…what to say before anyone is announced",
            width: "half",
            optional: true,
            help: "Only shown while the event has nobody on it yet.",
          },
        },
      },

      experience: {
        kind: "group",
        label: "What it's like",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          heading: { kind: "text", label: "Heading" },
          items: {
            kind: "repeatable",
            label: "The rows",
            help: "Numbered automatically, in the order you put them.",
            fields: {
              title: { kind: "text", label: "What it is", width: "half" },
              body: { kind: "text", label: "…and what happens", width: "half" },
            },
          },
        },
      },

      venue: {
        kind: "group",
        label: "Venue",
        help: "The address comes from the event; this is the wording around it. Shown when the event has a venue, or when you add a picture here.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          label: { kind: "text", label: "Small label", width: "half" },
          image: { kind: "media", label: "Picture", optional: true, help: "The room, or a map. Cropped to 4:3." },
          note: { kind: "textarea", label: "Anything worth knowing", optional: true },
        },
      },

      faq: {
        kind: "group",
        label: "Questions",
        help: "Sits beside the venue. The section appears once it has at least one question.",
        fields: {
          enabled: { kind: "boolean", label: "Show this section" },
          label: { kind: "text", label: "Small label", width: "half" },
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

      register: {
        kind: "group",
        label: "The last word",
        help: "The one loud band on the whole site. The dates printed here come from the event.",
        fields: {
          eyebrow: { kind: "text", label: "Small label", width: "half" },
          headingA: { kind: "text", label: "The big word, line one", width: "half" },
          headingB: { kind: "text", label: "…line two", width: "half" },
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
            help: "Change this and every ticket button on the site follows — the header, the standard, the last band, the bar at the bottom, all of them.",
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
                help: "Eventbrite, the venue box office — the name on the button.",
              },
              sellerUrl: {
                kind: "url",
                label: "…and where",
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
                label: "…and where",
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
        help: "Leave empty to use the accounts on your church profile. Add rows here when the conference has its own — any platform, in the order you want them shown.",
        fields: {
          label: {
            kind: "text",
            label: "Which one",
            width: "half",
            help: "Instagram, TikTok, WhatsApp — whatever it is. This is the wording people see.",
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
          tagline: { kind: "text", label: "The line under it", optional: true },
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

      scheme: {
        kind: "select",
        label: "Light or dark",
        options: [
          { value: "light", label: "Light — cream paper, dark type" },
          { value: "dark", label: "Dark — the original near-black" },
          { value: "auto", label: "Automatic — follows each visitor's device" },
        ],
        help: "What a visitor sees first. They can switch it with the button in the header, and their device remembers their pick. The stillness, the film, the menu and the footer stay dark in both.",
      },

      nav: {
        kind: "group",
        label: "Header & index",
        fields: {
          logo: {
            kind: "media",
            label: "Your own logo",
            optional: true,
            help: "Sits in the header in place of the wordmark, on the page's own ground — so in the light look it needs to read on cream. Leave it empty to use the wordmark.",
          },
          favicon: {
            kind: "media",
            label: "Browser tab icon",
            optional: true,
            help: "The little square in the browser tab. A square PNG works best. Leave it empty to use the church's.",
          },
          menuLabel: { kind: "text", label: "What the menu button says", width: "half" },
          stickyHeader: {
            kind: "boolean",
            label: "Header follows the page",
            help: "It carries the ticket button, so on a computer this keeps tickets one click away. Off means it scrolls away with the opening.",
          },
          showTicketBar: {
            kind: "boolean",
            label: "Ticket bar on phones",
            help: "A full-width ticket button along the bottom of a phone screen, the whole way down. On a computer it only appears when the header doesn't follow the page.",
          },
        },
      },

      effects: {
        kind: "group",
        label: "The look of the film",
        help: "How the site moves, and the three things that make a photograph on it read as footage. Turning those three off leaves the layout intact and the atmosphere gone.",
        fields: {
          motion: {
            kind: "boolean",
            label: "Animations",
            help: "Off stills the whole site: the drifting columns, the tape's flicker and sweep, the blur, the entrances and the slides. Exactly what a visitor gets when their device asks for less motion. The rewind still moves on as you scroll, so every scene is reached in order, and an opening video still plays.",
          },
          grain: { kind: "boolean", label: "Scanlines over everything" },
          vignette: { kind: "boolean", label: "Darkened edges" },
          timecode: { kind: "boolean", label: "Counter in the header", help: "Counts down as the page winds back." },
          scrollReveals: {
            kind: "boolean",
            visibleWhen: { field: "motion", equals: true },
            label: "Sections animate in",
            help: "After the reveal: things rising in, photographs developing, the film growing and the last band's headline sliding together. Off means everything is simply there as you reach it.",
          },
        },
      },
    },

    /* Ordered as someone fills it in: what the site is, then the rewind top to
       bottom, then the conference itself, then how people pay, then the look.
       Arrays, because jsonb does not preserve object key order. */
    layout: {
      tabs: [
        {
          id: "event",
          title: "Event",
          description: "Which conference this site is for, and where its details come from.",
          groups: [
            { fields: ["eventSource", "featuredEvent"] },
            { title: "The details", fields: ["eventDetails", "eventTicketNames"] },
          ],
        },
        {
          id: "rewind",
          title: "The rewind",
          description: "The opening, and everything the reader winds back through to reach the conference.",
          groups: [
            { fields: ["hero", "tension"] },
            { fields: ["archive", "scripture", "stillness"] },
          ],
        },
        {
          id: "conference",
          title: "The conference",
          description: "Everything after the reveal, in the order it appears.",
          groups: [
            { fields: ["standard", "film", "speakers"] },
            { fields: ["contactSheet", "facts", "experience"] },
            { fields: ["venue", "faq", "register"] },
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
          title: "Header, footer & look",
          groups: [
            { fields: ["scheme"] },
            { title: "Social links", fields: ["socialLinks"] },
            { fields: ["nav", "footer", "effects"] },
          ],
        },
      ],
    },
  },

  data: [
    { source: "events", as: "event", description: "The conference this site is for" },
    { source: "siteSettings", as: "church", description: "Name, logo, socials" },
  ],
});
