import {
  RichText,
  SectionWrapper,
  getEvents,
  getSermons,
  hrefFor,
  type AccordionProps,
  type AudioProps,
  type CardBoxProps,
  type CtaProps,
  type EmbedProps,
  type EventsListProps,
  type FeaturesProps,
  type GivingCtaProps,
  type GivingMethodsProps,
  type HeroProps,
  type ImageGalleryProps,
  type ImageSectionProps,
  type LinksProps,
  type LocationProps,
  type MarqueeProps,
  type PageSection,
  type ProfileCardsProps,
  type RichTextSectionProps,
  type ScheduleProps,
  type SectionComponentProps,
  type SectionContext,
  type SectionRegistry,
  type SermonsListProps,
  type StatementProps,
  type VideoProps,
} from "@ministree/template-sdk";
import { Button, Container } from "@/components/ui";
import { EventCard, SermonCard } from "@/components/cards";
import { CopyValue } from "@/components/copy-value";
import { loadSlugs } from "@/lib/ministree";

/**
 * flame's section registry — its cinematic interpretation of each Ministree
 * section type declared in `manifest.supports.sections`. Behavior/props match the
 * contract; only the look is flame's. Fork and restyle freely.
 */

function Band({
  section,
  context,
  children,
  narrow,
  className = "",
}: {
  section: PageSection;
  context: SectionContext;
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <SectionWrapper section={section} context={context} className={`bg-bg py-20 text-ink sm:py-28 ${className}`}>
      <Container size={narrow ? "narrow" : "default"}>{children}</Container>
    </SectionWrapper>
  );
}

function Title({ section, heading }: { section: PageSection; heading?: string }) {
  const title = heading ?? section.title;
  if (!title || section.hideTitle) return null;
  return (
    <div className="mb-10">
      {section.subtitle ? <p className="micro text-ember">{section.subtitle}</p> : null}
      <h2 className="font-display mt-3 text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{title}</h2>
    </div>
  );
}

function Hero({ section, props, context }: SectionComponentProps) {
  const p = props as HeroProps;
  const title = p.title ?? section.title ?? "";
  return (
    <SectionWrapper section={section} context={context} className="relative overflow-hidden bg-surface/40 py-28 text-ink sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_120%,_color-mix(in_srgb,var(--ember)_18%,transparent),transparent_60%)]" />
      <Container className="relative text-center">
        {section.subtitle ? <p className="micro text-ember">{section.subtitle}</p> : null}
        <h1 className="font-display mx-auto mt-5 max-w-4xl text-6xl uppercase leading-[0.88] tracking-tight sm:text-8xl">{title}</h1>
      </Container>
    </SectionWrapper>
  );
}

function RichTextSection({ section, props, context }: SectionComponentProps) {
  const p = props as RichTextSectionProps;
  return (
    <Band section={section} context={context} narrow>
      <Title section={section} />
      <RichText doc={p.content} className="prose mx-auto" />
    </Band>
  );
}

function Cta({ section, props, context }: SectionComponentProps) {
  const p = props as CtaProps;
  return (
    <Band section={section} context={context}>
      <div className="relative overflow-hidden border border-line bg-[#0c0805] px-8 py-20 text-center text-[#f2e9d8]">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--flame)]/25 blur-3xl" />
        {p.heading ? <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{p.heading}</h2> : null}
        {p.description ? <p className="font-serif mx-auto mt-4 max-w-xl text-xl italic text-[#f2e9d8]/70">{p.description}</p> : null}
        {p.ctas?.length ? (
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {p.ctas.map((c, i) => (
              <Button key={i} href={c.href ?? c.url ?? "#"} variant={i === 0 ? "primary" : "outline"}>
                {c.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </Band>
  );
}

function Links({ section, props, context }: SectionComponentProps) {
  const p = props as LinksProps;
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={p.heading} />
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {(p.items ?? []).map((item, i) => (
          <a key={i} href={item.href ?? item.url ?? "#"} data-cursor className="group bg-bg p-8 transition-colors hover:bg-surface">
            <p className="font-display text-2xl uppercase tracking-tight transition-colors group-hover:text-ember">{item.label}</p>
            {item.description ? <p className="mt-2 text-sm text-muted">{item.description}</p> : null}
            <span aria-hidden className="mt-4 inline-block text-ember opacity-0 transition-opacity group-hover:opacity-100">→</span>
          </a>
        ))}
      </div>
    </Band>
  );
}

function Features({ section, props, context }: SectionComponentProps) {
  const p = props as FeaturesProps;
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={p.heading} />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {(p.items ?? []).map((f, i) => (
          <div key={i} className="border-t border-line pt-5">
            <p className="font-display text-sm text-ember">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="font-display mt-2 text-2xl uppercase tracking-tight">{f.title}</h3>
            {f.description ? <p className="mt-2 text-sm text-muted">{f.description}</p> : null}
          </div>
        ))}
      </div>
    </Band>
  );
}

function Accordion({ section, props, context }: SectionComponentProps) {
  const p = props as AccordionProps;
  return (
    <Band section={section} context={context} narrow>
      <Title section={section} />
      <div className="border-t border-line">
        {(p.items ?? []).map((item, i) => (
          <details key={i} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-display text-xl uppercase tracking-tight">
              {item.title}
              <span aria-hidden className="text-ember transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <div className="pb-6 text-muted">
              {typeof item.content === "string" ? <p>{item.content}</p> : <RichText doc={item.content} className="prose" />}
            </div>
          </details>
        ))}
      </div>
    </Band>
  );
}

function Location({ section, props, context }: SectionComponentProps) {
  const p = props as LocationProps;
  return (
    <Band section={section} context={context}>
      <div className="grid gap-8 border border-line bg-surface/40 p-8 sm:grid-cols-2 sm:items-center">
        <div>
          {p.heading ? <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight">{p.heading}</h2> : null}
          {p.location ? (
            <p className="font-serif mt-4 text-xl italic text-muted">
              {p.location.venue}
              <br />
              {p.location.address}
            </p>
          ) : null}
          {p.serviceTimes ? <p className="micro mt-4 text-muted">{p.serviceTimes}</p> : null}
        </div>
        {p.mapImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.mapImageUrl} alt={p.location?.venue ?? "Map"} className="aspect-[4/3] w-full border border-line object-cover" />
        ) : null}
      </div>
    </Band>
  );
}

function Video({ section, props, context }: SectionComponentProps) {
  const p = props as VideoProps;
  if (!p.url) return null;
  const embed = /youtube|vimeo/.test(p.url);
  return (
    <Band section={section} context={context} narrow>
      <Title section={section} />
      <div className="aspect-video overflow-hidden border border-line bg-[#0c0805]">
        {embed ? (
          <iframe src={p.url} title={section.title ?? "Video"} className="h-full w-full" allowFullScreen />
        ) : (
          <video src={p.url} poster={p.posterUrl} controls={p.controls ?? true} className="h-full w-full" />
        )}
      </div>
    </Band>
  );
}

function Audio({ section, props, context }: SectionComponentProps) {
  const p = props as AudioProps;
  if (!p.url) return null;
  return (
    <Band section={section} context={context} narrow>
      <Title section={section} heading={p.title} />
      <audio src={p.url} controls className="w-full" />
    </Band>
  );
}

function ImageGallery({ section, props, context }: SectionComponentProps) {
  const p = props as ImageGalleryProps;
  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {(p.items ?? []).map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={img.imageUrl} alt={img.alt} className="aspect-square w-full border border-line object-cover transition-transform duration-700 hover:scale-[1.03]" />
        ))}
      </div>
    </Band>
  );
}

function ImageSection({ section, props, context }: SectionComponentProps) {
  const p = props as ImageSectionProps;
  if (!p.imageUrl) return null;
  return (
    <Band section={section} context={context} narrow>
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.imageUrl} alt={p.alt} className="w-full border border-line object-cover" />
        {p.caption ? <figcaption className="micro mt-3 text-center text-muted">{p.caption}</figcaption> : null}
      </figure>
    </Band>
  );
}

async function SermonsList({ section, props, context }: SectionComponentProps) {
  const p = props as SermonsListProps;
  const limit = p.limit ?? 6;
  const [data, slugs] = await Promise.all([
    p.source === "static" ? Promise.resolve(null) : getSermons(undefined, { limit, ...(p.seriesSlug ? { seriesSlug: p.seriesSlug } : {}) }),
    loadSlugs(),
  ]);
  const items = data?.items ?? [];
  if (!items.length) return null;
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={section.title ?? "Latest messages"} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
        ))}
      </div>
    </Band>
  );
}

async function EventsList({ section, props, context }: SectionComponentProps) {
  const p = props as EventsListProps;
  const limit = p.limit ?? 5;
  const [data, slugs] = await Promise.all([
    p.source === "static" ? Promise.resolve(null) : getEvents(undefined, { limit, when: "upcoming" }),
    loadSlugs(),
  ]);
  const items = data?.items ?? [];
  if (!items.length) return null;
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={section.title ?? "Upcoming events"} />
      <div className="space-y-4">
        {items.map((e) => (
          <EventCard key={e.id} event={e} href={hrefFor(slugs, "events", e.slug)} />
        ))}
      </div>
    </Band>
  );
}

async function GivingCta({ section, props, context }: SectionComponentProps) {
  const p = props as GivingCtaProps;
  const slugs = await loadSlugs();
  return (
    <Band section={section} context={context}>
      <div className="relative overflow-hidden border border-line bg-[#0c0805] px-8 py-20 text-center text-[#f2e9d8]">
        <div aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-[var(--ember)]/25 blur-3xl" />
        <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{p.heading ?? "Partner with the vision"}</h2>
        {p.description ? <p className="font-serif mx-auto mt-4 max-w-xl text-xl italic text-[#f2e9d8]/70">{p.description}</p> : null}
        <div className="mt-9 flex justify-center">
          <Button href={hrefFor(slugs, "giving")}>Give now</Button>
        </div>
      </div>
    </Band>
  );
}

function ProfileCards({ section, props, context }: SectionComponentProps) {
  const p = props as ProfileCardsProps;
  const cards = p.cards ?? [];

  // Roster: the cinematic "lineup" — a typographic numbered list with ember hover.
  if (p.layout === "roster") {
    return (
      <Band section={section} context={context}>
        <Title section={section} />
        <div className="border-t border-line">
          {cards.map((c, i) => (
            <div key={i} data-cursor className="group flex items-baseline gap-6 border-b border-line py-6">
              <span className="font-display text-sm text-ember">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-3xl uppercase tracking-tight transition-colors group-hover:text-ember sm:text-5xl">
                {c.name}
              </span>
              {c.subtitle ? <span className="micro ml-auto text-right text-muted">{c.subtitle}</span> : null}
            </div>
          ))}
        </div>
      </Band>
    );
  }

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className="group text-center">
            <div className="mx-auto aspect-square w-full overflow-hidden border border-line bg-surface">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              ) : null}
            </div>
            <p className="font-display mt-4 text-xl uppercase tracking-tight">{c.name}</p>
            {c.subtitle ? <p className="micro mt-1 text-muted">{c.subtitle}</p> : null}
          </div>
        ))}
      </div>
    </Band>
  );
}

function Marquee({ section, props, context }: SectionComponentProps) {
  const p = props as MarqueeProps;
  const items = p.items ?? [];
  if (!items.length) return null;
  const sep = p.separator ?? "✝";
  const duration = p.speed === "slow" ? "50s" : p.speed === "fast" ? "16s" : "28s";
  const Run = ({ hidden }: { hidden?: boolean }) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden}>
      {items.map((it, i) => (
        <span key={i} className="font-display flex items-center gap-8 text-2xl uppercase tracking-tight sm:text-3xl">
          <span>{it.text}</span>
          <span className="text-ember">{sep}</span>
        </span>
      ))}
    </div>
  );
  return (
    <SectionWrapper section={section} context={context} className="overflow-hidden border-y border-line bg-[#0c0805] py-6 text-[#f2e9d8]">
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{ animationDuration: duration, animationDirection: p.direction === "right" ? "reverse" : undefined }}
      >
        <Run />
        <Run hidden />
      </div>
    </SectionWrapper>
  );
}

function Schedule({ section, props, context }: SectionComponentProps) {
  const p = props as ScheduleProps;
  const items = p.items ?? [];
  if (!items.length) return null;
  const showRail = p.showRail !== false;
  return (
    <Band section={section} context={context} narrow>
      <Title section={section} heading={p.heading} />
      <ol className={showRail ? "ml-1 border-l border-line" : ""}>
        {items.map((it, i) => (
          <li key={i} className={`relative py-6 last:pb-0 ${showRail ? "pl-8" : ""}`}>
            {showRail ? <span className="absolute left-0 top-8 size-2.5 -translate-x-1/2 rounded-full bg-ember ring-4 ring-bg" /> : null}
            <p className="micro text-muted">{it.label}</p>
            <p className="font-display text-4xl text-ember sm:text-5xl">{it.time}</p>
            {it.description ? <p className="mt-1 text-sm text-muted">{it.description}</p> : null}
          </li>
        ))}
      </ol>
      {p.note ? <p className="micro mt-6 text-muted">{p.note}</p> : null}
    </Band>
  );
}

function Statement({ section, props, context }: SectionComponentProps) {
  const p = props as StatementProps;
  if (!p.statement) return null;
  return (
    <Band section={section} context={context} narrow>
      {p.eyebrow ? <p className="micro text-ember">{p.eyebrow}</p> : null}
      <p className="font-serif mt-6 text-3xl italic leading-tight sm:text-5xl">{p.statement}</p>
      {p.attribution ? <p className="micro mt-8 text-muted">{p.attribution}</p> : null}
    </Band>
  );
}

/** wa.me deep link from a number (digits / E.164) or a full URL, with optional prefilled text. */
function whatsappHref(number?: string, message?: string): string | undefined {
  const n = number?.trim();
  if (!n) return undefined;
  if (/^https?:\/\//i.test(n)) return n;
  const digits = n.replace(/[^0-9]/g, "");
  if (!digits) return undefined;
  return `https://wa.me/${digits}${message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : ""}`;
}

function GivingMethods({ section, props, context }: SectionComponentProps) {
  const p = props as GivingMethodsProps;
  const methods = p.methods ?? [];
  if (!methods.length) return null;
  const cols = p.columns ?? 4;
  const grid = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={p.heading} />
      {p.description ? <p className="font-serif -mt-6 mb-10 max-w-xl text-xl italic text-muted">{p.description}</p> : null}
      <div className={`grid gap-px border border-line bg-line ${grid}`}>
        {methods.map((m, i) => {
          const featured = p.featuredIndex === i;
          return (
            <div key={i} className={featured ? "bg-ember p-8 text-bg" : "bg-bg p-8"}>
              <h3 className="font-display text-2xl uppercase tracking-tight">{m.title}</h3>
              {m.description ? <p className={`mt-2 text-sm ${featured ? "text-bg/80" : "text-muted"}`}>{m.description}</p> : null}
              {m.kind === "text" && (m.keyword || m.shortcode) ? (
                <p className="font-display mt-5 text-xl">{[m.keyword, m.shortcode].filter(Boolean).join("  →  ")}</p>
              ) : null}
              {m.kind === "online" && m.ctaUrl ? (
                <div className="mt-5">
                  <Button href={m.ctaUrl} variant={featured ? "outline" : "primary"}>
                    {m.ctaLabel ?? "Give now"}
                  </Button>
                </div>
              ) : null}
              {m.kind === "whatsapp" && whatsappHref(m.whatsappNumber, m.whatsappMessage) ? (
                <div className="mt-5">
                  <Button href={whatsappHref(m.whatsappNumber, m.whatsappMessage)!} external variant={featured ? "outline" : "primary"}>
                    {m.ctaLabel ?? "Give on WhatsApp"}
                  </Button>
                </div>
              ) : null}
              {m.kind === "bank" && m.rows?.length ? (
                <dl className="mt-5 space-y-2">
                  {m.rows.map((r, ri) => (
                    <div key={ri} className="flex items-center justify-between gap-3 border-t border-line/60 pt-2">
                      <dt className="micro text-muted">{r.label}</dt>
                      <dd>{r.copyable ? <CopyValue value={r.value} /> : r.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          );
        })}
      </div>
    </Band>
  );
}

function CardBox({ section, props, context }: SectionComponentProps) {
  const p = props as CardBoxProps;
  const cards = (p.cards ?? []) as Array<Record<string, unknown>>;
  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <div key={i} className="bg-bg p-8">
            {typeof c.title === "string" ? <h3 className="font-display text-2xl uppercase tracking-tight">{c.title}</h3> : null}
            {typeof c.description === "string" ? <p className="mt-2 text-sm text-muted">{c.description}</p> : null}
          </div>
        ))}
      </div>
    </Band>
  );
}

function Embed({ section, props, context }: SectionComponentProps) {
  const p = props as EmbedProps;
  const cfg = p.config;
  return (
    <Band section={section} context={context} narrow>
      {cfg.kind === "externalUrl" && typeof cfg.url === "string" ? (
        <iframe src={cfg.url} title={section.title ?? "Embed"} className="h-[60vh] w-full border border-line" />
      ) : cfg.kind === "rawHtml" && typeof cfg.html === "string" ? (
        <iframe srcDoc={cfg.html} title={section.title ?? "Embed"} sandbox="allow-scripts allow-same-origin" className="h-[60vh] w-full border border-line" />
      ) : (
        <p className="micro text-center text-muted">Unsupported embed.</p>
      )}
    </Band>
  );
}

export const flameSections: SectionRegistry = {
  hero: Hero,
  richText: RichTextSection,
  cta: Cta,
  links: Links,
  features: Features,
  accordion: Accordion,
  location: Location,
  video: Video,
  audio: Audio,
  imageGallery: ImageGallery,
  imageSection: ImageSection,
  sermonsList: SermonsList,
  eventsList: EventsList,
  givingCta: GivingCta,
  givingMethods: GivingMethods,
  profileCards: ProfileCards,
  cardBox: CardBox,
  marquee: Marquee,
  schedule: Schedule,
  statement: Statement,
  embed: Embed,
};
