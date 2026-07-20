import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const htmlLangByLocale: Record<Locale, string> = {
  ko: "ko",
  en: "en"
};

export const openGraphLocaleByLocale: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US"
};

export const projectSections = ["signal", "build", "proof", "next"] as const;
export type ProjectSection = (typeof projectSections)[number];

export const legacyProjectSlugMap: Readonly<Record<string, string>> = {
  "arcdu-nft": "alphaduo"
};

export type CanonicalSurface = "main" | "blog";

export const canonicalSurfaceHeader = "x-nimdal-surface";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function isProjectSection(value: string): value is ProjectSection {
  return projectSections.includes(value as ProjectSection);
}

export function normalizeProjectSlug(slug: string) {
  return legacyProjectSlugMap[slug] ?? slug;
}

export function tagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export function localizedPath(locale: Locale, pathname = "/") {
  const localeNeutralPath = withoutLocalePrefix(pathname);
  const suffix = localeNeutralPath === "/" ? "" : localeNeutralPath.replace(/\/$/, "");

  return `/${locale}${suffix}`;
}

export function canonicalOrigin(surface: CanonicalSurface = "main") {
  return surface === "blog" ? siteConfig.blogUrl : siteConfig.mainUrl;
}

export function canonicalSurfaceFromHeader(value: string | null): CanonicalSurface {
  return value === "blog" ? "blog" : "main";
}

export function absoluteCanonicalUrl(
  locale: Locale,
  pathname = "/",
  surface: CanonicalSurface = "main"
) {
  return new URL(localizedPath(locale, pathname), canonicalOrigin(surface)).toString();
}

export function hreflangAlternates(
  pathname = "/",
  surface: CanonicalSurface = "main"
): Record<Locale | "x-default", string> {
  const alternateUrls = Object.fromEntries(
    locales.map((locale) => [locale, absoluteCanonicalUrl(locale, pathname, surface)])
  ) as Record<Locale, string>;

  return {
    ...alternateUrls,
    "x-default": absoluteCanonicalUrl(defaultLocale, pathname, surface)
  };
}

export function metadataAlternates(
  locale: Locale,
  pathname = "/",
  surface: CanonicalSurface = "main"
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteCanonicalUrl(locale, pathname, surface),
    languages: hreflangAlternates(pathname, surface)
  };
}

/**
 * Pair with `(await headers()).get(canonicalSurfaceHeader)` in the shared blog hub.
 * The blog host exposes `/{locale}` while the main site exposes `/{locale}/blog`.
 */
export function blogHubMetadataAlternates(locale: Locale, surface: CanonicalSurface) {
  return surface === "blog"
    ? metadataAlternates(locale, "/", "blog")
    : metadataAlternates(locale, "/blog", "main");
}

export function projectCanonicalPath(locale: Locale, slug: string) {
  return localizedPath(locale, `/projects/${normalizeProjectSlug(slug)}`);
}

export function projectCanonicalUrl(locale: Locale, slug: string) {
  return new URL(projectCanonicalPath(locale, slug), siteConfig.mainUrl).toString();
}

export function blogCanonicalUrl(locale: Locale, pathname = "/") {
  return absoluteCanonicalUrl(locale, pathname, "blog");
}
