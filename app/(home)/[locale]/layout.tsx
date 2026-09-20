import type { Viewport } from "next";

import { homeSans } from "@/lib/home-fonts";
import { isLocale, locales } from "@/lib/content";
import { localeRootMetadata } from "@/lib/root-metadata";

import "./home.css";

interface HomeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Unknown locales fall through to the global 404 instead of an empty page.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: Pick<HomeLayoutProps, "params">) {
  return localeRootMetadata(params);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f5f7",
  colorScheme: "light"
};

export default async function HomeLayout({ children, params }: HomeLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={homeSans.variable}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "ko" ? "본문으로 바로가기" : "Skip to content"}
        </a>
        <div className="locale-root" data-locale={locale}>{children}</div>
      </body>
    </html>
  );
}
