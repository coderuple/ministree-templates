import Link from "next/link";
import { getPostCategories, getPosts, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState, Pagination } from "@/components/ui";
import { PostCard } from "@/components/cards";

export const revalidate = 60;
export const metadata = { title: "Blog" };

export default async function BlogArchive({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const limit = 12;
  const [data, categories, slugs] = await Promise.all([
    getPosts(undefined, { page, limit }),
    getPostCategories(),
    loadSlugs(),
  ]);
  const items = data?.data ?? [];
  const base = hrefFor(slugs, "blog");

  return (
    <>
      <ArchiveHeader eyebrow="Read" title="Blog" description="Stories, teaching and news from our community." />
      <Container className="py-12">
        {categories?.length ? (
          <div className="mb-8 flex flex-wrap gap-2 text-sm">
            {categories.map((c) => (
              <Link key={c.id} href={`${base}/category/${c.slug}`} className="rounded-full border border-line px-3 py-1 text-muted hover:border-ember hover:text-ember">
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
        {items.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <PostCard key={p.id} post={p} href={hrefFor(slugs, "blog", p.slug)} />
              ))}
            </div>
            <Pagination basePath={base} page={page} total={data?.total ?? items.length} limit={limit} />
          </>
        ) : (
          <EmptyState title="No posts yet" body="When this church publishes posts, they'll show up here." />
        )}
      </Container>
    </>
  );
}
