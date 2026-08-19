import type { MetadataRoute } from "next";
import { loadSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await loadSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The Customizer preview route serves DRAFT content behind a token; it
      // should never be crawled or indexed.
      disallow: ["/api/"],
    },
    // Omitted rather than guessed when the church hasn't set its URL.
    sitemap: origin ? `${origin}/sitemap.xml` : undefined,
  };
}
