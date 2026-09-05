import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, hrefFor, Sections } from "@ministree/template-sdk";
import { loadLocale, loadSlugs } from "@/lib/ministree";
import { flameSections } from "@/sections";
import { Button, Container, Eyebrow } from "@/components/ui";
import { formatDateRange, formatPrice } from "@/lib/format";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return { title: event.title ?? "Event", description: event.description ?? undefined };
}

export default async function EventDetail({ params }: Params) {
  const { slug } = await params;
  const [event, slugs, locale] = await Promise.all([getEvent(slug), loadSlugs(), loadLocale()]);
  if (!event) notFound();

  // The event carries its own currency; `formatPrice` used to assume USD, so a
  // £12 ticket rendered as $12. Not on EventDetail's declared type, hence the check.
  const rawCurrency = (event as unknown as { currency?: unknown }).currency;
  const currency = typeof rawCurrency === "string" && rawCurrency ? rawCurrency : "USD";

  return (
    <article>
      <header className="border-b border-line bg-surface/50">
        <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>{formatDateRange(event.startAt, event.endAt, locale)}</Eyebrow>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl">{event.title ?? "Event"}</h1>
            {event.location ? <p className="mt-3 text-muted">{event.location}</p> : null}
            {event.description ? <p className="mt-5 max-w-2xl text-lg text-muted">{event.description}</p> : null}
            <div className="mt-7">
              <Button href={`${hrefFor(slugs, "events", event.slug)}#register`}>Register</Button>
            </div>
          </div>
          {event.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.coverImageUrl} alt={event.title ?? "Event"} className="aspect-[4/3] w-full rounded-flame object-cover" />
          ) : null}
        </Container>
      </header>

      {event.scheduleItems?.length ? (
        <Container size="narrow" className="py-12">
          <h2 className="mb-6 font-display text-2xl font-semibold">Schedule</h2>
          <ul className="divide-y divide-line rounded-flame border border-line bg-bg">
            {event.scheduleItems.map((it) => (
              <li key={it.id} className="flex items-center justify-between px-5 py-4">
                <span>{it.title}</span>
                <span className="text-sm text-muted">{formatDateRange(it.startAt, it.endAt, locale)}</span>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      {event.ticketTypes?.length ? (
        <Container size="narrow" className="py-6" >
          <div id="register" className="rounded-flame border border-line bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">Tickets</h2>
            <ul className="mt-4 divide-y divide-line">
              {event.ticketTypes.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <span>{t.name}</span>
                  <span className="font-medium text-ember">{formatPrice(t.price, currency, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      ) : null}

      {event.pageSectionsJson?.sections?.length ? (
        <Sections sections={event.pageSectionsJson.sections} registry={flameSections} />
      ) : null}

      <Container className="py-12">
        <Link href={hrefFor(slugs, "events")} className="text-sm text-ember hover:underline">
          ← All events
        </Link>
      </Container>
    </article>
  );
}
