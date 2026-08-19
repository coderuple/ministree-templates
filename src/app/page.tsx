import { getPage, hrefFor, resolveEntities, Sections, type EventDetail, type PageSection } from "@ministree/template-sdk";
import { loadContent, loadLocale, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { flameSections } from "@/sections";
import RenderedPage from "@/components/RenderedPage";
import HomeHero from "@/components/hero/HomeHero";
import HomeIntro from "@/components/HomeIntro";
import EventSite from "@/components/event/EventSite";
import { loadFeaturedEvent } from "@/lib/featured-event";

export const revalidate = 60;

type CtaVariant = "primary" | "outline" | "ghost" | "dark";

/**
 * Home. `homeSource` (Customizer) chooses the source:
 *  - `templateHome` → flame's cinematic hero + the composable section stack (`homeSections`).
 *  - `ministreePage` → render a Ministree CMS page via the section registry.
 */
export default async function Home() {
  const [slugs, settings, content] = await Promise.all([loadSlugs(), loadSettings(), loadContent()]);

  /* One event, not a church site. The church picked the event in the Customizer;
     everything the page shows comes from that event's own record, so there is no
     second copy of the details to keep in step. Falls through to the normal home
     if the chosen event has been unpublished or deleted — a live site shouldn't
     go blank because a slug went stale. */
  if ((content as { siteMode?: string }).siteMode === "singleEvent") {
    const event = await loadFeaturedEvent(content);
    if (event) {
      const locale = await loadLocale();
      const rawCurrency = (event as unknown as { currency?: unknown }).currency;
      const currency = typeof rawCurrency === "string" && rawCurrency ? rawCurrency : "USD";
      return <EventSite event={event} locale={locale} currency={currency} />;
    }
  }

  const homeSource = (content as { homeSource?: string }).homeSource ?? "templateHome";

  if (homeSource === "ministreePage") {
    const slug = ((content as { homePageSlug?: string }).homePageSlug || "home").replace(/^\/+/, "") || "home";
    const page = await getPage(slug);
    if (page?.content?.sections?.length) return <RenderedPage page={page} />;
    // Fall through to the template home if the chosen page is missing/empty.
  }

  const name = siteName(settings);
  const hero = content.hero;
  const homeSections = ((content as { homeSections?: { sections?: PageSection[] } }).homeSections?.sections ??
    []) as PageSection[];

  return (
    <>
      <HomeHero
        eyebrow={hero.eyebrow}
        name={hero.title?.trim() || name}
        tagline={hero.subtitle?.trim() || content.tagline}
        backgroundImageUrl={hero.imageUrl?.trim() || undefined}
        backgroundFocalPoint={hero.imageFocalPoint}
        webgl={(content as { effects?: { webglHero?: boolean } }).effects?.webglHero !== false}
        primary={{
          label: hero.primaryCta.label,
          href: hero.primaryCta.href,
          variant: hero.primaryCta.variant as CtaVariant | undefined,
        }}
        secondary={{
          label: hero.secondaryCta.label,
          href: hero.secondaryCta.href?.trim() || hrefFor(slugs, "sermons"),
          variant: hero.secondaryCta.variant as CtaVariant | undefined,
        }}
      />

      <HomeIntro heading={content.intro?.heading} body={content.intro?.body} />

      <Sections sections={homeSections} registry={flameSections} context={{ churchName: name }} />
    </>
  );
}
