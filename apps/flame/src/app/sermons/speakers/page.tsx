import Link from "next/link";
import { getSermonSpeakers, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Speakers" };

export default async function SpeakersArchive() {
  const [data, slugs] = await Promise.all([getSermonSpeakers(), loadSlugs()]);
  const items = data?.items ?? [];
  const base = `${hrefFor(slugs, "sermons")}/speakers`;

  return (
    <>
      <ArchiveHeader eyebrow="Sermons" title="Speakers" description="The voices behind our messages." />
      <Container className="py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((sp) => (
              <Link key={sp.id} href={`${base}/${sp.slug}`} className="group text-center">
                <div className="mx-auto aspect-square w-full overflow-hidden rounded-flame bg-surface">
                  {sp.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sp.avatarUrl} alt={`${sp.firstName} ${sp.lastName}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-ember/15 to-flame/10 font-display text-3xl text-ember">
                      {sp.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-3 font-display text-lg font-semibold group-hover:text-ember">
                  {sp.firstName} {sp.lastName}
                </p>
                {sp.count != null ? <p className="text-sm text-muted">{sp.count} messages</p> : null}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No speakers yet" />
        )}
      </Container>
    </>
  );
}
