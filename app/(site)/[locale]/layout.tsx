import type { Viewport } from "next";

import { LegacyEffects } from "@/components/ink/LegacyEffects";
import { bricolage, nanumMyeongjo, notoSerifKr, plexMono } from "@/lib/fonts";
import { isLocale, locales } from "@/lib/content";
import { localeRootMetadata } from "@/lib/root-metadata";

import "../../globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">) {
  return localeRootMetadata(params);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f5f2",
  colorScheme: "light"
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${nanumMyeongjo.variable} ${notoSerifKr.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Scroll reveals render at opacity 0 before the script runs. Without
            this, a failed or disabled script would hide everything below the
            fold permanently. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}.riso-plate-flo{transform:none!important}"}</style>
        </noscript>
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "ko" ? "본문으로 바로가기" : "Skip to content"}
        </a>
        <LegacyEffects />
        <div className="locale-root" data-locale={locale}>{children}</div>
      </body>
    </html>
  );
}
