"use client";

import { useEffect, useRef, useState } from "react";
import { motionTier, reducedMotion } from "@/lib/motion";

/**
 * A video that plays itself, quietly, while it is on screen.
 *
 * Autoplay is not a matter of setting the attribute. Low Power Mode, Data
 * Saver and in-app browsers all ignore it, and iOS refuses `play()` unless the
 * element is muted *at the moment of the call* — not merely muted in the
 * markup. So playback is asked for imperatively, three times: on mount, when
 * metadata lands, and on the first touch anywhere on the page, which is the one
 * signal every browser accepts as permission.
 *
 * `playsInline` is mandatory or iOS takes the video fullscreen.
 *
 * Two costs are deliberately avoided. `preload="none"` by default, so a page
 * carrying four of these fetches nothing until each comes into view; and under
 * reduced motion or Save-Data the poster is all that ever loads — the effect
 * returns before the observer is built, so no bytes are requested at all.
 */
export default function AmbientVideo({
  src,
  poster,
  preload = "none",
  sound = false,
  label,
  className = "",
}: {
  src: string;
  poster?: string | null;
  /** "auto" only for a backdrop that is on screen from the first paint. */
  preload?: "none" | "auto" | "metadata";
  /** Offer an unmute control. Off by default — most of these are wallpaper. */
  sound?: boolean;
  /** Describes the footage. Omit for anything purely decorative. */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    /* Poster only. Returning before the observer means the <video> is never
       asked to load, so this is a bandwidth decision as much as a motion one —
       which is why it reads the tier and not just the motion preference. */
    if (reducedMotion() || motionTier() === "still") {
      video.pause();
      return;
    }

    const tryPlay = () => {
      video.muted = true; // must be true at call time on iOS, not just in markup
      video.play().catch(() => {});
    };
    const onFirstTouch = () => {
      if (video.paused) tryPlay();
    };

    /* A fixed backdrop is always intersecting, so the observer costs it nothing
       and there is no second code path for it. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(video);
    video.addEventListener("loadedmetadata", tryPlay);
    window.addEventListener("touchstart", onFirstTouch, { once: true, passive: true });

    return () => {
      io.disconnect();
      video.removeEventListener("loadedmetadata", tryPlay);
      window.removeEventListener("touchstart", onFirstTouch);
    };
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster ?? undefined}
        loop
        muted={muted}
        playsInline
        preload={preload}
        {...(label ? { "aria-label": label } : { "aria-hidden": true })}
        className={`h-full w-full object-cover ${className}`}
      />
      {sound ? (
        <button
          type="button"
          data-cursor
          onClick={() => setMuted((m) => !m)}
          className="micro absolute bottom-4 left-4 z-10 rounded-[var(--radius-button)] border border-ink/40 bg-bg/60 px-4 py-2 text-ink backdrop-blur-sm transition-colors hover:border-ember"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      ) : null}
    </>
  );
}
