import Image from "next/image";
import Link from "next/link";

import { StockToggle } from "@/components/riso/StockToggle";
import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import { MobileMenu } from "@/components/site/MobileMenu";
import type { Locale } from "@/lib/content";
import { blogCanonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

interface SiteHeaderProps {
  locale: Locale;
  active?: "home" | "about" | "career" | "blog";
  blogSurface?: boolean;
}

const navCopy = {
  ko: { about: "소개", career: "경력", blog: "블로그", menu: "주요 메뉴" },
  en: { about: "About", career: "Career", blog: "Blog", menu: "Primary navigation" }
} as const;

export function SiteHeader({ locale, active, blogSurface = false }: SiteHeaderProps) {
  const copy = navCopy[locale];
  const origin = blogSurface ? siteConfig.blogUrl : undefined;

  return (
    <header className="masthead">
      <Link
        href={`/${locale}`}
        className="masthead-brand"
        aria-label={locale === "ko" ? "Nimdal 홈" : "Nimdal home"}
      >
        <Image
          src="/media/identity-octopus.jpg"
          alt=""
          width={26}
          height={26}
          priority
          className="masthead-mark"
        />
        <span>NIMDAL.XYZ</span>
      </Link>
      <nav className="masthead-nav" aria-label={copy.menu}>
        <Link className={active === "about" ? "is-active" : undefined} href={`/${locale}/about`}>
          {copy.about}
        </Link>
        <Link className={active === "career" ? "is-active" : undefined} href={`/${locale}/portfolio`}>
          {copy.career}
        </Link>
        <a className={active === "blog" ? "is-active" : undefined} href={blogCanonicalUrl(locale)}>
          {copy.blog}
        </a>
      </nav>
      <div className="masthead-tools">
        <LocaleSwitch locale={locale} absoluteOrigin={origin} />
        <StockToggle locale={locale} />
        <MobileMenu locale={locale} absoluteOrigin={origin} />
      </div>
    </header>
  );
}
