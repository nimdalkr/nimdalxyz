import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const openGraphLocaleByLocale: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US"
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

function withoutLocalePrefix(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalized.split("/");

  if (isLocale(segments[1] ?? "")) {
    segments.splice(1, 1);
  }

  const path = segments.join("/").replace(/\/{2,}/g, "/");
  return path === "" ? "/" : path;
}

function localizedPath(locale: Locale, pathname = "/") {
  const localeNeutralPath = withoutLocalePrefix(pathname);
  const suffix = localeNeutralPath === "/" ? "" : localeNeutralPath.replace(/\/$/, "");

  return `/${locale}${suffix}`;
}

export function absoluteCanonicalUrl(locale: Locale, pathname = "/") {
  return new URL(localizedPath(locale, pathname), siteConfig.mainUrl).toString();
}

export function hreflangAlternates(pathname = "/"): Record<Locale | "x-default", string> {
  const alternateUrls = Object.fromEntries(
    locales.map((locale) => [locale, absoluteCanonicalUrl(locale, pathname)])
  ) as Record<Locale, string>;

  return {
    ...alternateUrls,
    "x-default": absoluteCanonicalUrl(defaultLocale, pathname)
  };
}

export function metadataAlternates(
  locale: Locale,
  pathname = "/"
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteCanonicalUrl(locale, pathname),
    languages: hreflangAlternates(pathname)
  };
}
