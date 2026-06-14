import { getPage, hrefFor, Sections, type PageSection } from "@ministree/template-sdk";
import { loadContent, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { flameSections } from "@/sections";
import RenderedPage from "@/components/RenderedPage";
import HomeHero from "@/components/hero/HomeHero";

export const revalidate = 60;

type CtaVariant = "primary" | "outline" | "ghost" | "dark";

/**
 * Home. `homeSource` (Customizer) chooses the source:
 *  - `templateHome` → flame's cinematic hero + the composable section stack (`homeSections`).
 *  - `ministreePage` → render a Ministree CMS page via the section registry.
 */
export default async function Home() {
  const [slugs, settings, content] = await Promise.all([loadSlugs(), loadSettings(), loadContent()]);

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

      <Sections sections={homeSections} registry={flameSections} context={{ churchName: name }} />
    </>
  );
}
