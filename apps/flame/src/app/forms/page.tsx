import type { Metadata } from "next";
import Link from "next/link";
import { getForms } from "@ministree/template-sdk";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Forms",
  description: "Sign up, register and get in touch.",
};

/**
 * Every form the church has published to its site.
 *
 * `getForms()` has been in the SDK all along with nothing calling it, so a
 * church could publish a form and the only way to reach it was to know its URL.
 */
export default async function FormsIndexPage() {
  const data = await getForms();
  const items = data?.forms ?? [];

  return (
    <>
      <ArchiveHeader
        eyebrow="Forms"
        title="Sign up & get in touch"
        description="Everything you can fill in online, in one place."
      />
      <Container className="py-12">
        {items.length === 0 ? (
          <EmptyState title="Nothing to fill in yet" body="Check back soon." />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {items.map((form) => {
              const slug = form.slug;
              const title = form.name || "Form";
              const description =
                typeof form.description === "string" ? form.description : undefined;
              if (!slug) return null;
              return (
                <li key={slug}>
                  <Link href={`/forms/${slug}`} className="group flex items-baseline gap-4 py-6">
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-xl uppercase transition-colors group-hover:text-ember">
                        {title}
                      </span>
                      {description ? (
                        <span className="mt-1 block text-sm text-muted">{description}</span>
                      ) : null}
                    </span>
                    <span aria-hidden className="text-ember">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
