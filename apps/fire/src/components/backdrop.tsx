/**
 * The one continuous composition.
 *
 * A single sticky layer behind the entire page — no section has a background
 * of its own, which is what removes every hard section break from this
 * concept. `margin-bottom: -100svh` cancels its own height so it takes no
 * space in the flow while remaining sticky for the whole document.
 *
 * Everything it does is driven by --pg, the page-level progress the scroll
 * engine writes on the frame: the smoke warms into an ignited gradient, two
 * blurred orbs brighten, and the ribbon of light draws itself down the page.
 *
 * A server component. The only measurement it needs — the SVG path's length —
 * the engine takes once on mount and publishes as --len.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="backdrop">
      <div className="backdrop-smoke" />
      <div className="backdrop-heat" />
      <div className="backdrop-orb backdrop-orb-a" />
      <div className="backdrop-orb backdrop-orb-b" />

      <svg
        className="thread"
        viewBox="0 0 300 1000"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <linearGradient id="thread-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--oxblood)" />
          </linearGradient>
        </defs>
        {/* The path the whole page is threaded on — the visual answer to
            "carried by the wind". */}
        <path
          data-thread
          d="M 40 -60 C 300 140, 60 320, 200 470 C 340 620, 90 760, 260 980"
        />
      </svg>

      <div className="backdrop-vignette" />
    </div>
  );
}

export default Backdrop;
