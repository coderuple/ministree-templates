import { createBridge } from "@ministree-templates/event-kit/ministree";
import manifest from "../../ministree.config";
import type { SiteContent } from "@/config/site";

/**
 * Alabaster's server bridge to Ministree. One instance, shared by the layout,
 * the page and generateMetadata — React's per-request cache() inside means the
 * three of them cost one fetch, not three.
 */
export const bridge = createBridge<SiteContent>(manifest);
export const {
  defaults,
  loadContent,
  loadSettings,
  loadProfile,
  loadTokenOverrides,
  loadLocale,
  loadThemeCss,
  siteName,
} = bridge;
export { manifest };
