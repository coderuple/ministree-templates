import type { CSSProperties } from 'react';

/**
 * A photographic frame — the image when there is one, a tinted placeholder
 * when there is not.
 *
 * The prototypes used a drag-and-drop `<image-slot>` whose `placeholder`
 * string was the art direction for that shot ("Hero portrait — soft-lit, eyes
 * closed, warm rim light"). Those strings survive as `brief`: they render as
 * the caption of an empty frame, so a church setting the site up sees what
 * belongs there, and the whole set doubles as the photographer's shot list.
 *
 * The tint is `--frame-tint`, defined per concept, so an empty page still
 * looks composed rather than broken.
 */
export function MediaFrame({
  src,
  alt,
  brief,
  className,
  style,
  aspect,
  priority = false,
  sizes = '100vw',
}: {
  src?: string | null;
  /** Describes the picture for someone who cannot see it. */
  alt?: string;
  /** Art direction for the shot that belongs here. */
  brief?: string;
  className?: string;
  style?: CSSProperties;
  /** "3/4", "4/5", "16/9" — set on the frame, so the layout never jumps. */
  aspect?: string;
  /** Only the hero should be eager; everything else waits until it is near. */
  priority?: boolean;
  sizes?: string;
}) {
  const frameStyle: CSSProperties = { ...style, ...(aspect ? { aspectRatio: aspect } : null) };

  if (!src) {
    return (
      <div
        className={['media-frame', 'media-frame-empty', className].filter(Boolean).join(' ')}
        style={frameStyle}
        role="presentation"
      >
        {brief ? <span className="media-frame-brief">{brief}</span> : null}
      </div>
    );
  }

  return (
    <div className={['media-frame', className].filter(Boolean).join(' ')} style={frameStyle}>
      {/* A plain <img>: the church's media lives on their own Ministree CDN,
          and next/image would need every church's hostname in the config of a
          template that ships before any of them exists. `loading` and
          `decoding` give the part of it that actually matters here. */}
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
