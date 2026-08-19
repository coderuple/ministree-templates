"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisStore } from "@/lib/state";

/** Global smooth scroll (Lenis) wired into GSAP's ticker + ScrollTrigger. */
export default function SmoothScroll() {
  useEffect(() => {
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
