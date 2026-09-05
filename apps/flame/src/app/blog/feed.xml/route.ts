import { getPosts, hrefFor } from "@ministree/template-sdk";
import { loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { loadSiteUrl } from "@/lib/site-url";

export const revalidate = 900;

/** Escape the five characters that would otherwise break the XML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * The blog as RSS.
 *
 * `manifest.supports.features` has advertised `"rss"` since flame shipped, with
 * no feed route behind it — so Ministree was told this template had a feed that
 * did not exist. Ministree's own API also exposes `/posts/feed.xml`, but a feed
 * has to be served from the site's own origin to be a useful thing to subscribe
 * to, and its links have to point at this template's URLs rather than the API's.
 */
export async function GET(): Promise<Response> {
  const [origin, settings, slugs, posts] = await Promise.all([
    loadSiteUrl(),
    loadSettings(),
    loadSlugs(),
    getPosts(undefined, { limit: 50 }),
  ]);

  const name = siteName(settings);
  const base = origin ?? "";
  const blogPath = hrefFor(slugs, "blog");
  const items = posts?.data ?? [];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(name)}</title>
    <link>${esc(base + blogPath)}</link>
    <description>${esc(settings?.seoDescription ?? `Latest from ${name}`)}</description>
    <atom:link href="${esc(`${base}${blogPath}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items
  .map((post) => {
    const link = `${base}${hrefFor(slugs, "blog", post.slug)}`;
    return `    <item>
      <title>${esc(post.title ?? "")}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
${post.publishedAt ? `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>\n` : ""}${
      post.excerpt ? `      <description>${esc(post.excerpt)}</description>\n` : ""
    }    </item>`;
  })
  .join("\n")}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
