/**
 * One place to ask whether a visitor wants motion, and how much of it.
 *
 * Two questions, deliberately separate:
 *
 *   reducedMotion()    — has this person asked their OS for less movement?
 *                        Gates the things that move on their own: Lenis,
 *                        parallax, the magnetic buttons, the cursor's trail.
 *
 *   revealsDisabled()  — the above, OR the church has turned "Scroll-reveal
 *                        animations" off in the Customizer. Gates entrances:
 *                        text rising in, rails filling, rows fading up.
 *
 * Keeping them apart is the whole point. The switch used to gate Lenis itself
 * (`smoothScrollOn` in app/layout.tsx), so turning off "reveals" killed smooth
 * scroll and left every reveal running — precisely backwards. The switch now
 * only stamps `data-fx-reveals="off"` on <html> and this file reads it.
 */

export type MotionTier = "still" | "lite" | "full";

/** The visitor's own preference. Nothing the church sets can override it. */
export function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when scroll-triggered entrances should be skipped entirely. */
export function revealsDisabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    reducedMotion() || document.documentElement.dataset.fxReveals === "off"
  );
}

/**
 * How much this device should be asked to do.
 *
 *   still — asked for less motion, or on a metered connection. Posters, no
 *           autoplay, no particles. Nothing heavy is even fetched.
 *   lite  — a phone, a touch screen, or a low-memory machine.
 *   full  — a desktop with room to spare.
 *
 * Server-side this returns "lite": the safe middle, and the tier a phone gets
 * anyway, so the common case doesn't flash a downgrade on hydration.
 */
export function motionTier(): MotionTier {
  if (typeof window === "undefined") return "lite";

  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };

  if (reducedMotion() || nav.connection?.saveData) return "still";

  const smallOrTouch =
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < 4;

  return smallOrTouch || lowMemory ? "lite" : "full";
}
