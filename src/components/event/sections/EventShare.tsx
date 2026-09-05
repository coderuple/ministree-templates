"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";
import MagneticButton from "@/components/MagneticButton";
import { shareFile } from "@/lib/share";
import { revealsDisabled } from "@/lib/motion";

/**
 * Ask people to tell someone. The flyer goes out through the phone's own share
 * sheet, with the picture attached — that is the difference between a friend
 * seeing the event and a friend seeing a link they don't open.
 */
export default function EventShare({
  flyerUrl,
  filename,
  title,
  text,
  socials,
  label,
  heading,
  blurb,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  /** The image to attach. Null hides the button and leaves the pills. */
  flyerUrl: string | null;
  filename: string;
  title: string;
  text: string | null;
  socials: Array<{ label: string; href: string }>;
  label: string;
  heading: string;
  blurb: string | null;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || revealsDisabled()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-share-rise]", {
        autoAlpha: 0,
        y: 36,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  if (!flyerUrl && socials.length === 0) return null;

  return (
    <section id={anchor} ref={rootRef} className="relative px-[4vw] py-32">
      <SectionHead index="10" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>
      {blurb ? (
        <p data-share-rise className="mt-6 max-w-xl leading-relaxed text-ink/90">
          {blurb}
        </p>
      ) : null}

      <div className="mt-14 grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
        {flyerUrl ? (
          <div data-share-rise className="overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flyerUrl} alt="" aria-hidden className="w-full object-cover" />
          </div>
        ) : null}

        <div data-share-rise className="flex flex-col items-start gap-8">
          {flyerUrl ? (
            <>
              <button
                type="button"
                data-cursor
                onClick={async () => {
                  const ok = await shareFile({ url: flyerUrl, filename, title, text: text ?? undefined });
                  setFailed(!ok);
                }}
                className="rounded-[var(--radius-button)] bg-ember px-8 py-4 text-xs uppercase tracking-[0.25em] text-bg transition-colors duration-500 hover:bg-flame"
              >
                Share the flyer
              </button>
              {/* Only ever seen if both the share sheet and the download failed
                  — an offline phone, a blocked fetch. Saying nothing there
                  looks like a dead button. */}
              {failed ? (
                <p role="status" className="micro text-muted">
                  Couldn&rsquo;t open the share sheet — try saving the image instead.
                </p>
              ) : null}
            </>
          ) : null}

          {socials.length > 0 ? (
            <ul className="flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.href}>
                  <MagneticButton
                    href={s.href}
                    external
                    variant="outline"
                    className="px-6 py-3 text-[11px]"
                  >
                    {s.label}
                  </MagneticButton>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
