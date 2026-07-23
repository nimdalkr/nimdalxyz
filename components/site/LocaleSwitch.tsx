"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/content";

interface LocaleSwitchProps {
  locale: Locale;
  compact?: boolean;
  absoluteOrigin?: string;
}

function pathForLocale(pathname: string, locale: Locale, absoluteOrigin?: string) {
  const parts = pathname.split("/");

  let path: string;

  if (parts[1] === "ko" || parts[1] === "en") {
    parts[1] = locale;
    path = parts.join("/") || `/${locale}`;
  } else {
    path = `/${locale}${pathname === "/" ? "" : pathname}`;
  }

  return absoluteOrigin ? new URL(path, absoluteOrigin).toString() : path;
}

export function LocaleSwitch({ locale, compact = false, absoluteOrigin }: LocaleSwitchProps) {
  const pathname = usePathname();

  return (
    <nav
      className={compact ? "locale-switch is-compact" : "locale-switch"}
      aria-label={locale === "ko" ? "언어 선택" : "Language"}
    >
      {(["ko", "en"] as const).map((item) => (
        <Link
          key={item}
          href={pathForLocale(pathname, item, absoluteOrigin)}
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
