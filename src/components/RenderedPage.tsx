import { RichText, Sections, type PageResponse } from "@ministree/template-sdk";
import { defaults } from "@/lib/ministree";
import { flameSections } from "@/sections";
import { Container } from "@/components/ui";

/**
 * Render a Ministree CMS page: an optional title header, the legacy main body,
 * then the section array through flame's registry.
 */
export default function RenderedPage({ page, showTitle = true }: { page: PageResponse; showTitle?: boolean }) {
  const sections = page.content?.sections ?? [];
  const hasHeroSection = sections.some((s) => s.type === "hero");

  return (
    <article>
      {showTitle && !hasHeroSection ? (
        <header className="border-b border-border bg-surface/50">
          <Container className="py-14 sm:py-20">
            <h1 className="font-display text-6xl uppercase leading-[0.88] tracking-tight sm:text-7xl">{page.title}</h1>
            {page.description ? <p className="mt-4 max-w-2xl text-lg text-muted">{page.description}</p> : null}
          </Container>
        </header>
      ) : null}

      {page.content?.mainContent ? (
        <Container size="narrow" className="py-12">
          <RichText doc={page.content.mainContent} className="prose mx-auto" />
        </Container>
      ) : null}

      <Sections
        sections={sections}
        registry={flameSections}
        context={{
          pageDefaultAlign: page.content?.defaultSectionTextAlign,
          churchName: defaults.name,
        }}
      />
    </article>
  );
}
