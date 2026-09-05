import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { getPreviewToken } from "@ministree/template-sdk/next";
import { PreviewBridge } from "@ministree/template-sdk/preview";
import { loadContent, loadLocale, loadSettings, loadThemeCss, siteName } from "@/lib/ministree";
import { loadFeaturedEvent } from "@ministree-templates/event-kit/event";
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
