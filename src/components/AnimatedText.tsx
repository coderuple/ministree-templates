"use client";

import { createElement, useEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";

type Props = {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
};

/** Splits text into masked characters that rise into view on scroll. */
export default function AnimatedText({
  children,
  className = "",
  as = "div",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled || !el) return;
      split = new SplitText(el, { type: "chars,words", mask: "chars" });
      tween = gsap.from(split.chars, {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.018,
        ease: "expo.out",
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      split?.revert();
    };
  }, [children, delay]);

  return createElement(as, { ref, className }, children);
}
