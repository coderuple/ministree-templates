import { notFound } from "next/navigation";
import { getSermons, getSermonSpeaker, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";
import { SermonCard } from "@/components/cards";

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const sp = await getSermonSpeaker(id);
  return sp ? { title: `${sp.firstName} ${sp.lastName}` } : {};
}

export default async function SpeakerDetail({ params }: Params) {
  const { id } = await params;
  const [speaker, data, slugs] = await Promise.all([
    getSermonSpeaker(id),
    getSermons(undefined, { speakerId: id, limit: 48 }),
    loadSlugs(),
  ]);
  if (!speaker) notFound();
  const items = data?.items ?? [];

  return (
    <>
      <ArchiveHeader eyebrow="Speaker" title={`${speaker.firstName} ${speaker.lastName}`} />
      <Container className="py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No messages from this speaker yet" />
        )}
      </Container>
    </>
  );
}
