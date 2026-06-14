"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Custom dot + trailing ring cursor (fine pointers only). */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    let shown = false;
    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };
    const onOver = (e: MouseEvent) => {
      const interactive = (e.target as Element).closest("a, button, [data-cursor]");
      gsap.to(ring, { scale: interactive ? 2 : 1, opacity: interactive ? 0.5 : 1, duration: 0.35, ease: "power3.out" });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden [@media(pointer:fine)]:block">
      <div ref={dotRef} className="invisible fixed left-0 top-0 size-1.5 rounded-full bg-ember opacity-0" />
      <div ref={ringRef} className="invisible fixed left-0 top-0 size-9 rounded-full border border-cream/50 opacity-0 mix-blend-difference" />
    </div>
  );
}
