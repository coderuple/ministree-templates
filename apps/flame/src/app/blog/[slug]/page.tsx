import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, hrefFor, RichText } from "@ministree/template-sdk";
import { loadLocale, loadSlugs } from "@/lib/ministree";
import { Container, Eyebrow } from "@/components/ui";
import { PostCard } from "@/components/cards";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function PostDetail({ params }: Params) {
  const { slug } = await params;
  const [post, slugs, locale] = await Promise.all([getPost(slug), loadSlugs(), loadLocale()]);
  if (!post) notFound();

  return (
    <article>
      <header className="border-b border-line bg-surface/50">
        <Container size="narrow" className="py-14 sm:py-20">
          {post.category ? <Eyebrow>{post.category}</Eyebrow> : null}
          <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-7xl">{post.title}</h1>
          {post.publishedAt ? <p className="mt-4 text-muted">{formatDate(post.publishedAt, locale)}</p> : null}
        </Container>
      </header>

      {post.featuredImageUrl ? (
        <Container size="narrow" className="pt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.featuredImageUrl} alt={post.title} className="w-full rounded-flame object-cover" />
        </Container>
      ) : null}

      <Container size="narrow" className="py-12">
        <RichText doc={post.content} className="prose mx-auto" />
      </Container>

      {post.related?.length ? (
        <Container className="py-12">
          <h2 className="mb-8 font-display text-2xl font-semibold">Keep reading</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.related.slice(0, 3).map((p) => (
              <PostCard key={p.id} post={p} href={hrefFor(slugs, "blog", p.slug)} />
            ))}
          </div>
        </Container>
      ) : null}

      <Container className="pb-16">
        <Link href={hrefFor(slugs, "blog")} className="text-sm text-ember hover:underline">
          ← All posts
        </Link>
      </Container>
    </article>
  );
}
