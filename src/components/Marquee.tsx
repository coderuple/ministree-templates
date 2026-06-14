/** Scrolling marquee strip with a cross glyph between items. */
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
            className="flex items-center whitespace-nowrap font-display text-2xl uppercase tracking-wide md:text-4xl"
          >
            <span className="px-6">{item}</span>
            <span className="text-ember">†</span>
          </span>
        )),
      )}
    </div>
  );

  return (
    <div className={`select-none overflow-hidden border-y border-line py-5 ${className}`} role="presentation">
      <div className={`flex w-max motion-reduce:animate-none ${speed === "slow" ? "animate-marquee-slow" : "animate-marquee"}`}>
        {half}
        {half}
      </div>
    </div>
  );
}
