import type { Metadata } from "next";
import { getCampuses, getChurchProfile, type MinistreeCampus } from "@ministree/template-sdk";
import { ArchiveHeader, Button, Container, EmptyState } from "@/components/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Visit",
  description: "Where we meet and when.",
};

/**
 * Where the church meets.
 *
 * Everything here already existed in Ministree and flame simply never asked for
 * it: `getChurchProfile()` carries the address, service times, and ready-made
 * map and directions links, and `getCampuses()` returns the same shape per
 * campus with the church's details filled in behind it.
 *
 * A single-site church has no campuses, so it falls back to its own profile —
 * one location rather than an empty page.
 */
export default async function LocationsPage() {
  const [campuses, profile] = await Promise.all([getCampuses(), getChurchProfile()]);

  const places: Array<Partial<MinistreeCampus>> =
    campuses && campuses.length > 0 ? campuses : profile ? [profile as Partial<MinistreeCampus>] : [];

  return (
    <>
      <ArchiveHeader
        eyebrow="Visit"
        title={places.length > 1 ? "Our locations" : "Come and visit"}
        description="Where we meet, and when. You're welcome exactly as you are."
      />
      <Container className="py-12">
        {places.length === 0 ? (
          <EmptyState title="No locations yet" body="Check back soon — we'll add where we meet." />
        ) : (
          <div className="grid gap-px overflow-hidden rounded-flame border border-line bg-line md:grid-cols-2">
            {places.map((place, i) => (
              <section key={place.id ?? i} className="bg-bg p-8">
                <h2 className="font-display text-2xl uppercase leading-tight">{place.name}</h2>

                {place.addressLine ? (
                  <address className="mt-3 not-italic text-muted">{place.addressLine}</address>
                ) : null}

                {/* Pre-formatted by Ministree — no day-of-week arithmetic here. */}
                {place.serviceTimesDisplay?.length ? (
                  <dl className="mt-5 space-y-1">
                    {place.serviceTimesDisplay.map((slot, j) => (
                      <div key={j} className="flex flex-wrap gap-x-3 text-sm">
                        {slot.label ? <dt className="micro text-ember">{slot.label}</dt> : null}
                        <dd className="text-muted">{slot.line}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                {place.phone || place.email ? (
                  <p className="mt-5 space-x-4 text-sm">
                    {place.phone ? (
                      <a href={`tel:${place.phone}`} className="text-ember">
                        {place.phone}
                      </a>
                    ) : null}
                    {place.email ? (
                      <a href={`mailto:${place.email}`} className="text-ember">
                        {place.email}
                      </a>
                    ) : null}
                  </p>
                ) : null}

                {place.directionsUrl ? (
                  <div className="mt-6">
                    <Button href={place.directionsUrl} variant="outline">
                      Get directions
                    </Button>
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
