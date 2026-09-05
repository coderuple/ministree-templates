/**
 * The ember canvas — Concept 01's atmosphere, used in exactly three places
 * (hero, stage section, final CTA). Extreme restraint is the point: 26 soft
 * radial sprites drifting upward. It is not a particle effect.
 *
 * Costs: one 2D context per canvas, DPR capped at 2, paused whenever the
 * canvas is off-screen, and never started at all under reduced motion.
 *
 * ponytail: 2D canvas, not WebGL. 26 sprites do not need a GPU pipeline, and
 * flame already pays three.js' 600kB for a scene this cannot justify.
 */
export function mountEmbers(canvas: HTMLCanvasElement, count = 26): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let w = 1;
  let h = 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = canvas.width = Math.max(1, Math.round(r.width * dpr));
    h = canvas.height = Math.max(1, Math.round(r.height * dpr));
  };
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.5 + 0.6,
    speed: Math.random() * 0.3 + 0.07,
    drift: Math.random() * 6.28,
    opacity: Math.random() * 0.45 + 0.14,
  }));

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  }, { threshold: 0 });
  io.observe(canvas);

  let raf = 0;
  let dead = false;
  const loop = (t: number) => {
    if (dead) return;
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y -= p.speed / 1400;
      if (p.y < -0.06) {
        p.y = 1.06;
        p.x = Math.random();
      }
      const x = (p.x + Math.sin(t / 2800 + p.drift) * 0.035) * w;
      const y = p.y * h;
      const rad = p.r * dpr * 8;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(255,198,128,${p.opacity})`);
      g.addColorStop(1, 'rgba(240,140,60,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 6.2832);
      ctx.fill();
    }
  };
  raf = requestAnimationFrame(loop);

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', resize);
  };
}
