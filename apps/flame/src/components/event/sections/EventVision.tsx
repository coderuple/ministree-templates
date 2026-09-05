"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import SectionHead from "@/components/SectionHead";
import { revealsDisabled } from "@/lib/motion";

/**
 * The manifesto — a tall sticky section whose words brighten as you scroll.
 *
 * The 280vh height is the scrub track: the inner panel sticks for the whole of
 * it, so the reveal is paced by distance travelled rather than by a timer, and
 * a fast scroller and a slow one both see every word.
 *
 * `document.fonts.ready` is awaited before splitting because SplitText measures
 * the rendered glyphs — split against the fallback face and every word lands in
 * the wrong place the moment the real font arrives.
 */
export default function EventVision({
  body,
  label,
  footnote,
  backdrop,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  body: string;
  label: string;
  footnote: string | null;
  backdrop: string | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    /* The words are authored at full opacity — the 0.12 only ever exists as the
       `from` of the scrub. So skipping the split IS the end state: a readable
       paragraph, no pin fighting the scroll, nothing to set. */
    if (revealsDisabled()) return;
    let split: SplitText | null = null;
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (cancelled || !textRef.current) return;
      split = new SplitText(textRef.current, { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        },
      );
    });

    return () => {
      cancelled = true;
      split?.revert();
    };
  }, [body]);

  return (
    <section ref={sectionRef} id={anchor} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdrop}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-[0.07]"
          />
        ) : null}
        <div className="relative mx-auto w-full max-w-6xl px-[4vw]">
          <SectionHead index="01" label={label} />
          <p
            ref={textRef}
            className="font-serif mt-12 text-[6.4vw] leading-[1.18] md:text-[3.4vw]"
          >
            {body}
          </p>
          {footnote ? <p className="micro mt-12 text-muted">{footnote}</p> : null}
        </div>
      </div>
    </section>
  );
}
