import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { loadLocale, loadSettings, loadThemeCss, siteName } from "@/lib/ministree";
import { loadPageData } from "@/lib/page-data";
import "./globals.css";

/* The two faces this concept is. next/font resolves at build time and
   self-hosts them, so there is no render-blocking request to Google and no
   third party watching the reader. */
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});
const jost = Jost({
  weight: ["200", "300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  /* Through `loadPageData`, not the raw event record: the Customizer can now
     have the last word over the event's title, dates and description, and a
     tab that still says the record's name would be the one place on the site
     that disagrees with the page under it. Every loader inside is request
     cached, so this costs no second fetch. */
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [themeCss, locale, previewToken] = await Promise.all([
    loadThemeCss(),
    loadLocale(),
    // Non-null only inside the Customizer's preview iframe.
    getPreviewToken(),
  ]);

  return (
    <html lang={locale ?? "en"} className={`${cormorant.variable} ${jost.variable}`}>
      <head>
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
