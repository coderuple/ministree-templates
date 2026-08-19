import SectionHead from "@/components/SectionHead";
import AnimatedText from "@/components/AnimatedText";
import MagneticButton from "@/components/MagneticButton";

export interface TicketTier {
  id: string;
  name: string;
  price: string | null;
  description: string | null;
}

/**
 * The featured card's border is a conic gradient on a wrapper inset by -40%
 * and spun. The card itself sits on top at `p-px`, so only the sliver around
 * its edge shows — a rotating highlight rather than an animated border image,
 * which cannot be gradient-animated in CSS.
 */
export default function EventTickets({
  tiers,
  label,
  heading,
  href,
  ctaLabel,
  blurb,
  note,
}: {
  tiers: TicketTier[];
  label: string;
  heading: string;
  href: string;
  ctaLabel: string;
  blurb: string | null;
  note: string | null;
}) {
  if (tiers.length === 0) return null;
  const [featured, ...rest] = tiers;

  return (
    <section id="tickets" className="relative px-[4vw] py-32">
      <SectionHead index="05" label={label} />
      <AnimatedText
        as="h2"
        className="font-display mt-10 text-[11vw] uppercase leading-[0.92] md:text-[6.5vw]"
      >
        {heading}
      </AnimatedText>

      <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-flame p-px">
          <span
            aria-hidden
            className="absolute inset-[-40%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0%,var(--ember)_12%,var(--flame)_18%,transparent_28%)] motion-reduce:animate-none"
          />
          <div className="relative flex h-full flex-col gap-6 rounded-flame bg-surface p-9">
            <span className="micro text-ember">{featured.price ?? "Tickets"}</span>
            <h3 className="font-display text-4xl uppercase leading-none">{featured.name}</h3>
            {featured.description || blurb ? (
              <p className="leading-relaxed text-muted">{featured.description ?? blurb}</p>
            ) : null}
            <div className="mt-auto">
              <MagneticButton href={href}>
                {ctaLabel} <span aria-hidden>→</span>
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-flame border border-line bg-surface/80 p-9 backdrop-blur-sm transition-colors duration-500 hover:border-ember/50">
          {rest.length > 0 ? (
            <>
              <span className="micro text-muted">Other tickets</span>
              <ul className="divide-y divide-line">
                {rest.map((tier) => (
                  <li key={tier.id} className="flex items-baseline justify-between gap-4 py-4">
                    <span className="font-display text-xl uppercase leading-none">{tier.name}</span>
                    {tier.price ? <span className="text-ember">{tier.price}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <span className="micro text-muted">Everyone welcome</span>
              <h3 className="font-display text-4xl uppercase leading-none">One ticket, one room</h3>
              <p className="leading-relaxed text-muted">
                There is a single ticket for this one — no tiers to choose between.
              </p>
            </>
          )}
          <div className="mt-auto">
            <MagneticButton href={href} variant="ghost">
              {ctaLabel} <span aria-hidden>→</span>
            </MagneticButton>
          </div>
        </div>
      </div>

      {note ? (
        <p className="micro mx-auto mt-12 max-w-2xl text-center leading-loose text-ink/85">{note}</p>
      ) : null}
    </section>
  );
}
