import Link from "next/link";
import { getEvents, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState, Pagination } from "@/components/ui";
import { EventCard } from "@/components/cards";

export const revalidate = 60;
export const metadata = { title: "Events" };

export default async function EventsArchive({ searchParams }: { searchParams: Promise<{ page?: string; when?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const when = sp.when === "past" ? "past" : "upcoming";
  const limit = 12;
  const [data, slugs] = await Promise.all([getEvents(undefined, { page, limit, when }), loadSlugs()]);
  const items = data?.items ?? [];
  const base = hrefFor(slugs, "events");

  return (
    <>
      <ArchiveHeader eyebrow="Gather" title="Events" description="What's coming up — services, gatherings and special nights." />
      <Container className="py-12">
        <div className="mb-8 flex gap-4 text-sm">
          <Link href={base} className={when === "upcoming" ? "font-semibold text-ember" : "text-muted hover:text-ember"}>
            Upcoming
          </Link>
          <Link href={`${base}?when=past`} className={when === "past" ? "font-semibold text-ember" : "text-muted hover:text-ember"}>
            Past
          </Link>
        </div>
        {items.length ? (
          <>
            <div className="space-y-4">
              {items.map((e) => (
                <EventCard key={e.id} event={e} href={hrefFor(slugs, "events", e.slug)} />
              ))}
            </div>
            <Pagination basePath={base} page={page} total={data?.total ?? items.length} limit={limit} />
          </>
        ) : (
          <EmptyState title="No events to show" body="Check back soon for what's coming up." />
        )}
      </Container>
    </>
  );
}
