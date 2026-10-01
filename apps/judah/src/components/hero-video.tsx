"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/* Reduce-motion and Save-Data get the still underneath, and are sent nothing
   else: the player is never rendered for them, so no video bytes are asked
   for. Read once — the server's answer is "no player" until hydration. */
const once = () => () => {};
const mayPlay = () =>
  !matchMedia("(prefers-reduced-motion: reduce)").matches &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData !== true;

/**
 * The opening's moving picture: an uploaded file, or a YouTube/Vimeo embed.
 * Laid over the photo, which stays underneath as its still — shown while the
 * video loads, and instead of it for anyone who asked for less motion or data.
 * The plate's overlay sits over both.
 */
export function HeroVideo({ src, embed }: { src: string | null; embed: string | null }) {
  const playable = useSyncExternalStore(once, mayPlay, () => false);
  if (!playable) return null;
  if (src) return <LoopVideo src={src} />;
  if (embed) {
    /* `inert`: wallpaper, not a player — no focus, no clicks, nothing for a
       screen reader to land in. */
    return <iframe className="plate-embed" src={embed} title="Background video" allow="autoplay; encrypted-media" inert />;
  }
  return null;
}

/* Autoplay is asked for, not assumed. iOS refuses play() unless the element
   is muted at the moment of the call, and Low Power Mode ignores the
   attribute until the first touch anywhere. Paused while off screen. */
function LoopVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const play = () => {
      video.muted = true;
      video.play().catch(() => {});
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : video.pause()));
    io.observe(video);
    video.addEventListener("loadedmetadata", play);
    window.addEventListener("touchstart", play, { once: true, passive: true });
    return () => {
      io.disconnect();
      video.removeEventListener("loadedmetadata", play);
      window.removeEventListener("touchstart", play);
    };
  }, []);

  return <video ref={ref} src={src} muted loop playsInline autoPlay preload="auto" aria-hidden="true" />;
}
