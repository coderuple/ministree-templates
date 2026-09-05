import type { Metadata } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { loadContent, loadLocale, loadSettings, loadThemeCss, siteName } from "@/lib/ministree";
import { loadFeaturedEvent } from "@ministree-templates/event-kit/event";
import "./globals.css";

/* The two faces this concept is. next/font resolves at build time and
   self-hosts them, so there is no render-blocking request to Google and no
   third party watching the reader. */
const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
const schibsted = Schibsted_Grotesk({
  /* Variable: this family has no 300, and its lightest cut is 400. */
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, content, locale] = await Promise.all([
    loadSettings(),
    loadContent(),
    loadLocale(),
  ]);
  /* The site IS the event, so the browser tab, the search result and every
     share card should say so. The church's name belongs in the footer, not in
     the title of their own conference. */
  const event = await loadFeaturedEvent(content);
  const title = event?.title ?? content.name ?? siteName(settings);
  const description = event?.description ?? settings?.seoDescription ?? content.description;

  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    icons: settings?.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale ?? undefined,
      images: event?.coverImageUrl ? [{ url: event.coverImageUrl }] : undefined,
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
    <html lang={locale ?? "en"} className={`${instrument.variable} ${schibsted.variable}`}>
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
