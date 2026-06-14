"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AnimatedText from "@/components/AnimatedText";
import MagneticButton from "@/components/MagneticButton";

// The WebGL ember is heavy + client-only; load it lazily and never on the server.
const EmberScene = dynamic(() => import("@/components/canvas/EmberScene"), { ssr: false });

type CtaVariant = "primary" | "outline" | "ghost" | "dark";
type Cta = { label: string; href: string; variant?: CtaVariant };

/**
 * The cinematic home hero — always the dark ember centerpiece (in both schemes),
 * so it reads as flame's signature. Falls back to an ember-gradient poster for
 * reduced-motion / small screens, where the WebGL would be wasted.
 */
export default function HomeHero({
  eyebrow,
  name,
  tagline,
  primary,
  secondary,
  webgl = true,
  backgroundImageUrl,
}: {
  eyebrow?: string;
  name: string;
  tagline: string;
  primary: Cta;
  secondary: Cta;
  /** Customizer toggle: when false, always use the ember-gradient poster (no WebGL). */
  webgl?: boolean;
  /** Customizer: optional photo behind the ember (the particles glow over it). */
  backgroundImageUrl?: string;
}) {
  const [scene, setScene] = useState(false);

  useEffect(() => {
    if (!webgl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 768px)").matches;
    if (!reduce && !small) setScene(true);
  }, [webgl]);

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-[#0c0805] text-[#f2e9d8]">
      {backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backgroundImageUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-60" />
      ) : null}
      <div aria-hidden className={`absolute inset-0 ${backgroundImageUrl ? "mix-blend-screen" : ""}`}>
        {scene ? (
          <EmberScene />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(ellipse_at_50%_75%,_color-mix(in_srgb,var(--flame)_55%,transparent),transparent_60%),radial-gradient(ellipse_at_50%_100%,_color-mix(in_srgb,var(--ember)_45%,transparent),transparent_55%)]" />
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0c0805]/40 via-transparent to-[#0c0805]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
        {eyebrow ? <p className="micro mb-6 text-[#f2e9d8]/60">{eyebrow}</p> : null}
        <AnimatedText
          as="h1"
          className="font-display text-[16vw] uppercase leading-[0.86] tracking-tight sm:text-[11vw] lg:text-[8.5vw]"
        >
          {name}
        </AnimatedText>
        <p className="font-serif mx-auto mt-6 max-w-xl text-xl italic text-[#f2e9d8]/75 md:text-2xl">{tagline}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <MagneticButton href={primary.href} variant={primary.variant ?? "primary"}>
            {primary.label}
          </MagneticButton>
          <MagneticButton href={secondary.href} variant={secondary.variant ?? "outline"}>
            {secondary.label}
          </MagneticButton>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-8 left-1/2 hidden h-12 w-px -translate-x-1/2 overflow-hidden sm:block">
        <span className="block h-full w-full animate-[scroll-hint_2.4s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[var(--ember)] to-transparent" />
      </div>
    </section>
  );
}
