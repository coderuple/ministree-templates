"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";

/**
 * Scrolls slower than the page it sits in. The image is pre-scaled 1.18× so
 * there is spare height to travel through — without it the parallax would drag
 * the picture off its own frame and show the background underneath.
 */
function ParallaxImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tween = gsap.fromTo(
      imgRef.current,
      { yPercent: -9 },
      {
        yPercent: 9,
        ease: "none",
        scrollTrigger: { trigger: wrapRef.current, start: "top bottom", end: "bottom top", scrub: 0.3 },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className={`overflow-hidden border border-line ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} src={src} alt={alt} className="h-full w-full scale-[1.18] object-cover" />
    </div>
  );
}

export default function EventVenue({
  label,
  name,
  blurb,
  address,
  directionsUrl,
  images,
}: {
  label: string;
  name: string;
  blurb: string | null;
  address: string | null;
  directionsUrl: string | null;
  images: string[];
}) {
  return (
    <section id="venue" className="relative px-[4vw] py-32">
      <SectionHead index="04" label={label} />

      <div className="mt-12 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          {images[0] ? (
            <ParallaxImage src={images[0]} alt={name} className="aspect-[16/10]" />
          ) : null}
        </div>

        <div className="flex flex-col justify-between gap-10 md:col-span-5">
          <div>
            <AnimatedText
              as="h2"
              className="font-display text-[10vw] uppercase leading-[0.92] md:text-[3.6vw]"
            >
              {name}
            </AnimatedText>
            {blurb ? <p className="mt-6 max-w-md leading-relaxed text-ink/90">{blurb}</p> : null}
            {address ? <p className="micro mt-8 text-ink">{address}</p> : null}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor
                className="micro group mt-4 inline-flex items-center gap-3 text-ember"
              >
                Get directions
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </a>
            ) : null}
          </div>

          {/* The offset on the second image is what stops the pair reading as a
              plain two-up grid — it staggers them the way the layout does. */}
          {images.length > 1 ? (
            <div className="grid grid-cols-2 gap-6">
              <ParallaxImage src={images[1]} alt="" className="aspect-[3/4]" />
              {images[2] ? (
                <ParallaxImage src={images[2]} alt="" className="mt-10 aspect-[3/4]" />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
