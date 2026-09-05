import type { Metadata } from "next";
import { getPeople } from "@ministree/template-sdk";
import { ArchiveHeader, Container, EmptyState } from "@/components/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our team",
  description: "The people who serve here.",
};

/**
 * The people who serve here.
 *
 * Ministree filters this server-side: only people who have opted into a public
 * profile AND are contactable appear, and the payload carries display fields
 * only — no email, phone or membership data ever reaches the page.
 */
export default async function TeamPage() {
  const data = await getPeople(undefined, { limit: 60 });
  const people = data?.items ?? [];

  return (
    <>
      <ArchiveHeader
        eyebrow="Our team"
        title="The people here"
        description="Staff, elders and ministry leads — the faces you'll meet."
      />
      <Container className="py-12">
        {people.length === 0 ? (
          <EmptyState
            title="No profiles yet"
            body="Team members appear here once they've chosen to show a public profile."
          />
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => {
              const name = [person.firstName, person.lastName].filter(Boolean).join(" ");
              const image = person.portraitUrl ?? person.avatarUrl;
              return (
                <li key={person.id}>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={name}
                      className="aspect-[4/5] w-full rounded-flame object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full rounded-flame bg-surface" />
                  )}
                  <h2 className="font-display mt-4 text-xl uppercase">{name}</h2>
                  {person.role ? <p className="micro text-ember">{person.role}</p> : null}
                  {person.metadata?.bio ? (
                    <p className="mt-2 text-sm text-muted">{person.metadata.bio}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
