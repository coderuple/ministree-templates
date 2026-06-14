import { cache } from "react";
import {
  getNavigation,
  getSitePages,
  getSiteSettings,
  getTemplateContent,
  getVisibility,
  resolveColorScheme,
  resolveContent,
  resolveEnv,
  resolveSitePageSlugs,
  resolveThemeCss,
  type ColorScheme,
  type MinistreeSiteSettings,
  type NavNode,
  type SchemeTokenOverrides,
  type SitePageSlugs,
} from "@ministree/template-sdk";
import manifest from "../../ministree.config";

/**
 * flame's server-side bridge to Ministree. Per-request `cache()` dedupes the
 * settings/slugs/nav/customizer fetches across the layout and the page.
 */

export { manifest };

/** Manifest defaults — the standalone (no-church) fallback + last-resort identity. */
export const defaults = resolveContent(manifest);

/** The church's Customizer edits (content overrides + token overrides), or null. */
const loadCustomizer = cache(async () => {
  const templateId = resolveEnv().templateId;
  if (!templateId) return null;
  return getTemplateContent(templateId);
});

/** Editable content: manifest defaults deep-merged with the church's Customizer edits. */
export const loadContent = cache(async () =>
  resolveContent(manifest, { overrides: (await loadCustomizer())?.content }),
);

/** Church-edited theme-token overrides (`--var` → value), if any. */
export async function loadTokenOverrides(): Promise<SchemeTokenOverrides | undefined> {
  return (await loadCustomizer())?.tokenOverrides ?? undefined;
}

export const loadSettings = cache(
  async (): Promise<MinistreeSiteSettings | null> => getSiteSettings(),
);

export const loadSlugs = cache(
  async (): Promise<SitePageSlugs> => resolveSitePageSlugs(await getSitePages()),
);

export const loadNav = cache(
  async (menuKey = "header"): Promise<NavNode[]> => (await getNavigation(undefined, menuKey)) ?? [],
);

/** Resolve the active scheme + injectable theme CSS for a given route. */
export async function resolvePageTheme(path: string): Promise<{
  settings: MinistreeSiteSettings | null;
  scheme: ColorScheme;
  themeCss: string;
}> {
  const [settings, tokenOverrides] = await Promise.all([loadSettings(), loadTokenOverrides()]);
  const visibility = settings ? await getVisibility(path) : null;
  const scheme = resolveColorScheme(settings, { visibility });
  const themeCss = resolveThemeCss(manifest, { siteSettings: settings ?? undefined, tokenOverrides });
  return { settings, scheme, themeCss };
}

/** Display name: prefer the connected church, fall back to manifest defaults. */
export function siteName(settings: MinistreeSiteSettings | null): string {
  return settings?.siteName?.trim() || defaults.name;
}

/** Service times: church data from Site Settings; demo defaults when standalone. */
export function serviceTimes(settings: MinistreeSiteSettings | null): Array<{ label: string; value: string }> {
  const list = settings?.contactInfo?.serviceTimesList;
  if (list && list.length) return list.map((s) => ({ label: s.label, value: s.value }));
  return defaults.serviceTimes;
}
