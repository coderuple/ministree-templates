import type { MetadataRoute } from "next";
import { getPosts, getSermons, getEvents, hrefFor } from "@ministree/template-sdk";
import { loadSlugs } from "@/lib/ministree";
import { loadSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

/**
 * Every page worth indexing, built from the church's own content.
 *
 * Capped at 200 per content type: a sitemap is a discovery aid, not an archive,
 * and a church with thousands of sermons shouldn't turn one request into
 * thousands of rows. Returns empty when the church hasn't set its site URL —
 * a sitemap of wrong-origin links is worse than none.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await loadSiteUrl();
  if (!origin) return [];

  const [slugs, sermons, posts, events] = await Promise.all([
    loadSlugs(),
    getSermons(undefined, { limit: 200 }),
    getPosts(undefined, { limit: 200 }),
    getEvents(undefined, { limit: 200, when: "upcoming" }),
  ]);

  const url = (path: string) => `${origin}${path === "/" ? "" : path}`;
  const now = new Date();

  const staticPaths = [
    "/",
    hrefFor(slugs, "sermons"),
    hrefFor(slugs, "events"),
    hrefFor(slugs, "blog"),
    hrefFor(slugs, "giving"),
    "/locations",
    "/team",
    "/forms",
  ];

  return [
    ...staticPaths.map((path) => ({ url: url(path), lastModified: now })),
    ...(sermons?.items ?? []).map((s) => ({ url: url(hrefFor(slugs, "sermons", s.slug)), lastModified: now })),
    ...(posts?.data ?? []).map((p) => ({ url: url(hrefFor(slugs, "blog", p.slug)), lastModified: now })),
    ...(events?.items ?? []).map((e) => ({ url: url(hrefFor(slugs, "events", e.slug)), lastModified: now })),
  ];
}
