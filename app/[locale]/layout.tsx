import type { Metadata, Viewport } from "next";

import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { notoSansKr, plexMono } from "@/lib/fonts";
import { isLocale, locales, siteContent } from "@/lib/content";

import "../globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";
  const isKorean = locale === "ko";

  return {
    metadataBase: new URL("https://nimdal.xyz"),
    title: {
      default: isKorean ? siteContent.ko.seo.title : "Nimdal — Signals into systems",
      template: "%s — Nimdal"
    },
    description: isKorean
      ? siteContent.ko.seo.description
      : "Nimdal turns market signals, campaign operations, research, and playful ideas into usable product systems.",
    applicationName: "Nimdal",
    authors: [{
      name: "Tak Chanwoo / Nimdal",
      url: `https://nimdal.xyz/${locale}/portfolio`
    }],
    creator: "Tak Chanwoo / Nimdal",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "64x64" },
        { url: "/favicon.png", type: "image/png", sizes: "400x400" }
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "400x400" }]
    },
    openGraph: {
      type: "website",
      siteName: "Nimdal",
      images: [
        {
          url: "/favicon.png",
          width: 400,
          height: 400,
          alt: isKorean ? "Nimdal의 픽셀 문어 아이덴티티" : "Nimdal pixel-octopus identity"
        }
      ]
    },
    twitter: {
      card: "summary",
      images: ["/favicon.png"]
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06a4ee",
  colorScheme: "light dark"
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${notoSansKr.variable} ${plexMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "ko" ? "본문으로 바로가기" : "Skip to content"}
        </a>
        <ScrollProgress />
        <div className="locale-root" data-locale={locale}>{children}</div>
      </body>
    </html>
  );
}
