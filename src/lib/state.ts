import type Lenis from "lenis";

/** Shared Lenis instance so nav links / preloader can control scrolling. */
export const lenisStore: { current: Lenis | null } = { current: null };

/** Camera dolly target — tweened by the preloader as its curtain lifts. */
export const introState = { z: 15 };

/** Read a CSS custom property so the WebGL scene uses the same theme. */
export function cssVar(name: string): string {
  if (typeof window === "undefined") return "#000000";
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    "#000000"
  );
}
