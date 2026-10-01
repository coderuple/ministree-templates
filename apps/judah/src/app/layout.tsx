import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { loadContent, loadLocale, loadSettings, loadThemeCss, siteName } from "@/lib/ministree";
import { loadPageData } from "@/lib/page-data";
import "./globals.css";

/* The three faces this concept is. next/font resolves at build time and
   self-hosts them, so there is no render-blocking request to Google and no
   third party watching the reader.

   Three, not the usual two, because Judah speaks in three registers and each
   one is load-bearing: a serif for what is being said, a condensed sans for
   what is being shouted, and a monospace for everything the tape machine
   itself says. Drop the mono and the archive stops reading as an archive. */
const newsreader = Newsreader({
  /* Variable with an optical-size axis: at 340px it wants the high-contrast
     display cut, at a 10px caption the sturdier text cut. One file, both. */
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});
const barlow = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  /* Through `loadPageData`, not the raw event record: the Customizer can have
     the last word over the event's title, dates and description, and a tab
     that still said the record's name would be the one place on the site that
     disagrees with the page under it. Every loader inside is request cached,
     so this costs no second fetch. */
  const [{ content, event, eventTitle, locale }, settings] = await Promise.all([
    loadPageData(),
    loadSettings(),
  ]);
  /* The tab icon: the conference's own when it brought one, else the church's. */
  const favicon = content.nav.favicon || settings?.faviconUrl || null;
  /* The site IS the event, so the browser tab, the search result and every
     share card should say so. The church's name belongs in the footer, not in
     the title of their own conference. */
  const title = eventTitle || siteName(settings);
  const description = event?.description ?? settings?.seoDescription ?? content.description;

  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    icons: favicon ? [{ url: favicon }] : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale ?? undefined,
      images: event?.heroImage ? [{ url: event.heroImage }] : undefined,
    },
  };
}

const SCHEMES = new Set(["light", "dark", "auto"]);

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [themeCss, locale, previewToken, content] = await Promise.all([
    loadThemeCss(),
    loadLocale(),
    // Non-null only inside the Customizer's preview iframe.
    getPreviewToken(),
    loadContent(),
  ]);

  /* The church's pick is what a visitor sees first; the visitor's own pick
     from the header (remembered on their device) wins over it. Applied by an
     inline script before first paint, so neither flashes the other scheme.
     Not in the Customizer preview: there the church is the one choosing, and
     a pick stored while they browsed their own site would hide their change. */
  const scheme = SCHEMES.has(content.scheme) ? content.scheme : "light";
  const schemeScript = `(function(){try{var d=document.documentElement,s=${JSON.stringify(scheme)};${
    previewToken ? "" : "var v=localStorage.getItem('judah-scheme');if(v==='light'||v==='dark'||v==='auto')s=v;"
  }d.dataset.scheme=s;d.classList.toggle('dark',s==='dark'||(s==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches));}catch(e){}})();`;

  return (
    <html
      lang={locale ?? "en"}
      className={`${newsreader.variable} ${barlow.variable} ${plexMono.variable}${scheme === "dark" ? " dark" : ""}`}
      data-scheme={scheme}
      /* The church's Animations switch. On <html> so it holds from the first
         paint, before the scroll engine hydrates. */
      data-motion={content.effects.motion === false ? "off" : undefined}
      /* The script above changes both before React hydrates. */
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: schemeScript }} />
        {themeCss ? (
          <style id="ministree-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
        ) : null}
      </head>
      <body>
        {children}
        {previewToken ? <PreviewBridge token={previewToken} /> : null}
      </body>
    </html>
  );
}
