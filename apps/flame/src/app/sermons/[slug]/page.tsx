import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSermon, hrefFor, RichText, richTextToPlainText } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { Container, Eyebrow } from "@/components/ui";
import { SermonCard } from "@/components/cards";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await getSermon(slug);
  if (!sermon) return {};
  return {
    title: sermon.title,
    description: sermon.description ?? richTextToPlainText(sermon.content).slice(0, 160),
  };
}

export default async function SermonDetail({ params }: Params) {
  const { slug } = await params;
  const [sermon, slugs] = await Promise.all([getSermon(slug), loadSlugs()]);
  if (!sermon) notFound();

  return (
    <article>
      <header className="border-b border-line bg-surface/50">
        <Container size="narrow" className="py-14 sm:py-20">
          {sermon.seriesName ? <Eyebrow>{sermon.seriesName}</Eyebrow> : null}
          <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl">{sermon.title}</h1>
          <p className="mt-4 text-muted">
            {[sermon.speaker, sermon.date].filter(Boolean).join(" · ")}
            {sermon.duration ? ` · ${sermon.duration}` : ""}
          </p>
        </Container>
      </header>

      <Container size="narrow" className="py-12">
        {sermon.videoUrl ? (
          <div className="mb-10 aspect-video overflow-hidden rounded-flame border border-line bg-black">
            <iframe src={sermon.videoUrl} title={sermon.title} className="h-full w-full" allowFullScreen />
          </div>
        ) : sermon.audioUrl ? (
          <audio src={sermon.audioUrl} controls className="mb-10 w-full" />
        ) : null}

        {sermon.description ? <p className="mb-8 text-lg text-muted">{sermon.description}</p> : null}
        <RichText doc={sermon.content} className="prose mx-auto" />

        {sermon.scriptures?.length ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {sermon.scriptures.map((s) => (
              <span key={s} className="rounded-full bg-surface px-3 py-1 text-sm text-muted">
                {s}
              </span>
            ))}
          </div>
        ) : null}
      </Container>

      {sermon.related?.length ? (
        <Container className="py-12">
          <h2 className="mb-8 font-display text-2xl font-semibold">More messages</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermon.related.slice(0, 3).map((s) => (
              <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="pb-16">
        <Link href={hrefFor(slugs, "sermons")} className="text-sm text-ember hover:underline">
          ← All sermons
        </Link>
      </Container>
    </article>
  );
}
