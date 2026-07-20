import Link from "next/link";

import type { Locale } from "@/lib/content";
import { LocaleSwitch } from "@/components/site/LocaleSwitch";
import { MobileMenu } from "@/components/site/MobileMenu";

interface SiteHeaderProps {
  locale: Locale;
  labels: {
    work: string;
    lab: string;
    about: string;
    log: string;
    contact: string;
  };
  tone?: "cyan" | "navy" | "foam";
}

export function SiteHeader({ locale, labels, tone = "navy" }: SiteHeaderProps) {
  return (
    <header className={`site-header is-${tone}`}>
      <Link
        href={`/${locale}`}
        className="site-wordmark"
        aria-label={locale === "ko" ? "Nimdal 홈" : "Nimdal home"}
      >
        NIMDAL
      </Link>
      <nav className="desktop-nav" aria-label={locale === "ko" ? "주요 메뉴" : "Primary navigation"}>
        <Link href={`/${locale}#work`}>{labels.work}</Link>
        <Link href={`/${locale}#lab`}>{labels.lab}</Link>
        <Link href={`/${locale}#about`}>{labels.about}</Link>
        <Link href={`/${locale}#log`}>{labels.log}</Link>
        <Link href={`/${locale}#contact`}>{labels.contact}</Link>
      </nav>
      <div className="header-actions">
        <LocaleSwitch locale={locale} />
        <MobileMenu locale={locale} labels={labels} />
      </div>
    </header>
  );
}
