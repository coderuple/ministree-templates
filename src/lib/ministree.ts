import { isBackdropElement, type BackdropElement } from "@/lib/backdrop";
import { cache } from "react";
import {
  getChurchProfile,
  getNavigation,
  getSitePages,
  getSiteSettings,
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
// The /next variant is preview-aware: during a Ministree Customizer preview
// (draft mode) it fetches the church's DRAFT overrides uncached.
import { getTemplateContent } from "@ministree/template-sdk/next";
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

/**
 * The church's locale, resolved once per request.
 *
 * `defaultLanguage` is a bare BCP-47 primary subtag ("en"), and `Intl` resolves
 * a bare "en" to US conventions — so language alone does not stop a British
 * church seeing month/day/year. The church's own country (from its address, or
 * inferred from an IANA timezone when the address is blank) supplies the region
 * that actually decides date order and currency placement.
 *
 * Returns `undefined` when the church has told us nothing, which lets `Intl`
 * fall back to the runtime default rather than to a region we guessed.
 */
export const loadLocale = cache(async (): Promise<string | undefined> => {
  const [settings, profile] = await Promise.all([loadSettings(), getChurchProfile()]);
  const language =
    typeof (settings as { defaultLanguage?: unknown } | null)?.defaultLanguage === "string"
      ? ((settings as { defaultLanguage?: string }).defaultLanguage as string)
      : undefined;

  // Already regionalised ("en-GB") — nothing to add.
  if (language && language.includes("-")) return language;

  const country = profile?.address?.country?.trim();
  const region = country ? countryToRegion(country) : timezoneToRegion(profile?.timezone);
  if (language && region) return `${language}-${region}`;
  return language;
});

/** ISO-3166 alpha-2 as-is; otherwise a few spellings churches actually type. */
function countryToRegion(country: string): string | undefined {
  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
  const named: Record<string, string> = {
    "united kingdom": "GB",
    "great britain": "GB",
    england: "GB",
    scotland: "GB",
    wales: "GB",
    "northern ireland": "GB",
    "united states": "US",
    "united states of america": "US",
    usa: "US",
    canada: "CA",
    australia: "AU",
    "new zealand": "NZ",
    ireland: "IE",
    nigeria: "NG",
    ghana: "GH",
    "south africa": "ZA",
    kenya: "KE",
  };
  return named[country.toLowerCase()];
}

/** Last resort: an IANA zone names a city, and the city implies a region. */
function timezoneToRegion(timezone: string | null | undefined): string | undefined {
  if (!timezone) return undefined;
  const zones: Record<string, string> = {
    "Europe/London": "GB",
    "Europe/Dublin": "IE",
    "Africa/Lagos": "NG",
    "Africa/Accra": "GH",
    "Africa/Johannesburg": "ZA",
    "Africa/Nairobi": "KE",
    "Australia/Sydney": "AU",
    "Pacific/Auckland": "NZ",
  };
  if (zones[timezone]) return zones[timezone];
  if (timezone.startsWith("America/")) return "US";
  return undefined;
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

/**
 * Which element the moving backdrop is made of.
 *
 * Shared by the home hero and the single-event site so one Customizer setting
 * drives both — the event site used to mount the scene itself and ignore the
 * switch entirely, so turning the backdrop off left it running there.
 */
export function backdropElement(content: unknown): BackdropElement {
  const v = (content as { effects?: { backdropElement?: unknown } })?.effects?.backdropElement;
  return isBackdropElement(v) ? v : "fire";
}

/** Is the moving backdrop on at all? Undefined means on, matching the other effects. */
export function backdropEnabled(content: unknown): boolean {
  return (content as { effects?: { webglHero?: boolean } })?.effects?.webglHero !== false;
}
