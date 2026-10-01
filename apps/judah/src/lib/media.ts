/**
 * The decisions behind Judah's photo scenes that are worth checking on their
 * own: what a church's overlay settings become in CSS, which colour the type
 * on top takes, and which YouTube or Vimeo video a pasted link names. Plain
 * functions, so `media.test.ts` runs them without React.
 */

export interface Overlay {
  /** 0–1 as a decimal string — the Customizer's slider. */
  strength: string;
  /** "ground" | "black" | "signal" | "custom" */
  colour: string;
  customColour: string;
  /** "edges" (as designed) | "bottom" | "even" */
  fade: string;
  /** "auto" | "light" | "dark" | "custom" — the type on top. */
  text: string;
  textColour: string;
}

/** Which type a scene sets: light, dark, the red band's, or the church's own. */
export type Ink = "light" | "dark" | "signal" | "custom";

/* What the colour picker gives (hex), or a pasted rgb(). Only these two, so
   every custom colour's lightness can be worked out; anything else is dropped
   rather than written into a style attribute. */
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?$/i;
const RGB = /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*([,/]\s*[\d.]+%?\s*)?\)$/i;

/** sRGB 0–255 channels of a colour these two patterns accept, else null. */
function channels(c: string | undefined): [number, number, number] | null {
  const v = c?.trim() ?? "";
  const hex = v.match(HEX);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((x) => x + x).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = v.match(RGB);
  if (rgb && [rgb[1], rgb[2], rgb[3]].every((x) => Number(x) <= 255)) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

/* WCAG relative luminance. Below 0.175 light type outreads dark on it: that
   is where cream and near-black have equal contrast. */
function isDark([r, g, b]: [number, number, number]): boolean {
  const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) < 0.175;
}

/**
 * Everything a photo scene's root carries for its overlay: `--scrim-a`,
 * `--scrim` and a custom `--ink` as inline variables, the `fade` shape, and
 * which `ink` reads on top.
 *
 * Colour "ground" sets no colour, so the scene keeps its own ground. Text
 * "auto" follows the overlay: light type on black or a dark colour of their
 * own, dark type on a light one, the red band's type on the signal colour —
 * and on "ground", the scene's own type, unchanged.
 */
export function overlayProps(o: Overlay | undefined): {
  style: Record<string, string>;
  fade?: "even" | "bottom";
  ink?: Ink;
} {
  const style: Record<string, string> = {};
  if (!o) return { style };

  const a = Number.parseFloat(o.strength);
  if (Number.isFinite(a)) style["--scrim-a"] = String(Math.min(1, Math.max(0, a)));

  let ink: Ink | undefined;
  const own = o.colour === "custom" ? channels(o.customColour) : null;
  if (o.colour === "black") {
    style["--scrim"] = "#000";
    ink = "light";
  } else if (o.colour === "signal") {
    style["--scrim"] = "var(--flare)";
    ink = "signal";
  } else if (own) {
    style["--scrim"] = o.customColour.trim();
    ink = isDark(own) ? "light" : "dark";
  }

  if (o.text === "light" || o.text === "dark") ink = o.text;
  else if (o.text === "custom" && channels(o.textColour)) {
    style["--ink"] = o.textColour.trim();
    ink = "custom";
  }

  return { style, fade: o.fade === "even" || o.fade === "bottom" ? o.fade : undefined, ink };
}

/**
 * The opening's drifting columns, when a church colours them apart from the
 * question: "same" (or anything unrecognised) leaves them as the text is.
 */
export function noiseInk(choice: string | undefined, custom: string | undefined): string | undefined {
  if (choice === "signal") return "var(--flare-text)";
  if (choice === "accent") return "var(--gold-text)";
  if (choice === "custom" && channels(custom)) return custom!.trim();
  return undefined;
}

/**
 * A YouTube or Vimeo address as a muted, looping, chrome-free background
 * embed — or null. Only the video's id is taken from what the church pasted;
 * the host and every parameter are ours, so the iframe can only ever point at
 * those two players.
 */
export function embedFor(url: string | undefined): string | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    const id = yt[1];
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`;
  }
  /* `background=1` hides Vimeo's controls — on the owner's paid plans only;
     on a free account the player shows them regardless. */
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?background=1&autoplay=1&loop=1&muted=1&dnt=1`;
  return null;
}
