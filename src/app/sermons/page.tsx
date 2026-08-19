import Link from "next/link";
import { getSermons, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState, Pagination } from "@/components/ui";
import { SermonCard } from "@/components/cards";

export const revalidate = 60;

export const metadata = { title: "Sermons" };

export default async function SermonsArchive({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = 12;
  const [data, slugs] = await Promise.all([getSermons(undefined, { page, limit }), loadSlugs()]);
  const items = data?.items ?? [];

  return (
    <>
      <ArchiveHeader eyebrow="Watch & listen" title="Sermons" description="Messages from our gatherings — watch, listen, and dig deeper." />
      <Container className="py-12">
        <div className="mb-8 flex gap-4 text-sm">
          <Link href={`${hrefFor(slugs, "sermons")}/series`} className="text-ember hover:underline">
            Browse series
          </Link>
          <Link href={`${hrefFor(slugs, "sermons")}/speakers`} className="text-ember hover:underline">
            Speakers
          </Link>
        </div>
        {items.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
              ))}
            </div>
            <Pagination basePath={hrefFor(slugs, "sermons")} page={page} total={data?.total ?? items.length} limit={limit} />
          </>
        ) : (
          <EmptyState title="No sermons yet" body="Once this church publishes sermons, they'll appear here." />
        )}
      </Container>
    </>
  );
}
