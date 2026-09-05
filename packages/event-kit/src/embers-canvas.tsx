'use client';

import { useEffect, useRef } from 'react';
import { mountEmbers } from './embers.ts';

/**
 * A canvas of drifting embers behind a section. Renders nothing under reduced
 * motion — the atmosphere is decoration, and the section reads without it.
 */
export function EmbersCanvas({ className, count }: { className?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    return mountEmbers(canvas, count);
  }, [count]);

  return <canvas ref={ref} aria-hidden className={className} />;
}

export default EmbersCanvas;
