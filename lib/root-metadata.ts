import type { Metadata } from "next";

import { isLocale, siteContent } from "@/lib/content";

/** Site-wide metadata defaults for the locale root layout. */
export async function localeRootMetadata(params: Promise<{ locale: string }>): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";
  const isKorean = locale === "ko";

  return {
    metadataBase: new URL("https://nimdal.xyz"),
    title: {
      default: isKorean ? siteContent.ko.seo.title : "Nimdal / Signals into systems",
      template: "%s / Nimdal"
    },
    description: isKorean
      ? siteContent.ko.seo.description
      : "Nimdal turns market signals, campaign operations, research, and playful ideas into usable product systems.",
    applicationName: "Nimdal",
    authors: [{
      name: "Tak Chanwoo / Nimdal",
      url: `https://nimdal.xyz/${locale}`
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
          url: "/media/og-dive.png",
          width: 1200,
          height: 630,
          alt: isKorean ? "님달 포트폴리오의 잠수 인터페이스" : "The dive interface of the Nimdal portfolio"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      images: ["/media/og-dive.png"]
    }
  };
}
