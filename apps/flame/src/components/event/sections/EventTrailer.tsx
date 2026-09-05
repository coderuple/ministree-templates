"use client";

import { useState } from "react";
import SectionHead from "@/components/SectionHead";

/**
 * The trailer — full-bleed, and silent until someone asks for it.
 *
 * A poster with a play button rather than an autoplaying `<video controls>`:
 * on an event page the trailer is a decision, not wallpaper, and `preload` only
 * drops to "none" if nothing is asked to load before the press. The video is
 * mounted on that press, so a visitor who scrolls past it downloads a JPEG.
 *
 * YouTube and Vimeo keep the generic treatment — those are iframes and the
 * poster trick does not apply to them.
 */
export default function EventTrailer({
  url,
  poster,
  label,
  heading,
  title,
  anchor,
}: {
  /** The id this section answers to — a church can rename it. */
  anchor: string;
  url: string;
  poster: string | null;
  label: string;
  heading: string | null;
  /** Accessible name for the iframe branch. */
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embed = /youtube|vimeo/.test(url);

  return (
    <section id={anchor} className="relative px-[4vw] py-32">
      <SectionHead index="08" label={label} />
      {heading ? (
        <h2 className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]">
          {heading}
        </h2>
      ) : null}

      <div className="relative mt-12 aspect-video overflow-hidden border border-line bg-panel">
        {embed ? (
          <iframe src={url} title={title} className="h-full w-full" allowFullScreen />
        ) : playing ? (
          <video
            src={url}
            poster={poster ?? undefined}
            controls
            autoPlay
            playsInline
            className="h-full w-full"
          />
        ) : (
          <>
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" aria-hidden className="h-full w-full object-cover" />
            ) : null}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              data-cursor
              className="group absolute inset-0 flex items-center justify-center bg-bg/30 transition-colors hover:bg-bg/10"
            >
              <span className="flex size-20 items-center justify-center rounded-full border border-ink/50 bg-bg/50 backdrop-blur-sm transition-colors group-hover:border-ember">
                <span aria-hidden className="ml-1 text-2xl text-ink">
                  ▶
                </span>
              </span>
              <span className="sr-only">Play {title}</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
