import type { ComponentType } from "react";

import CampaignOperationsEn from "./campaign-operations-to-product-systems.mdx";
import CampaignOperationsKo from "./ko/campaign-operations-to-product-systems.mdx";
import NimdalLogbookEn from "./nimdal-logbook.mdx";
import NimdalLogbookKo from "./ko/nimdal-logbook.mdx";
import ResearchToolsEn from "./research-tools-should-make-markets-readable.mdx";
import ResearchToolsKo from "./ko/research-tools-should-make-markets-readable.mdx";
import {
  blogPosts,
  type Locale
} from "@/lib/content";
import { blogCanonicalUrl, tagSlug } from "@/lib/seo";

type BlogContent = ComponentType<Record<string, never>>;
type SourceBlogPost = (typeof blogPosts)[number];
type BlogSlug = SourceBlogPost["slug"];

const localizedContent = {
  "nimdal-logbook": {
    ko: NimdalLogbookKo,
    en: NimdalLogbookEn
  },
  "research-tools-should-make-markets-readable": {
    ko: ResearchToolsKo,
    en: ResearchToolsEn
  },
  "campaign-operations-to-product-systems": {
    ko: CampaignOperationsKo,
    en: CampaignOperationsEn
  }
} as const satisfies Record<BlogSlug, Record<Locale, BlogContent>>;

export type LocalizedBlogTagLink = {
  label: string;
  slug: string;
  href: string;
  canonicalUrl: string;
};

export type LocalizedBlogPost = Omit<SourceBlogPost, "copy"> & {
  locale: Locale;
  title: string;
  description: string;
  category: string;
  tags: readonly string[];
  readingTime: string;
  Content: BlogContent;
  href: string;
  canonicalUrl: string;
  tagLinks: readonly LocalizedBlogTagLink[];
  /** Kept while legacy routes are redirected by proxy. */
  tagHrefs: readonly {
    tag: string;
    slug: string;
    href: string;
  }[];
};

export type LocalizedBlogTag = {
  locale: Locale;
  label: string;
  slug: string;
  count: number;
  href: string;
  canonicalUrl: string;
};

/** Tag URLs are deliberately derived from the English source tags. */
function localizedTagLinks(post: SourceBlogPost, locale: Locale): LocalizedBlogTagLink[] {
  return post.copy.en.tags.map((englishTag, index) => {
    const slug = tagSlug(englishTag);
    const label = post.copy[locale].tags[index] ?? englishTag;
    const href = `/${locale}/tags/${slug}`;

    return {
      label,
      slug,
      href,
      canonicalUrl: blogCanonicalUrl(locale, `/tags/${slug}`)
    };
  });
}

function localizePost(post: SourceBlogPost, locale: Locale): LocalizedBlogPost {
  const copy = post.copy[locale];
  const href = `/${locale}/posts/${post.slug}`;
  const tagLinks = localizedTagLinks(post, locale);

  return {
    ...post,
    locale,
    ...copy,
    Content: localizedContent[post.slug][locale],
    href,
    canonicalUrl: blogCanonicalUrl(locale, `/posts/${post.slug}`),
    tagLinks,
    tagHrefs: tagLinks.map((tag) => ({
      tag: tag.label,
      slug: tag.slug,
      href: tag.href
    }))
  };
}

export function getLocalizedBlogPosts(locale: Locale) {
  return blogPosts
    .map((post) => localizePost(post, locale))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getLocalizedBlogPost(locale: Locale, slug: string) {
  return getLocalizedBlogPosts(locale).find((post) => post.slug === slug);
}

export function getLocalizedBlogTags(locale: Locale): LocalizedBlogTag[] {
  const tags = new Map<string, LocalizedBlogTag>();

  for (const post of getLocalizedBlogPosts(locale)) {
    for (const tag of post.tagLinks) {
      const current = tags.get(tag.slug);

      tags.set(tag.slug, {
        locale,
        label: current?.label ?? tag.label,
        slug: tag.slug,
        count: (current?.count ?? 0) + 1,
        href: tag.href,
        canonicalUrl: tag.canonicalUrl
      });
    }
  }

  return [...tags.values()].sort((a, b) => a.label.localeCompare(b.label, locale));
}

export function getLocalizedPostsByTag(locale: Locale, slug: string) {
  return getLocalizedBlogPosts(locale).filter((post) =>
    post.tagLinks.some((tag) => tag.slug === slug)
  );
}

export function getLocalizedTagLabel(locale: Locale, slug: string) {
  return getLocalizedBlogTags(locale).find((tag) => tag.slug === slug)?.label;
}

export function formatPostDate(value: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

// Temporary compatibility for redirected legacy routes and components.
export type BlogPost = LocalizedBlogPost;
export type BlogTag = LocalizedBlogTag;

export function getBlogPosts() {
  return getLocalizedBlogPosts("en");
}

export function getBlogPost(slug: string) {
  return getLocalizedBlogPost("en", slug);
}

export function getBlogTags() {
  return getLocalizedBlogTags("en");
}

export function getPostsByTag(slug: string) {
  return getLocalizedPostsByTag("en", slug);
}

export function getTagLabel(slug: string) {
  return getLocalizedTagLabel("en", slug);
}

export { tagSlug as tagToSlug };
