import { notFound } from "next/navigation";
import { getPostCategory, getPosts, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";
import { PostCard } from "@/components/cards";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const cat = await getPostCategory(slug);
  return cat ? { title: cat.name } : {};
}

export default async function CategoryArchive({ params }: Params) {
  const { slug } = await params;
  const [category, data, slugs] = await Promise.all([
    getPostCategory(slug),
    getPosts(undefined, { categorySlug: slug, limit: 24 }),
    loadSlugs(),
  ]);
  if (!category) notFound();
  const items = data?.data ?? [];

  return (
    <>
      <ArchiveHeader eyebrow="Category" title={category.name} description={category.description} />
      <Container className="py-12">
        {items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PostCard key={p.id} post={p} href={hrefFor(slugs, "blog", p.slug)} />
            ))}
          </div>
        ) : (
          <EmptyState title="No posts in this category yet" />
        )}
      </Container>
    </>
  );
}
