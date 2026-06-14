import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, hrefFor, Sections } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
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
  const [event, slugs] = await Promise.all([getEvent(slug), loadSlugs()]);
  if (!event) notFound();

  return (
    <article>
      <header className="border-b border-border bg-surface/50">
        <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>{formatDateRange(event.startAt, event.endAt)}</Eyebrow>
            <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl">{event.title ?? "Event"}</h1>
            {event.location ? <p className="mt-3 text-muted">{event.location}</p> : null}
            {event.description ? <p className="mt-5 max-w-2xl text-lg text-muted">{event.description}</p> : null}
            <div className="mt-7">
              <Button href={`${hrefFor(slugs, "events", event.slug)}#register`}>Register</Button>
            </div>
          </div>
          {event.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.coverImageUrl} alt={event.title ?? "Event"} className="aspect-[4/3] w-full rounded-2xl object-cover" />
          ) : null}
        </Container>
      </header>

      {event.scheduleItems?.length ? (
        <Container size="narrow" className="py-12">
          <h2 className="mb-6 font-display text-2xl font-semibold">Schedule</h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-bg">
            {event.scheduleItems.map((it) => (
              <li key={it.id} className="flex items-center justify-between px-5 py-4">
                <span>{it.title}</span>
                <span className="text-sm text-muted">{formatDateRange(it.startAt, it.endAt)}</span>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      {event.ticketTypes?.length ? (
        <Container size="narrow" className="py-6" >
          <div id="register" className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold">Tickets</h2>
            <ul className="mt-4 divide-y divide-border">
              {event.ticketTypes.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <span>{t.name}</span>
                  <span className="font-medium text-accent">{formatPrice(t.price)}</span>
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
        <Link href={hrefFor(slugs, "events")} className="text-sm text-accent hover:underline">
          ← All events
        </Link>
      </Container>
    </article>
  );
}
