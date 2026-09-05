import Link from "next/link";
import { getSermonSeries, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Sermon series" };

export default async function SeriesArchive() {
  const [series, slugs] = await Promise.all([getSermonSeries(), loadSlugs()]);
  const items = series ?? [];
  const base = `${hrefFor(slugs, "sermons")}/series`;

  return (
    <>
      <ArchiveHeader eyebrow="Sermons" title="Series" description="Explore messages grouped into teaching series." />
      <Container className="py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <Link key={s.id} href={`${base}/${s.slug}`} className="group overflow-hidden rounded-flame border border-line bg-bg transition-colors hover:border-ember/50">
                <div className="aspect-[16/9] bg-surface">
                  {s.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.coverImageUrl} alt={s.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-ember/15 to-flame/10" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold group-hover:text-ember">{s.name}</h3>
                  {s.sermonCount != null ? <p className="mt-1 text-sm text-muted">{s.sermonCount} messages</p> : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No series yet" />
        )}
      </Container>
    </>
  );
}
