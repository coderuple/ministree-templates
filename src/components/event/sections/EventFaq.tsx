"use client";

import { useState } from "react";
import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";

export interface FaqEntry {
  q: string;
  a: string;
  linkHref?: string | null;
  linkLabel?: string | null;
}

/**
 * The panel animates `grid-template-rows` from `0fr` to `1fr`, which lets the
 * browser resolve the natural height itself — no JS measuring, and no clipping
 * when the answer reflows at a different width.
 */
export default function EventFaq({
  entries,
  label,
  heading,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  entries: FaqEntry[];
  label: string;
  heading: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  if (entries.length === 0) return null;

  return (
    <section id={anchor} className="relative px-[4vw] py-32">
      <SectionHead index="07" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>

      <div className="mx-auto mt-16 max-w-4xl">
        {entries.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} className="border-t border-line last:border-b">
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  data-cursor
                  className="group flex w-full items-baseline gap-6 py-7 text-left"
                >
                  <span className="font-display text-sm text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display flex-1 text-xl uppercase leading-snug transition-colors duration-300 group-hover:text-ember md:text-3xl">
                    {faq.q}
                  </span>
                  <span
                    aria-hidden
                    className={`text-2xl text-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="max-w-2xl pb-8 pl-12 leading-relaxed text-ink/90">
                    {faq.a}
                    {faq.linkHref ? (
                      <a
                        href={faq.linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block w-max border-b border-ember/40 text-ember transition-colors duration-300 hover:border-ember"
                      >
                        {faq.linkLabel ?? "Find out more"}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
