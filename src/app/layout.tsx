import type { Metadata } from "next";
import { Anton, Cormorant_Garamond, Archivo } from "next/font/google";
import { resolveColorScheme, resolveThemeCss } from "@ministree/template-sdk";
import { defaults, loadContent, loadSettings, loadTokenOverrides, manifest, siteName } from "@/lib/ministree";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
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
  const settings = await loadSettings();
  const name = siteName(settings);
  const description = settings?.seoDescription ?? defaults.description;
  return {
    title: { default: name, template: `%s · ${name}` },
    description,
    icons: settings?.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, tokenOverrides, content] = await Promise.all([
    loadSettings(),
    loadTokenOverrides(),
    loadContent(),
  ]);
  const scheme = resolveColorScheme(settings);
  const themeCss = resolveThemeCss(manifest, { siteSettings: settings ?? undefined, tokenOverrides });

  // Cinematic effects are flame-only and toggled per church in the Customizer.
  // Omitted/undefined means ON (cinematic by default); only an explicit `false` calms it.
  const fx = (content as { effects?: Record<string, boolean | undefined> }).effects ?? {};
  const grainOn = fx.grain !== false;
  const cursorOn = fx.cursor !== false;
  const smoothScrollOn = fx.scrollReveals !== false;

  // Dark mode follows the visitor's device preference WHEN the church enables it
  // (Settings → dark mode). Disabled → light only. A manual toggle is remembered.
  const darkAllowed =
    (settings?.themeOverrides as Record<string, unknown> | undefined)?.darkModeEnabled !== false;
  const schemeScript = `(function(){try{var allow=${darkAllowed};var d=document.documentElement;if(!allow){d.classList.remove('dark');return;}var s=localStorage.getItem('flame-scheme');if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}}catch(e){}})();`;

  return (
    <html
      lang="en"
      className={`${anton.variable} ${cormorant.variable} ${archivo.variable} ${scheme === "dark" ? "dark" : ""} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {themeCss ? <style id="ministree-theme" dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
        <script dangerouslySetInnerHTML={{ __html: schemeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink">
        <Header />
        <main>{children}</main>
        <Footer />

        {/* cinematic atmosphere — sit above content, below the cursor */}
        {grainOn ? (
          <>
            <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-[80]" />
            <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[90]" />
          </>
        ) : null}
        {smoothScrollOn ? <SmoothScroll /> : null}
        {cursorOn ? <Cursor /> : null}
      </body>
    </html>
  );
}
