import Link from "next/link";
import { resolveSocials } from "@/lib/socials";
import type { NavNode } from "@ministree/template-sdk";
import { loadContent, loadNav, loadSettings, siteName } from "@/lib/ministree";
import { Container } from "@/components/ui";

/** Cinematic footer: large wordmark, micro-labelled columns, hairlines. */
export default async function Footer() {
  const [settings, footerNav, content] = await Promise.all([loadSettings(), loadNav("footer"), loadContent()]);
  const name = siteName(settings);
  // Undefined means on, matching the header and the effects toggles.
  const showWordmark = (content.chrome ?? {}).footerWordmark !== false;

  const items: NavNode[] =
    footerNav.length > 0 ? footerNav : content.nav.map((n) => ({ label: n.label, href: n.href }));

  const contact = settings?.contactInfo ?? null;
  const address = contact?.address ?? content.contact.address;
  const email = contact?.email ?? content.contact.email;
  const phone = contact?.phone ?? content.contact.phone;

  /* Three sources, most specific first: the church's own list in the
     Customizer, then the four URLs on Site Settings' contact card, then
     whatever the template shipped with. `resolveSocials` also repairs a pasted
     bare domain, which the contact card does not validate. */
  const socials = resolveSocials(
    (content as { socialLinks?: Array<{ label?: string; href?: string }> }).socialLinks?.length
      ? (content as { socialLinks?: Array<{ label?: string; href?: string }> }).socialLinks
      : [
          { label: "Instagram", href: contact?.instagramUrl ?? undefined },
          { label: "YouTube", href: contact?.youtubeUrl ?? undefined },
          { label: "Facebook", href: contact?.facebookUrl ?? undefined },
          { label: "X", href: contact?.xUrl ?? undefined },
        ],
    null,
  );

  return (
    <footer className="relative mt-28 border-t border-line bg-surface/40">
      <Container className="py-16">
        {showWordmark ? (
          <p className="font-display text-[14vw] uppercase leading-[0.82] tracking-tight text-outline sm:text-[10vw]">
            {name}
          </p>
        ) : null}

        <div
          className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-4 ${
            showWordmark ? "mt-12 border-t border-line pt-12" : ""
          }`}
        >
          <div className="space-y-3">
            <p className="micro text-muted">The church</p>
            <p className="max-w-xs text-sm text-muted">{content.tagline}</p>
          </div>

          <div>
            <p className="micro text-muted">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {items.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link href={item.href || "#"} className="text-ink transition-colors hover:text-ember">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="micro text-muted">Visit</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {address ? <li>{address}</li> : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-ember">
                    {email}
                  </a>
                </li>
              ) : null}
              {phone ? <li>{phone}</li> : null}
            </ul>
          </div>

          <div>
            <p className="micro text-muted">Follow</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-ink transition-colors hover:text-ember" target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="flex flex-col items-center justify-between gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} {name}</p>
        <p className="micro">{content.footerNote}</p>
      </Container>
    </footer>
  );
}
