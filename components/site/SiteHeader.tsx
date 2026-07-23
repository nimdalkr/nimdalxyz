import Image from "next/image";
import Link from "next/link";

import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import { MobileMenu } from "@/components/site/MobileMenu";
import type { Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

interface SiteHeaderProps {
  locale: Locale;
  active?: "home" | "about" | "career" | "blog";
  labels?: unknown;
  tone?: "cyan" | "navy" | "foam";
  blogSurface?: boolean;
}

const navCopy = {
  ko: { about: "소개", career: "경력", blog: "블로그", menu: "주요 메뉴" },
  en: { about: "About", career: "Career", blog: "BLOG", menu: "Primary navigation" }
} as const;

export function SiteHeader({ locale, active, blogSurface = false }: SiteHeaderProps) {
  const copy = navCopy[locale];

  return (
    <header className="pixel-header">
      <Link href={`/${locale}`} className="pixel-wordmark" aria-label={locale === "ko" ? "Nimdal 홈" : "Nimdal home"}>
        <Image src="/media/identity-octopus.jpg" alt="" width={30} height={30} priority className="pixel-wordmark-mark" />
        <span>NIMDAL.XYZ</span>
      </Link>
      <nav className="pixel-nav" aria-label={copy.menu}>
        <Link className={active === "about" ? "is-active" : undefined} href={`/${locale}/about`}>{copy.about}</Link>
        <Link className={active === "career" ? "is-active" : undefined} href={`/${locale}/portfolio`}>{copy.career}</Link>
        <a className={active === "blog" ? "is-active" : undefined} href={blogCanonicalUrl(locale)}>{copy.blog}</a>
      </nav>
      <div className="pixel-header-actions">
        <LocaleSwitch locale={locale} absoluteOrigin={blogSurface ? siteConfig.blogUrl : undefined} />
        <MobileMenu locale={locale} absoluteOrigin={blogSurface ? siteConfig.blogUrl : undefined} />
      </div>
    </header>
  );
}
