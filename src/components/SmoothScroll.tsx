"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisStore } from "@/lib/state";
import { reducedMotion } from "@/lib/motion";

/** Global smooth scroll (Lenis) wired into GSAP's ticker + ScrollTrigger. */
export default function SmoothScroll() {
  useEffect(() => {
    // Eased scrolling IS motion — someone who asked for less of it should get
    // the browser's own scroll, not a smoothed one. Mounted unconditionally so
    // the church's reveals switch can't take smooth scroll down with it.
    if (reducedMotion()) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.09 });
    lenisStore.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisStore.current = null;
    };
  }, []);

  return null;
}
