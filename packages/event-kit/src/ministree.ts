import { cache } from 'react';
import {
  getChurchProfile,
  getSiteSettings,
  resolveContent,
  resolveEnv,
  resolveThemeCss,
  type MinistreeSiteSettings,
  type SchemeTokenOverrides,
} from '@ministree/template-sdk';
// The /next variant is preview-aware: inside a Customizer preview it fetches
// the church's DRAFT overrides, uncached.
import { getTemplateContent } from '@ministree/template-sdk/next';

/**
 * The server-side bridge to Ministree, shared by the three concept templates.
 *
 * Generalised from flame's `src/lib/ministree.ts`. Per-request `cache()`
 * dedupes the settings / profile / customizer fetches across the layout, the
 * page and `generateMetadata`, which Next calls separately.
 *
 * Each app calls `createBridge(manifest)` once and re-exports the result, so
 * the manifest — which is per-concept — stays the app's own.
 */

export interface Bridge<C> {
  /** Manifest defaults: the standalone, no-church fallback. */
  defaults: C;
  /** Defaults deep-merged with the church's Customizer edits. */
  loadContent: () => Promise<C>;
  loadSettings: () => Promise<MinistreeSiteSettings | null>;
  loadProfile: () => Promise<Awaited<ReturnType<typeof getChurchProfile>>>;
  loadTokenOverrides: () => Promise<SchemeTokenOverrides | undefined>;
  loadLocale: () => Promise<string | undefined>;
  /** The `:root { … }` CSS the church's palette overrides resolve to. */
  loadThemeCss: () => Promise<string>;
  /** Display name: the connected church, else the manifest default. */
  siteName: (settings: MinistreeSiteSettings | null) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createBridge<C = Record<string, unknown>>(manifest: any): Bridge<C> {
  const defaults = resolveContent(manifest) as C;

  const loadCustomizer = cache(async () => {
    const templateId = resolveEnv().templateId;
    if (!templateId) return null;
    return getTemplateContent(templateId);
  });

  const loadContent = cache(
    async () => resolveContent(manifest, { overrides: (await loadCustomizer())?.content }) as C,
  );

  const loadSettings = cache(async () => getSiteSettings());
  const loadProfile = cache(async () => getChurchProfile());

  const loadTokenOverrides = async () => (await loadCustomizer())?.tokenOverrides ?? undefined;

  const loadThemeCss = async () => {
    const [settings, tokenOverrides] = await Promise.all([loadSettings(), loadTokenOverrides()]);
    return resolveThemeCss(manifest, { siteSettings: settings ?? undefined, tokenOverrides });
  };

  /**
   * The church's locale, resolved once per request.
   *
   * `defaultLanguage` is a bare BCP-47 primary subtag ("en"), and `Intl`
   * resolves a bare "en" to US conventions — so language alone does not stop a
   * British church seeing month/day/year on its own conference dates. The
   * church's country (from its address, else inferred from its IANA timezone)
   * supplies the region that actually decides date order and currency
   * placement. Returns undefined when the church has told us nothing, which
   * lets Intl fall back to the runtime default rather than to a guess.
   */
  const loadLocale = cache(async (): Promise<string | undefined> => {
    const [settings, profile] = await Promise.all([loadSettings(), loadProfile()]);
    const raw = (settings as { defaultLanguage?: unknown } | null)?.defaultLanguage;
    const language = typeof raw === 'string' ? raw : undefined;
    if (language?.includes('-')) return language;

    const country = profile?.address?.country?.trim();
    const region = country ? countryToRegion(country) : timezoneToRegion(profile?.timezone);
    return language && region ? `${language}-${region}` : language;
  });

  const siteName = (settings: MinistreeSiteSettings | null): string =>
    settings?.siteName?.trim() || ((defaults as { name?: string }).name ?? '');

  return {
    defaults,
    loadContent,
    loadSettings,
    loadProfile,
    loadTokenOverrides,
    loadLocale,
    loadThemeCss,
    siteName,
  };
}

/** ISO-3166 alpha-2 as-is; otherwise the spellings churches actually type. */
function countryToRegion(country: string): string | undefined {
  if (/^[A-Za-z]{2}$/.test(country)) return country.toUpperCase();
  const named: Record<string, string> = {
    'united kingdom': 'GB',
    'great britain': 'GB',
    england: 'GB',
    scotland: 'GB',
    wales: 'GB',
    'northern ireland': 'GB',
    'united states': 'US',
    'united states of america': 'US',
    usa: 'US',
    canada: 'CA',
    australia: 'AU',
    'new zealand': 'NZ',
    ireland: 'IE',
    nigeria: 'NG',
    ghana: 'GH',
    'south africa': 'ZA',
    kenya: 'KE',
  };
  return named[country.toLowerCase()];
}

/** Last resort: an IANA zone names a city, and the city implies a region. */
function timezoneToRegion(timezone: string | null | undefined): string | undefined {
  if (!timezone) return undefined;
  const zones: Record<string, string> = {
    'Europe/London': 'GB',
    'Europe/Dublin': 'IE',
    'Africa/Lagos': 'NG',
    'Africa/Accra': 'GH',
    'Africa/Johannesburg': 'ZA',
    'Africa/Nairobi': 'KE',
    'Australia/Sydney': 'AU',
    'Pacific/Auckland': 'NZ',
  };
  if (zones[timezone]) return zones[timezone];
  if (timezone.startsWith('America/')) return 'US';
  return undefined;
}
