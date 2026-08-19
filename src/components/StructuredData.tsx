import { getChurchProfile } from "@ministree/template-sdk";
import { loadSiteUrl } from "@/lib/site-url";

/**
 * Schema.org `Church` for the site as a whole.
 *
 * Search engines use this for the knowledge panel — the address, the phone
 * number and the service times that show up beside a search result. Every value
 * comes from the church's own profile in Ministree; nothing here is invented,
 * and the whole block is skipped when there's no profile to describe.
 */
export default async function StructuredData() {
  const [profile, origin] = await Promise.all([getChurchProfile(), loadSiteUrl()]);
  if (!profile?.name) return null;

  const socials = Object.values(profile.socials ?? {}).filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: profile.name,
    ...(origin ? { url: origin } : {}),
    ...(profile.logoUrl ? { logo: profile.logoUrl } : {}),
    ...(profile.email ? { email: profile.email } : {}),
    ...(profile.phone ? { telephone: profile.phone } : {}),
    ...(socials.length ? { sameAs: socials } : {}),
    ...(profile.address
      ? {
          address: {
            "@type": "PostalAddress",
            ...(profile.address.street ? { streetAddress: profile.address.street } : {}),
            ...(profile.address.city ? { addressLocality: profile.address.city } : {}),
            ...(profile.address.state ? { addressRegion: profile.address.state } : {}),
            ...(profile.address.postalCode ? { postalCode: profile.address.postalCode } : {}),
            ...(profile.address.country ? { addressCountry: profile.address.country } : {}),
          },
        }
      : {}),
    ...(profile.serviceTimes?.length
      ? {
          // `dayOfWeek` is 0=Sunday; schema.org wants the named day URL.
          openingHoursSpecification: profile.serviceTimes.map((slot) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${
              ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
                slot.dayOfWeek
              ] ?? "Sunday"
            }`,
            opens: slot.startTime,
          })),
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Values come from the church's own profile, and JSON.stringify escapes
      // the only character that could break out of a <script> block.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
