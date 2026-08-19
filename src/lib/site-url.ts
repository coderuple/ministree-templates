import { loadSettings } from "@/lib/ministree";

/**
 * The church's own canonical URL, from Site Settings.
 *
 * A sitemap, a feed and a canonical tag all need absolute URLs, and only the
 * church knows its real address — the template is deployed somewhere it can't
 * infer. `NEXT_PUBLIC_SITE_URL` is the escape hatch for a deploy that hasn't
 * had `publicSiteUrl` filled in yet.
 *
 * Returns null when neither is set: better to omit a sitemap entry than to
 * publish one pointing at the wrong origin.
 */
export async function loadSiteUrl(): Promise<string | null> {
  const settings = await loadSettings();
  const fromChurch = (settings as { publicSiteUrl?: string } | null)?.publicSiteUrl?.trim();
  const url = fromChurch || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return null;
  return url.replace(/\/+$/, "");
}
