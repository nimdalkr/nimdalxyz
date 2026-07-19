"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/content";

interface LocaleSwitchProps {
  locale: Locale;
  compact?: boolean;
}

function pathForLocale(pathname: string, locale: Locale) {
  const parts = pathname.split("/");

  if (parts[1] === "ko" || parts[1] === "en") {
    parts[1] = locale;
    return parts.join("/") || `/${locale}`;
  }

  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function LocaleSwitch({ locale, compact = false }: LocaleSwitchProps) {
  const pathname = usePathname();

  return (
    <nav
      className={compact ? "locale-switch is-compact" : "locale-switch"}
      aria-label={locale === "ko" ? "언어 선택" : "Language"}
    >
      {(["ko", "en"] as const).map((item) => (
        <Link
          key={item}
          href={pathForLocale(pathname, item)}
          hrefLang={item}
          lang={item}
          aria-current={locale === item ? "page" : undefined}
          className={locale === item ? "is-active" : undefined}
        >
          {item.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
