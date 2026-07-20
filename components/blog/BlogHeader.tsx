import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

import styles from "./BlogSurface.module.css";

interface BlogHeaderProps {
  locale?: Locale;
  hubHref?: string;
  languagePath?: string;
  languageHref?: string;
}

const labels = {
  ko: {
    nav: "블로그 메뉴"
  },
  en: {
    nav: "Blog navigation"
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
  const alternateHref = languageHref ?? blogCanonicalUrl(alternateLocale, languagePath);
  const currentHref = languagePath === "/" ? hubHref : blogCanonicalUrl(locale, languagePath);
  const navigation: readonly {
    label: string;
    href: string;
    current?: boolean;
  }[] = [
    { label: "PORTFOLIO", href: `${siteConfig.mainUrl}/${locale}#top` },
    { label: "CAREER", href: `${siteConfig.mainUrl}/${locale}#career` },
    { label: "NFT", href: `${siteConfig.mainUrl}/${locale}/projects/alphaduo` },
    { label: "GAME", href: `${siteConfig.mainUrl}/${locale}/projects/mylol` },
    { label: "BLOG", href: hubHref, current: true }
  ] as const;

  return (
    <header className={styles.rail}>
      <div className={styles.identity}>
        <Link
          className={styles.markLink}
          href={hubHref}
          aria-label={locale === "ko" ? "블로그 홈" : "BLOG home"}
        >
          <Image
            src="/media/identity-octopus.jpg"
            alt=""
            width={168}
            height={168}
            priority
            className={styles.mark}
          />
        </Link>
        <p className={styles.brand}>NIMDAL / BLOG</p>
        <hr className={styles.brandRule} />
      </div>

      <p className={styles.scene} aria-label={locale === "ko" ? "장면 4, 전체 6" : "Scene 4 of 6"}>
        <strong>04</strong>
        <span aria-hidden="true">/</span>
        <span>06</span>
      </p>

      <nav className={styles.primaryNav} aria-label={copy.nav}>
        <ul>
          {navigation.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={item.current ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.locale}>
        <div className={styles.localeLinks} aria-label={locale === "ko" ? "언어 선택" : "Choose language"}>
          <Link
            href={locale === "ko" ? currentHref : alternateHref}
            hrefLang="ko"
            aria-current={locale === "ko" ? "page" : undefined}
            lang="ko"
          >
            KO
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={locale === "en" ? currentHref : alternateHref}
            hrefLang="en"
            aria-current={locale === "en" ? "page" : undefined}
            lang="en"
          >
            EN
          </Link>
        </div>
        <hr className={styles.localeRule} />
      </div>
    </header>
  );
}
