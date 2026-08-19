import Link from "next/link";
import { getPosts, getSermons, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";
import { PostCard, SermonCard } from "@/components/cards";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const slugs = await loadSlugs();

  const [sermons, posts] = q
    ? await Promise.all([getSermons(undefined, { q, limit: 9 }), getPosts(undefined, { q, limit: 9 })])
    : [null, null];
  const sermonItems = sermons?.items ?? [];
  const postItems = posts?.data ?? [];
  const empty = q && !sermonItems.length && !postItems.length;

  return (
    <>
      <ArchiveHeader eyebrow="Find" title="Search" />
      <Container className="py-12">
        <form action="/search" method="get" className="mb-10 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search sermons and posts…"
            className="w-full rounded-full border border-line bg-bg px-5 py-3 outline-none focus:border-ember"
          />
          <button type="submit" className="rounded-full bg-ember px-6 py-3 text-sm font-medium text-bg">
            Search
          </button>
        </form>

        {!q ? (
          <p className="text-muted">Type a query above to search this site.</p>
        ) : empty ? (
          <EmptyState title={`No results for “${q}”`} body="Try a different word or phrase." />
        ) : (
          <div className="space-y-12">
            {sermonItems.length ? (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold">Sermons</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sermonItems.map((s) => (
                    <SermonCard key={s.id} sermon={s} href={hrefFor(slugs, "sermons", s.slug)} />
                  ))}
                </div>
              </section>
            ) : null}
            {postItems.length ? (
              <section>
                <h2 className="mb-6 font-display text-2xl font-semibold">Posts</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {postItems.map((p) => (
                    <PostCard key={p.id} post={p} href={hrefFor(slugs, "blog", p.slug)} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}

        <p className="mt-12 text-sm text-muted">
          Looking for something else?{" "}
          <Link href="/" className="text-ember hover:underline">
            Back home
          </Link>
        </p>
      </Container>
    </>
  );
}
