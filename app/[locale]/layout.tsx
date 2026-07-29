import type { Metadata, Viewport } from "next";

import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { PaperGrain } from "@/components/riso/PaperGrain";
import { bricolage, gothicA1, notoSansKr, plexMono } from "@/lib/fonts";
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
      default: isKorean ? siteContent.ko.seo.title : "Nimdal / Signals into systems",
      template: "%s / Nimdal"
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e6e5df" },
    { media: "(prefers-color-scheme: dark)", color: "#191b1a" }
  ],
  colorScheme: "light dark"
};

/** Applies a stored stock choice before first paint so the page never flashes. */
const stockScript =
  "try{var s=localStorage.getItem('nimdal-stock');if(s==='paper'||s==='black'){document.documentElement.dataset.stock=s}}catch(e){}";

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "en";

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${gothicA1.variable} ${notoSansKr.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: stockScript }} />
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
        <ScrollProgress />
        <PaperGrain />
        <div className="locale-root" data-locale={locale}>{children}</div>
      </body>
    </html>
  );
}
