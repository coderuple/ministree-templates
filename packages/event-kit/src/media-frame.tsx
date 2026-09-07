import type { CSSProperties } from 'react';
import { suggestedSize } from './format.ts';

/**
 * A photographic frame — the image when there is one, its suggested size when
 * there is not.
 *
 * An empty frame used to print the art direction for that shot ("Speaker
 * portrait — three-quarter turn, soft shadow"). That is a note to whoever
 * commissions the photograph, not to whoever is looking at the page, and it
 * read as body copy. The briefs now live on the matching media field in the
 * Customizer, where the person uploading actually sees them; the frame states
 * the one thing a page can usefully say about a picture it does not have.
 */
export function MediaFrame({
  src,
  alt,
  className,
  style,
  aspect,
  size,
  priority = false,
  sizes = '100vw',
}: {
  src?: string | null;
  /** Describes the picture for someone who cannot see it. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** "3 / 4", "4 / 5", "16 / 9" — set on the frame, so the layout never jumps. */
  aspect?: string;
  /**
   * What an empty frame should say, when `aspect` cannot answer it. Needed
   * wherever a frame is sized by CSS rather than by an aspect ratio — most of
   * fire, and a handful of slots in the other two.
   */
  size?: string;
  /** Only the hero should be eager; everything else waits until it is near. */
  priority?: boolean;
  sizes?: string;
}) {
  const frameStyle: CSSProperties = { ...style, ...(aspect ? { aspectRatio: aspect } : null) };

  if (!src) {
    /* A full-bleed hero is `100svh` and cropped to fill, so it has no height to
       suggest — naming one would be telling someone to crop before we crop
       again. `priority` is already true only on heroes. */
    const label = size ?? suggestedSize(aspect) ?? (priority ? '2400 px wide' : null);
    return (
      <div
        className={['media-frame', 'media-frame-empty', className].filter(Boolean).join(' ')}
        style={frameStyle}
        role="presentation"
      >
        {label ? <span className="media-frame-brief">{label}</span> : null}
      </div>
    );
  }

  return (
    <div className={['media-frame', className].filter(Boolean).join(' ')} style={frameStyle}>
      {/* A plain <img>: the church's media lives on their own CDN, and
          next/image would need every church's hostname in the config of a
          template that ships before any of them exists. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ''}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </div>
  );
}

export default MediaFrame;
