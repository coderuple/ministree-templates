import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@ministree/template-sdk";
import RenderedPage from "@/components/RenderedPage";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) return {};
  return { title: page.title, description: page.description ?? undefined };
}

/** Catch-all for CMS pages — any church page slug renders through flame's registry. */
export default async function CmsPage({ params }: Params) {
  const { slug } = await params;
  const page = await getPage(slug.join("/"));
  if (!page) notFound();
  return <RenderedPage page={page} />;
}
