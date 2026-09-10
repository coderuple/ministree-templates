import {
  RichText,
  SectionWrapper,
  Sections,
  assertRegistryMatchesSupports,
  getForm,
  getGroups,
  getPeople,
  getSermons,
  getEvents,
  getTeams,
  hrefFor,
  type AccordionProps,
  type AudioProps,
  type CardBoxProps,
  type CtaProps,
  type EmbedProps,
  type EventListItem,
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
  type CarouselProps,
  type ColumnsProps,
  type GroupsListProps,
  type ProfileHeaderProps,
  type Sermon,
  type SermonGroupsProps,
  type SermonsListProps,
  type TeamsListProps,
  type StatementProps,
  type VideoProps,
} from "@ministree/template-sdk";
import { Button, Container } from "@/components/ui";
import MarqueeBand from "@/components/Marquee";
import { EventCard, SermonCard } from "@/components/cards";
import { CopyValue } from "@/components/copy-value";
import { loadSlugs, manifest } from "@/lib/ministree";
import MagneticButton from "@/components/MagneticButton";
import FormRenderer from "@/components/FormRenderer";
import { extractFormFields } from "@/lib/forms";

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
  const spacing = BAND_SPACING[(section as { spacing?: string }).spacing ?? ""] ?? BAND_SPACING.normal;
  return (
    <SectionWrapper section={section} context={context} className={`bg-bg ${spacing} text-ink ${className}`}>
      <Container size={narrow ? "narrow" : "default"}>{children}</Container>
    </SectionWrapper>
  );
}

/** A section's own vertical rhythm (its Spacing setting) in flame's scale —
 *  `normal` is flame's native band. Literal classes so Tailwind keeps them. */
const BAND_SPACING: Record<string, string> = {
  compact: "py-12 sm:py-16",
  normal: "py-20 sm:py-28",
  spacious: "py-28 sm:py-40",
};

/** A "Custom list" row as the platform stores it — the SDK types these as `unknown[]`. */
type StaticRow = { title: string; description?: string; imageUrl?: string; startAt?: string; dateHint?: string; linkUrl?: string };

/** The hand-made rows worth a card: anything with a title. */
function staticRows(items: unknown[] | undefined): StaticRow[] {
  return (items ?? []).filter(
    (row): row is StaticRow =>
      !!row && typeof row === "object" && typeof (row as StaticRow).title === "string" && (row as StaticRow).title.trim() !== "",
  );
}

function rowToSermon(row: StaticRow, id: string): Sermon {
  return { id, slug: "", title: row.title, date: row.dateHint, description: row.description ?? null, thumbnailUrl: row.imageUrl || null };
}

function rowToEvent(row: StaticRow, id: string): EventListItem {
  return { id, slug: "", title: row.title, description: row.description ?? null, startAt: row.startAt ?? "", coverImageUrl: row.imageUrl || null };
}

type CtaLike = { label?: string; url?: string; href?: string; variant?: string };

/** Ministree's button variants, mapped onto the four this design draws. */
function buttonVariant(v: string | undefined, i: number, onDark: boolean): "primary" | "outline" | "ghost" | "dark" {
  if (!v || v === "default" || v === "custom") return i === 0 ? "primary" : "outline";
  if (v.startsWith("ghost") || v === "link") return "ghost";
  if (v.startsWith("outline")) return "outline";
  if (v === "white" || v.startsWith("glass")) return onDark ? "outline" : "dark";
  return "primary";
}

function Ctas({ ctas, className = "", onDark = false }: { ctas?: CtaLike[]; className?: string; onDark?: boolean }) {
  const items = (ctas ?? []).filter((c) => c.label && (c.url ?? c.href));
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((c, i) => {
        const href = c.url ?? c.href ?? "#";
        return (
          <MagneticButton key={i} href={href} variant={buttonVariant(c.variant, i, onDark)} external={/^https?:/i.test(href)}>
            {c.label}
          </MagneticButton>
        );
      })}
    </div>
  );
}

function Title({ section, heading }: { section: PageSection; heading?: string }) {
  const title = heading ?? section.title;
  if (!title || section.hideTitle) return null;
  return (
    <div className="mb-10">
      {section.subtitle && !section.hideSubtitle ? <p className="micro text-ember">{section.subtitle}</p> : null}
      <h2 className="font-display mt-3 text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{title}</h2>
    </div>
  );
}

function Hero({ section, props, context }: SectionComponentProps) {
  const p = props as HeroProps & {
    subtitle?: string;
    text?: string;
    badgeText?: string;
    ctas?: CtaLike[];
    backgroundColor?: string;
    backgroundGradient?: string;
    backgroundImageUrl?: string;
    contentAlignHorizontal?: "left" | "center" | "right";
    height?: "compact" | "default" | "tall" | "full";
  };
  const title = p.title ?? section.title ?? "";
  const subtitle = p.subtitle ?? section.subtitle;
  /* The hero keeps its background on its own props rather than on the wrapper.
     Hand them to the wrapper as a section background so the same layer stack
     draws them, image on top of paint, in the order the church chose. */
  const hasBackground = Boolean(p.backgroundImageUrl || p.backgroundColor || p.backgroundGradient);
  const withBackground = hasBackground
    ? {
        ...section,
        background: {
          ...(section.background ?? {}),
          backgroundColor: p.backgroundColor,
          backgroundGradient: p.backgroundGradient,
          backgroundImageUrl: p.backgroundImageUrl,
        },
      }
    : section;
  const hasImage = Boolean(p.backgroundImageUrl);
  const align = p.contentAlignHorizontal ?? "center";
  const alignClass =
    align === "left" ? "items-start text-left" : align === "right" ? "items-end text-right" : "items-center text-center";
  const heightClass =
    p.height === "compact"
      ? "py-16 sm:py-20"
      : p.height === "tall"
        ? "py-40 sm:py-52"
        : p.height === "full"
          ? "flex min-h-[calc(100svh-4rem)] items-center py-28"
          : "py-28 sm:py-36";
  return (
    <SectionWrapper
      section={withBackground}
      context={context}
      className={`relative overflow-hidden ${hasImage ? "text-panel-ink" : "bg-surface/40 text-ink"} ${heightClass}`}
    >
      {hasImage ? (
        // A photograph behind display type needs a scrim for the words to read.
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_120%,_color-mix(in_srgb,var(--ember)_18%,transparent),transparent_60%)]" />
      )}
      <Container className={`relative flex w-full flex-col ${alignClass}`}>
        {p.badgeText ? (
          <span className="micro inline-block rounded-full border border-current/30 px-3 py-1">{p.badgeText}</span>
        ) : null}
        {subtitle ? <p className={`micro text-ember ${p.badgeText ? "mt-4" : ""}`}>{subtitle}</p> : null}
        <h1 className="font-display mt-5 max-w-4xl text-6xl uppercase leading-[0.88] tracking-tight sm:text-8xl">{title}</h1>
        {p.text ? <p className="font-serif mt-6 max-w-2xl text-xl italic opacity-80">{p.text}</p> : null}
        <Ctas ctas={p.ctas} className="mt-9" onDark={hasImage} />
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
      <div className="relative overflow-hidden border border-line bg-panel px-8 py-20 text-center text-panel-ink">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[var(--flame)]/25 blur-3xl" />
        {p.heading ? <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{p.heading}</h2> : null}
        {p.description ? <p className="font-serif mx-auto mt-4 max-w-xl text-xl italic text-panel-ink/70">{p.description}</p> : null}
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
  const cols = p.layout === "grid" ? Number(p.columns ?? 2) : 1;
  const grid = cols >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : cols === 2 ? "sm:grid-cols-2" : "";
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={p.heading} />
      {p.description ? <p className="-mt-6 mb-8 max-w-2xl text-muted">{p.description}</p> : null}
      <div className={`grid gap-px border border-line bg-line ${grid}`}>
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
  const p = props as FeaturesProps & { markerStyle?: "number" | "letter" | "icon" | "none"; align?: "inherit" | "left" | "center" | "right" };
  const marker = (i: number) =>
    p.markerStyle === "none" ? null : p.markerStyle === "letter" ? String.fromCharCode(65 + i) : String(i + 1).padStart(2, "0");
  const alignClass = p.align === "center" ? "text-center" : p.align === "right" ? "text-right" : "";
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={p.heading} />
      <div className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-3 ${alignClass}`}>
        {(p.items ?? []).map((f, i) => (
          <div key={i} className="border-t border-line pt-5">
            {marker(i) ? <p className="font-display text-sm text-ember">{marker(i)}</p> : null}
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
      <div className="aspect-video overflow-hidden border border-line bg-panel">
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
  const n = Number(p.columns ?? 3);
  const items = p.items ?? [];
  if (p.layout === "masonry") {
    const cols = n === 4 ? "columns-2 sm:columns-3 lg:columns-4" : n === 2 ? "columns-2" : "columns-2 sm:columns-3";
    return (
      <Band section={section} context={context}>
        <Title section={section} />
        <div className={`${cols} gap-2 [&>img]:mb-2 [&>img]:break-inside-avoid`}>
          {items.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img.imageUrl} alt={img.alt} className="w-full border border-line object-cover transition-transform duration-700 hover:scale-[1.03]" />
          ))}
        </div>
      </Band>
    );
  }
  const cols = n === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : n === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3";
  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className={`grid gap-2 ${cols}`}>
        {items.map((img, i) => (
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
  const chosen = p.source === "chosen" ? (p.sermonIds ?? []) : null;
  const [data, slugs] = await Promise.all([
    p.source === "static" || (chosen && chosen.length === 0)
      ? Promise.resolve(null)
      : getSermons(undefined, chosen ? { ids: chosen.join(",") } : { limit, ...(p.seriesSlug ? { seriesSlug: p.seriesSlug } : {}) }),
    loadSlugs(),
  ]);
  // A custom list is the section's own rows, each linked wherever it says.
  const cards: { sermon: Sermon; href: string }[] =
    p.source === "static"
      ? staticRows(p.staticItems)
          .slice(0, limit)
          .map((row, i) => ({ sermon: rowToSermon(row, `${section.id}-${i}`), href: row.linkUrl || "#" }))
      : (data?.items ?? []).map((s) => ({ sermon: s, href: hrefFor(slugs, "sermons", s.slug) }));
  if (!cards.length) return null;
  const cols = p.columns === 2 ? "sm:grid-cols-2" : p.columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={section.title ?? "Latest messages"} />
      <div className={p.layout === "list" ? "grid gap-6" : `grid gap-6 ${cols}`}>
        {cards.map(({ sermon, href }) => (
          <SermonCard key={sermon.id} sermon={sermon} href={href} />
        ))}
      </div>
    </Band>
  );
}

async function EventsList({ section, props, context }: SectionComponentProps) {
  const p = props as EventsListProps;
  const limit = p.limit ?? 5;
  const chosen = p.source === "chosen" ? (p.eventIds ?? []) : null;
  const [data, slugs] = await Promise.all([
    p.source === "static" || (chosen && chosen.length === 0)
      ? Promise.resolve(null)
      : getEvents(undefined, chosen ? { ids: chosen.join(",") } : { limit, when: "upcoming" }),
    loadSlugs(),
  ]);
  const cards: { event: EventListItem; href: string }[] =
    p.source === "static"
      ? staticRows(p.staticItems)
          // An event card is a date badge — a row without a real date has nothing to show.
          .filter((row) => !Number.isNaN(Date.parse(row.startAt ?? "")))
          .slice(0, limit)
          .map((row, i) => ({ event: rowToEvent(row, `${section.id}-${i}`), href: row.linkUrl || "#" }))
      : (data?.items ?? []).map((e) => ({ event: e, href: hrefFor(slugs, "events", e.slug) }));
  if (!cards.length) return null;
  const cols = p.columns === 2 ? "sm:grid-cols-2" : p.columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Band section={section} context={context}>
      <Title section={section} heading={section.title ?? "Upcoming events"} />
      <div className={p.layout === "grid" ? `grid gap-6 ${cols}` : "space-y-4"}>
        {cards.map(({ event, href }) => (
          <EventCard key={event.id} event={event} href={href} />
        ))}
      </div>
    </Band>
  );
}

async function GivingCta({ section, props, context }: SectionComponentProps) {
  const p = props as GivingCtaProps & { appearance?: string; ctas?: CtaLike[] };
  const slugs = await loadSlugs();
  const ctas: CtaLike[] = p.ctas?.length ? p.ctas : [{ label: "Give now", url: hrefFor(slugs, "giving") }];
  const plain = p.appearance === "plain";
  const inner = (
    <>
      <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">{p.heading ?? "Partner with the vision"}</h2>
      {p.description ? (
        <p className={`font-serif mx-auto mt-4 max-w-xl text-xl italic ${plain ? "text-muted" : "text-panel-ink/70"}`}>{p.description}</p>
      ) : null}
      <Ctas ctas={ctas} className="mt-9 justify-center" onDark={!plain} />
    </>
  );
  return (
    <Band section={section} context={context}>
      {plain ? (
        <div className="text-center">{inner}</div>
      ) : (
        <div className="relative overflow-hidden border border-line bg-panel px-8 py-20 text-center text-panel-ink">
          <div aria-hidden className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-[var(--ember)]/25 blur-3xl" />
          {inner}
        </div>
      )}
    </Band>
  );
}

type ProfileCard = { imageUrl?: string; name: string; subtitle?: string; description?: string; link?: string };

/** `source: 'people'` / `'chosen'` — the church's People, as the builder picked them. */
async function livePeople(p: ProfileCardsProps): Promise<ProfileCard[]> {
  const params =
    p.source === "chosen"
      ? p.personIds?.length
        ? { ids: p.personIds.join(",") }
        : null
      : { ...(p.tagSlug ? { tagSlug: String(p.tagSlug) } : {}), limit: p.limit ?? 6 };
  if (!params) return [];
  const data = await getPeople(undefined, params);
  return (data?.items ?? []).map((x) => ({
    imageUrl: x.portraitUrl ?? x.avatarUrl,
    name: [x.firstName, x.lastName].filter(Boolean).join(" ").trim(),
    subtitle: x.role,
    description: x.metadata?.bio,
  }));
}

function CardShell({ card, className, children }: { card: ProfileCard; className: string; children: React.ReactNode }) {
  return card.link ? (
    <a href={card.link} data-cursor className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

async function ProfileCards({ section, props, context }: SectionComponentProps) {
  const p = props as ProfileCardsProps;
  const source = p.source ?? "static";
  const cards: ProfileCard[] =
    source === "static" ? (p.cards ?? []).filter((c) => c.name?.trim()) : await livePeople(p);
  if (!cards.length) return null;
  const layout = p.layout ?? "grid";

  // Roster: the cinematic "lineup" — a typographic numbered list with ember hover.
  if (layout === "roster") {
    return (
      <Band section={section} context={context}>
        <Title section={section} />
        <div className="border-t border-line">
          {cards.map((c, i) => (
            <CardShell key={i} card={c} className="group flex items-baseline gap-6 border-b border-line py-6">
              <span className="font-display text-sm text-ember">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-3xl uppercase tracking-tight transition-colors group-hover:text-ember sm:text-5xl">
                {c.name}
              </span>
              {c.subtitle ? <span className="micro ml-auto text-right text-muted">{c.subtitle}</span> : null}
            </CardShell>
          ))}
        </div>
      </Band>
    );
  }

  // List: a portrait beside the words, one person per row.
  if (layout === "list") {
    return (
      <Band section={section} context={context}>
        <Title section={section} />
        <div className="divide-y divide-line border-y border-line">
          {cards.map((c, i) => (
            <CardShell key={i} card={c} className="group flex items-center gap-6 py-6">
              <div className="size-20 shrink-0 overflow-hidden border border-line bg-surface sm:size-24">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl uppercase tracking-tight transition-colors group-hover:text-ember">{c.name}</p>
                {c.subtitle ? <p className="micro mt-1 text-muted">{c.subtitle}</p> : null}
                {c.description ? <p className="mt-2 text-sm text-muted">{c.description}</p> : null}
              </div>
            </CardShell>
          ))}
        </div>
      </Band>
    );
  }

  // Grid, or circles: the same grid with round portraits and no card chrome.
  const circles = layout === "circles";
  const cols = p.columns ?? 3;
  const grid = cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className={`grid gap-6 ${grid}`}>
        {cards.map((c, i) => (
          <CardShell key={i} card={c} className="group text-center">
            <div
              className={`mx-auto aspect-square overflow-hidden bg-surface ${circles ? "w-3/4 rounded-full" : "w-full border border-line"}`}
            >
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              ) : null}
            </div>
            <p className="font-display mt-4 text-xl uppercase tracking-tight">{c.name}</p>
            {c.subtitle ? <p className="micro mt-1 text-muted">{c.subtitle}</p> : null}
            {c.description ? <p className="mt-2 text-sm text-muted">{c.description}</p> : null}
          </CardShell>
        ))}
      </div>
    </Band>
  );
}

function Marquee({ section, props, context }: SectionComponentProps) {
  const p = props as MarqueeProps;
  const items = (p.items ?? []).map((it) => it.text).filter(Boolean);
  if (!items.length) return null;
  /* Delegates to the shared self-measuring band. This renderer used to be its
     own copy with NO repetition - one run per half - so any phrase narrower
     than the viewport scrolled past followed by an equal width of nothing. */
  return (
    <SectionWrapper section={section} context={context} className="overflow-hidden border-y border-line bg-panel py-6 text-panel-ink">
      <MarqueeBand
        items={items}
        separator={p.separator ?? "\u271d"}
        speed={p.speed === "slow" ? "slow" : p.speed === "fast" ? "fast" : "normal"}
        direction={p.direction === "right" ? "right" : "left"}
        className=""
      />
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

type CardBlock = { type?: string; text?: string; display?: string; doc?: unknown; content?: unknown; imageUrl?: string; alt?: string; items?: Array<{ label?: string; url?: string }> };

function CardBoxCard({ card }: { card: Record<string, unknown> }) {
  const blocks = (card.blocks ?? []) as CardBlock[];
  const link = (card.cardLink as { url?: string; href?: string } | undefined) ?? undefined;
  const href = link?.url ?? link?.href;
  const body = blocks.map((b, i) => {
    switch (b.type) {
      case "heading":
        return b.display === "cardTitle" || !b.display ? (
          <h3 key={i} className="font-display text-2xl uppercase tracking-tight">{b.text}</h3>
        ) : (
          <p key={i} className="micro text-ember">{b.text}</p>
        );
      case "richText":
        return <RichText key={i} doc={(b.content ?? b.doc) as Parameters<typeof RichText>[0]["doc"]} className="text-sm text-muted" />;
      case "image":
        return b.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={b.imageUrl} alt={b.alt ?? ""} className="w-full border border-line object-cover" />
        ) : null;
      case "linkList":
        return (
          <div key={i} className="flex flex-wrap gap-x-4 gap-y-2">
            {(b.items ?? []).map((it, j) => (
              <a key={j} href={it.url ?? "#"} className="micro text-ember">
                {it.label} →
              </a>
            ))}
          </div>
        );
      default:
        return null;
    }
  });
  const cls = "block bg-bg p-8 space-y-4 transition-colors";
  return href ? (
    <a href={href} data-cursor className={`${cls} hover:bg-surface`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function CardBox({ section, props, context }: SectionComponentProps) {
  const p = props as CardBoxProps & { gridGap?: string };
  const cards = (p.cards ?? []) as Array<Record<string, unknown>>;
  const gap =
    p.gridGap === "none" ? "gap-0" : p.gridGap === "sm" ? "gap-2" : p.gridGap === "md" ? "gap-4" : p.gridGap === "xl" ? "gap-10" : p.gridGap === "2xl" ? "gap-14" : "gap-px";
  const layout = p.layoutMode === "stack" ? "flex flex-col" : "grid sm:grid-cols-2 lg:grid-cols-3";
  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className={`${layout} ${gap} ${gap === "gap-px" ? "border border-line bg-line" : ""}`}>
        {cards.map((c, i) => (
          <CardBoxCard key={i} card={c} />
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

/* ── Sections a church can add in Ministree that flame previously dropped ──
   `Sections` skips any type its registry doesn't know, silently. So a church
   could add a form, a carousel or a staff list to a page, publish, and see a
   gap where it should be. These close that. */

/** An embedded form — the same renderer as /forms/[slug], inline on a page. */
async function FormSection({ section, props, context }: SectionComponentProps<Record<string, unknown>>) {
  const slug = typeof props.formSlug === "string" ? props.formSlug : undefined;
  const form = slug ? await getForm(slug) : null;
  const fields = form ? extractFormFields(form) : [];
  if (!form || fields.length === 0) return null;

  return (
    <Band section={section} context={context} narrow>
      <Title section={section} heading={section.title ?? (form.title as string)} />
      <FormRenderer slug={slug!} fields={fields as never} />
    </Band>
  );
}

/** Side-by-side columns, each holding its own stack of sections. */
function Columns({ section, props, context }: SectionComponentProps<ColumnsProps>) {
  const items = (props.items ?? []) as PageSection[];
  if (items.length === 0) return null;
  const count = props.count ?? 2;
  const cols = count === 4 ? "md:grid-cols-4" : count === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      {/* Each column is its own section stack, so anything the registry renders
          can nest here — including another set of columns. */}
      <div className={`grid gap-8 ${cols}`}>
        {items.map((item, i) => (
          <div key={item.id ?? i}>
            <Sections sections={[item]} registry={flameSections} context={context} />
          </div>
        ))}
      </div>
    </Band>
  );
}

/** A horizontal run of slides. CSS scroll-snap rather than a carousel library:
 *  it keeps keyboard and touch behaviour native, and works without JS. */
function Carousel({ section, props, context }: SectionComponentProps<CarouselProps>) {
  const slides = props.slides ?? [];
  if (slides.length === 0) return null;
  const per = props.slidesPerView ?? "1";
  const basis =
    per === "4" ? "sm:basis-1/3 lg:basis-1/4" : per === "3" ? "sm:basis-1/2 lg:basis-1/3" : per === "2" ? "sm:basis-1/2" : "";

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3">
        {slides.map((slide, i) => (
          <figure
            key={i}
            className={`relative w-[85%] shrink-0 snap-start overflow-hidden rounded-flame border border-line ${basis}`}
          >
            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.imageUrl} alt={slide.alt ?? ""} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full bg-surface" />
            )}
            {slide.heading || slide.text ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-panel to-transparent p-5 text-panel-ink">
                {slide.badge ? <p className="micro mb-1 text-ember">{slide.badge}</p> : null}
                {slide.heading ? <p className="font-display text-xl uppercase">{slide.heading}</p> : null}
                {slide.text ? <p className="mt-1 text-sm text-panel-ink/75">{slide.text}</p> : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Band>
  );
}

/** A person or ministry at the top of its own page. */
function ProfileHeader({ section, props, context }: SectionComponentProps<ProfileHeaderProps>) {
  if (!props.name) return null;
  return (
    <Band section={section} context={context}>
      <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-end sm:text-left">
        {props.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.imageUrl}
            alt={props.name}
            className="h-40 w-40 shrink-0 rounded-flame object-cover"
          />
        ) : null}
        <div className="min-w-0">
          {props.subtitle ? <p className="micro text-ember">{props.subtitle}</p> : null}
          <h1 className="font-display mt-2 text-4xl uppercase leading-[0.95] tracking-tight sm:text-5xl">
            {props.name}
          </h1>
          {props.description ? (
            <p className="font-serif mt-4 max-w-2xl text-xl italic text-muted">{props.description}</p>
          ) : null}
          {props.stats?.length ? (
            <dl className="mt-6 flex flex-wrap justify-center gap-8 sm:justify-start">
              {props.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="micro text-muted">{stat.label}</dt>
                  <dd className="font-display text-2xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {props.ctaLabel && props.ctaUrl ? (
            <div className="mt-6">
              <Button href={props.ctaUrl}>{props.ctaLabel}</Button>
            </div>
          ) : null}
        </div>
      </div>
    </Band>
  );
}

/** Small groups — from the church's own list, or hand-written. */
async function GroupsList({ section, props, context }: SectionComponentProps<GroupsListProps>) {
  const chosen = props.source === "chosen" ? (props.groupIds ?? []) : null;
  const live =
    props.source === "static" || (chosen && chosen.length === 0)
      ? null
      : await getGroups(undefined, chosen ? { ids: chosen.join(",") } : { limit: props.limit ?? 12 });
  const items =
    props.source === "static"
      ? (props.groups ?? []).map((g) => ({
          id: g.name,
          name: g.name,
          description: g.description,
          when: g.schedule,
          href: g.ctaUrl,
          ctaLabel: g.ctaLabel,
        }))
      : (live?.items ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          when: [g.meetingDay, g.meetingTime].filter(Boolean).join(" · ") || undefined,
          href: undefined as string | undefined,
          ctaLabel: undefined as string | undefined,
        }));
  if (items.length === 0) return null;
  const list = props.layout === "list";

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className={list ? "divide-y divide-line border-y border-line" : "grid gap-px overflow-hidden rounded-flame border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"}>
        {items.map((g) => (
          <div key={g.id} className={list ? "py-5" : "bg-bg p-6"}>
            <p className="font-display text-xl uppercase">{g.name}</p>
            {g.when ? <p className="micro mt-1 text-ember">{g.when}</p> : null}
            {g.description ? <p className="mt-3 text-sm text-muted">{g.description}</p> : null}
            {g.href ? (
              <a href={g.href} className="micro mt-4 inline-block text-ember">
                {g.ctaLabel ?? props.ctaLabel ?? "Find out more"} →
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Band>
  );
}

/** Serving teams, with their open positions where the church tracks them. */
async function TeamsList({ section, props, context }: SectionComponentProps<TeamsListProps>) {
  const chosen = props.source === "chosen" ? (props.teamIds ?? []) : null;
  const live =
    props.source === "static" || (chosen && chosen.length === 0)
      ? null
      : await getTeams(undefined, chosen ? { ids: chosen.join(",") } : { limit: props.limit ?? 12 });
  const items =
    props.source === "static"
      ? (props.teams ?? []).map((t) => ({
          id: t.name,
          name: t.name,
          description: t.description,
          openings: t.openings,
          href: t.ctaUrl,
        }))
      : (live?.items ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          openings: t.openPositions ? `${t.openPositions} open` : undefined,
          href: undefined as string | undefined,
        }));
  if (items.length === 0) return null;
  const grid = props.layout === "grid";

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <ul className={grid ? "grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3" : "divide-y divide-line border-y border-line"}>
        {items.map((t) => (
          <li key={t.id} className={grid ? "bg-bg p-6" : "flex flex-wrap items-baseline gap-x-4 gap-y-1 py-5"}>
            <p className="font-display text-xl uppercase">{t.name}</p>
            {t.openings ? <span className="micro text-ember">{t.openings}</span> : null}
            {t.description ? <p className={grid ? "mt-3 text-sm text-muted" : "w-full text-sm text-muted sm:w-auto sm:flex-1"}>{t.description}</p> : null}
            {t.href ? (
              <a href={t.href} className="micro text-ember">
                {props.ctaLabel ?? "Join"} →
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </Band>
  );
}

/** Rails of sermons, one per series / speaker / topic the church picked. */
async function SermonGroups({ section, props, context }: SectionComponentProps<SermonGroupsProps>) {
  const groups = (props.groups ?? []).slice(0, 6);
  if (groups.length === 0) return null;
  const slugs = await loadSlugs();

  const rails = await Promise.all(
    groups.map(async (g, gi) => {
      // A custom-list group carries its own rows — nothing to fetch.
      if ((g.sourceType as string) === "static") {
        const rows = staticRows((g as { items?: unknown[] }).items).slice(0, g.limit ?? 8);
        return {
          group: g,
          cards: rows.map((row, i) => ({ sermon: rowToSermon(row, `${section.id}-${gi}-${i}`), href: row.linkUrl || "#" })),
        };
      }
      const params: Record<string, string | number> = { limit: g.limit ?? 8 };
      if (g.sourceType === "series" && g.seriesSlug) params.seriesSlug = g.seriesSlug;
      if (g.sourceType === "speaker" && g.speakerId) params.speakerId = g.speakerId;
      if (g.sourceType === "topic" && g.tag) params.tags = g.tag;
      if (g.sourceType === "scripture" && g.book) params.book = g.book;
      const data = await getSermons(undefined, params);
      return {
        group: g,
        cards: (data?.items ?? []).map((sermon) => ({ sermon, href: hrefFor(slugs, "sermons", sermon.slug) })),
      };
    }),
  );

  return (
    <Band section={section} context={context}>
      <Title section={section} />
      <div className="space-y-12">
        {rails.filter((r) => r.cards.length > 0).map((rail, i) => (
          <div key={i}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <div>
                {rail.group.subtitle ? <p className="micro text-ember">{rail.group.subtitle}</p> : null}
                <h3 className="font-display text-2xl uppercase">{rail.group.title ?? "Sermons"}</h3>
              </div>
            </div>
            {/* Scroll-snap rail: native momentum on touch, arrow keys on desktop. */}
            <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
              {rail.cards.map(({ sermon, href }) => (
                <div key={sermon.id} className="w-64 shrink-0 snap-start">
                  <SermonCard sermon={sermon} href={href} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Band>
  );
}

export const flameSections: SectionRegistry = {
  hero: Hero,
  form: FormSection,
  columns: Columns,
  carousel: Carousel,
  profileHeader: ProfileHeader,
  groupsList: GroupsList,
  teamsList: TeamsList,
  sermonGroups: SermonGroups,
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

/* Dev-only: a type declared in the manifest with no component here, or a
   component the manifest never mentions, is a promise the site cannot keep. */
assertRegistryMatchesSupports(manifest.supports.sections, flameSections);
