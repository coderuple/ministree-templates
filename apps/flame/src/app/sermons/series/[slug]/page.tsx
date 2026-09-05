import { notFound } from "next/navigation";
import { getSermonSeriesDetail, getSermons, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";
import { SermonCard } from "@/components/cards";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const series = await getSermonSeriesDetail(slug);
  return series ? { title: series.name } : {};
}

export default async function SeriesDetail({ params }: Params) {
  const { slug } = await params;
  const [series, data, slugs] = await Promise.all([
    getSermonSeriesDetail(slug),
    getSermons(undefined, { seriesSlug: slug, limit: 48 }),
    loadSlugs(),
  ]);
  if (!series) notFound();
  const items = data?.items ?? [];

  return (
    <>
      <ArchiveHeader eyebrow="Series" title={series.name} description={series.description} />
      <Container className="py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No messages in this series yet" />
        )}
      </Container>
    </>
  );
}
