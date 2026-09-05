import type { Metadata } from "next";
import { Anton, Cormorant_Garamond, Archivo } from "next/font/google";
import { resolveColorScheme, resolveThemeCss } from "@ministree/template-sdk";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { defaults, loadContent, loadLocale, loadSettings, loadTokenOverrides, manifest, siteName } from "@/lib/ministree";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import StructuredData from "@/components/StructuredData";
import Preloader from "@/components/Preloader";
import { loadFeaturedEvent } from "@/lib/featured-event";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo" });

export async function generateMetadata(): Promise<Metadata> {
  const [settings, content] = await Promise.all([loadSettings(), loadContent()]);
  const name = siteName(settings);
  const description = settings?.seoDescription ?? defaults.description;

  /* In single-event mode the site IS the event, so the browser tab, the search
     result and every share card should say so — the church's name belongs in
     the "presented by" line, not in the title. */
  const c = content as { siteMode?: string; event?: { title?: string; tagline?: string } };
  if (c.siteMode === "singleEvent") {
    const event = await loadFeaturedEvent(content);
    if (event?.title) {
      return {
        title: { default: event.title, template: `%s · ${event.title}` },
        description: event.description ?? description,
        icons: settings?.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
      };
    }
  }

  return {
    title: { default: name, template: `%s · ${name}` },
    description,
    icons: settings?.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, tokenOverrides, content, previewToken, locale] = await Promise.all([
    loadSettings(),
    loadTokenOverrides(),
    loadContent(),
    getPreviewToken(), // non-null only inside a Ministree Customizer preview
    loadLocale(),
  ]);

  /* Site-level scheme only. A church can also force dark on INDIVIDUAL routes
     (`getVisibility(path).forceDarkTheme`), but honouring that here needs the
     request path, and reading it — via `headers()` or middleware — opts every
     route out of static rendering: the whole site went from ISR to per-request
     server rendering. Not a trade worth making for an occasional per-route
     setting, so per-route dark stays unimplemented rather than silently
     costing every church its caching. */
  const scheme = resolveColorScheme(settings);
  const themeCss = resolveThemeCss(manifest, { siteSettings: settings ?? undefined, tokenOverrides });

  // Cinematic effects are flame-only and toggled per church in the Customizer.
  // Omitted/undefined means ON (cinematic by default); only an explicit `false` calms it.
  const fx = (content as { effects?: Record<string, boolean | undefined> }).effects ?? {};
  const grainOn = fx.grain !== false;
  const cursorOn = fx.cursor !== false;
  const preloaderOn = fx.preloader !== false;

  /* Single-event mode brings its own chrome — an event nav, an event footer and
     a preloader the hero sequences its entrance off. Rendering the church's
     header and footer around it as well put two navigations, two footers and
     two preloaders on the same page. There is no church site to navigate to in
     this mode, so the church chrome isn't merely redundant, it's wrong. */
  const singleEvent = (content as { siteMode?: string }).siteMode === "singleEvent";

  /* Single-event mode is dark, whatever the church's website is.
     The treatment is not a colour scheme with a dark variant — it is a lit
     object on a near-black ground. Outlined type, ember accents, the grain and
     vignette, and the flame itself all assume that ground; served on the light
     palette the whole thing washes out to pale type on cream. thealtar has no
     light mode for the same reason. The church's own palette still drives the
     accent, so an event site is still recognisably theirs. */
  const forceDark = singleEvent;
  /* The switch is stamped on <html> rather than used to withhold a component.
     It reads "Scroll-reveal animations", and it used to gate Lenis — so turning
     it off killed smooth scroll and left every reveal running. `revealsDisabled()`
     in src/lib/motion.ts reads this attribute, so one flag reaches every
     animated component without threading a prop through the whole tree. */
  const revealsOff = fx.scrollReveals === false;

  // Dark mode follows the visitor's device preference WHEN the church enables it
  // (Settings → dark mode). Disabled → light only. A manual toggle is remembered.
  const darkAllowed =
    (settings?.themeOverrides as Record<string, unknown> | undefined)?.darkModeEnabled !== false;
  const schemeScript = `(function(){try{var allow=${darkAllowed};var d=document.documentElement;if(!allow){d.classList.remove('dark');return;}var s=localStorage.getItem('flame-scheme');if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}}catch(e){}})();`;

  return (
    <html
      lang={locale ?? "en"}
      className={`${anton.variable} ${cormorant.variable} ${archivo.variable} ${
        forceDark || scheme === "dark" ? "dark" : ""
      } antialiased`}
      data-fx-reveals={revealsOff ? "off" : undefined}
      suppressHydrationWarning
    >
      <head>
        {themeCss ? <style id="ministree-theme" dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
        {/* Skipped in event mode — the script's job is to honour a stored or
            system preference, and here there is no preference to honour. */}
        {forceDark ? null : <script dangerouslySetInnerHTML={{ __html: schemeScript }} />}
        <StructuredData />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink">
        {/* Not inside the Customizer preview: the curtain would wipe across the
            editor's preview pane on every draft reload, hiding the very change
            they just made. `previewToken` is non-null only in that iframe. */}
        {preloaderOn && !previewToken && !singleEvent ? (
          <Preloader label={siteName(settings)} />
        ) : null}
        {singleEvent ? null : <Header />}
        <main>{children}</main>
        {singleEvent ? null : <Footer />}

        {/* cinematic atmosphere — sit above content, below the cursor */}
        {grainOn ? (
          <>
            <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-[80]" />
            <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[90]" />
          </>
        ) : null}
        <SmoothScroll />
        {cursorOn ? <Cursor /> : null}
        {previewToken ? <PreviewBridge token={previewToken} /> : null}
      </body>
    </html>
  );
}
