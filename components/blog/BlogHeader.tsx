import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

interface BlogHeaderProps {
  locale?: Locale;
  hubHref?: string;
  languagePath?: string;
  languageHref?: string;
}

const labels = {
  ko: {
    home: "홈",
    portfolio: "경력",
    rss: "RSS",
    nav: "블로그 메뉴",
    language: "English"
  },
  en: {
    home: "Home",
    portfolio: "Dossier",
    rss: "RSS",
    nav: "Blog navigation",
    language: "한국어"
  }
} as const;

export function BlogHeader({
  locale = "en",
  hubHref = blogCanonicalUrl(locale),
  languagePath = "/",
  languageHref
}: BlogHeaderProps) {
  const copy = labels[locale];
  const alternateLocale: Locale = locale === "ko" ? "en" : "ko";

  return (
    <header className="blog-header">
      <Link
        className="blog-brand"
        href={hubHref}
        aria-label={locale === "ko" ? "nimdalog 홈" : "nimdalog home"}
      >
        <Image
          src="/media/identity-octopus.jpg"
          alt=""
          width={42}
          height={42}
          className="blog-brand-mark"
        />
        <strong>nimdalog</strong>
      </Link>

      <nav className="blog-nav" aria-label={copy.nav}>
        <Link href={`${siteConfig.mainUrl}/${locale}`}>{copy.home}</Link>
        <Link href={`${siteConfig.mainUrl}/${locale}/portfolio`}>{copy.portfolio}</Link>
        <Link href={blogCanonicalUrl(locale, "/rss.xml")}>{copy.rss}</Link>
        <Link
          href={languageHref ?? blogCanonicalUrl(alternateLocale, languagePath)}
          hrefLang={alternateLocale}
          lang={alternateLocale}
        >
          {copy.language}
        </Link>
      </nav>
    </header>
  );
}
