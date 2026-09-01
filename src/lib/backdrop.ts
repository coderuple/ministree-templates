/**
 * The five elements the moving backdrop can be made of.
 *
 * Plain data, deliberately NOT in `EmberScene`: that module is client-only
 * (react-three-fiber), and the server needs to read a church's chosen element
 * to decide what to render. Importing it from there compiled fine and threw
 * "Attempted to call isBackdropElement() from the server" at runtime.
 */
export const BACKDROP_ELEMENTS = {
  fire: {
    label: "Fire",
    u: { fall: 0, speedMin: 0.035, speedMax: 0.13, taper: 1, spread: 1,
         sway: 1, sizeMin: 10, sizeMax: 26, opacity: 1,
         heatBase: 0, heatGain: 1, glow: 1 },
  },
  smoke: {
    // Slow, wide, and dark: no glow, and it never reaches the hot colour.
    label: "Smoke",
    u: { fall: 0, speedMin: 0.012, speedMax: 0.045, taper: 0, spread: 1.25,
         sway: 1.6, sizeMin: 34, sizeMax: 72, opacity: 0.34,
         heatBase: 0.05, heatGain: 0.25, glow: 0.55 },
  },
  embers: {
    // Sparse, bright, long-lived specks drifting up through the dark.
    label: "Embers",
    u: { fall: 0, speedMin: 0.02, speedMax: 0.06, taper: 0.35, spread: 1.7,
         sway: 2.2, sizeMin: 5, sizeMax: 13, opacity: 0.85,
         heatBase: 0.35, heatGain: 0.65, glow: 1.25 },
  },
  dust: {
    // Barely moves. Tiny, even, unlit — the air in a shaft of light.
    label: "Dust",
    u: { fall: 0, speedMin: 0.004, speedMax: 0.016, taper: 0, spread: 2.1,
         sway: 2.6, sizeMin: 3, sizeMax: 8, opacity: 0.42,
         heatBase: 0.45, heatGain: 0.08, glow: 0.8 },
  },
  snow: {
    // The only one that falls. Soft, round, near the hot colour so a warm
    // palette still reads as light rather than as fire.
    label: "Snow",
    u: { fall: 1, speedMin: 0.02, speedMax: 0.055, taper: 0, spread: 2.2,
         sway: 1.1, sizeMin: 12, sizeMax: 26, opacity: 0.6,
         heatBase: 0.95, heatGain: 0.05, glow: 0.9 },
  },
} as const;

export type BackdropElement = keyof typeof BACKDROP_ELEMENTS;

export function isBackdropElement(v: unknown): v is BackdropElement {
  return typeof v === "string" && v in BACKDROP_ELEMENTS;
}

