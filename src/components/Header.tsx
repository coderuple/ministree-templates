import Link from "next/link";
import { hrefFor, type NavNode } from "@ministree/template-sdk";
import { defaults, loadContent, loadNav, loadSettings, loadSlugs, siteName } from "@/lib/ministree";
import { Container } from "@/components/ui";
import Nav from "@/components/Nav";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import MagneticButton from "@/components/MagneticButton";

function FlameMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 1.5c.3 3.2-1.2 4.8-2.8 6.4C8.9 9.8 7 11.7 7 15a5 5 0 0 0 10 .2c.1-2-1-3.6-1.6-4.6.9.3 1.7 1 2.2 1.9.6-3-.6-6.2-2.6-8.4-1-1.1-1.6-1.9-1.5-2.6Z" />
    </svg>
  );
}

/** Cinematic site header: flame wordmark, uppercase nav, scheme toggle, magnetic Give. */
export default async function Header() {
  const [settings, navItems, slugs, content] = await Promise.all([
    loadSettings(),
    loadNav("header"),
    loadSlugs(),
    loadContent(),
  ]);

  const chrome = content.chrome ?? {};
  // Undefined means on, matching how the effects toggles behave.
  const sticky = chrome.stickyHeader !== false;
  const showGive = chrome.showGiveButton !== false;
  const logoHeight =
    chrome.logoSize === "small" ? "h-7" : chrome.logoSize === "large" ? "h-14" : "h-9";

  const items: NavNode[] =
    navItems.length > 0 ? navItems : defaults.nav.map((n) => ({ label: n.label, href: n.href }));
  const name = siteName(settings);
  const logoUrl = settings?.logoUrl ?? null;
  const darkAllowed =
    (settings?.themeOverrides as Record<string, unknown> | undefined)?.darkModeEnabled !== false;

  return (
    <header
      className={`${sticky ? "sticky top-0" : "relative"} z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl`}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5" data-cursor>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className={`${logoHeight} w-auto`} />
          ) : (
            <FlameMark className="h-6 w-6 text-ember transition-transform duration-500 group-hover:scale-110" />
          )}
          <span className="font-display text-lg uppercase tracking-[0.12em]">{name}</span>
        </Link>

        <nav className="hidden md:block" aria-label="Primary">
          <Nav items={items} />
        </nav>

        <div className="flex items-center gap-3">
          {darkAllowed ? <ThemeToggle /> : null}
          {showGive ? (
            <div className="hidden sm:block">
              <MagneticButton href={hrefFor(slugs, "giving")} className="px-6 py-2.5 text-[11px]">
                Give
              </MagneticButton>
            </div>
          ) : null}
          {/* Below `md` the nav above is hidden, so this carries the whole menu. */}
          <MobileMenu items={items} giveHref={hrefFor(slugs, "giving")} />
        </div>
      </Container>
    </header>
  );
}
