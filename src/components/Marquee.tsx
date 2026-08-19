/**
 * Endless scrolling band of short phrases, separated by a cross.
 *
 * Two identical halves, each holding three repetitions: the keyframe translates
 * by exactly -50%, so the second half is in position the instant the first
 * leaves and the loop has no seam. Fewer repetitions leaves a gap on a wide
 * screen when the phrases are short.
 */
export default function Marquee({
  items,
  className = "",
  speed = "normal",
}: {
  items: string[];
  className?: string;
  speed?: "normal" | "slow";
}) {
  const half = (
    <div className="flex w-max shrink-0 items-center" aria-hidden>
      {[0, 1, 2].map((rep) =>
        items.map((item, i) => (
          <span
            key={`${rep}-${i}`}
            className="font-display flex items-center whitespace-nowrap text-2xl uppercase tracking-wide md:text-4xl"
          >
            <span className="px-6">{item}</span>
            <span className="text-ember">†</span>
          </span>
        )),
      )}
    </div>
  );

  return (
    <div
      className={`select-none overflow-hidden border-y border-line py-5 ${className}`}
      role="presentation"
    >
      <div
        className={`flex w-max motion-reduce:animate-none ${
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee"
        }`}
      >
        {half}
        {half}
      </div>
    </div>
  );
}
