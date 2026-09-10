import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { loadLocale, loadSettings, loadThemeCss, siteName } from "@/lib/ministree";
import { loadPageData } from "@/lib/page-data";
import "./globals.css";

/* The two faces this concept is. next/font resolves at build time and
   self-hosts them, so there is no render-blocking request to Google and no
   third party watching the reader.

   Bodoni Moda is a variable didone with an optical-size axis: at masthead
   sizes it wants the high-contrast display cut, and at caption sizes the
   sturdier text cut. Declaring `opsz` is what lets one file do both. */
const bodoni = Bodoni_Moda({
  /* "variable", not a weight list: next/font only accepts `axes` on a font
     left variable, and every weight from 400 to 700 is used below. */
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});
const archivo = Archivo({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-archivo",
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
    <html lang={locale ?? "en"} className={`${bodoni.variable} ${archivo.variable}`}>
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
