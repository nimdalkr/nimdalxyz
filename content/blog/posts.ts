import type { Node as MarkdocNode } from "@markdoc/markdoc";
import { createReader, type Entry } from "@keystatic/core/reader";

import keystaticConfig from "@/keystatic.config";
import type { Locale } from "@/lib/content";
import { blogCanonicalUrl, tagSlug } from "@/lib/seo";

const reader = createReader(process.cwd(), keystaticConfig);

type CMSBlogPost = Entry<(typeof keystaticConfig.collections)["posts"]>;
export type BlogContentLoader = () => Promise<{ node: MarkdocNode }>;

export type LocalizedBlogTagLink = {
  label: string;
  slug: string;
  href: string;
  canonicalUrl: string;
};

export type LocalizedBlogPost = {
  slug: string;
  locale: Locale;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  title: string;
  description: string;
  category: string;
  tags: readonly string[];
  readingTime: string;
  body: BlogContentLoader;
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

type SourceBlogPost = {
  slug: string;
  entry: CMSBlogPost;
};

async function getSourceBlogPosts(): Promise<SourceBlogPost[]> {
  return reader.collections.posts.all();
}

/** Tag URLs are deliberately derived from the English source tags. */
function localizedTagLinks(
  post: SourceBlogPost,
  locale: Locale
): LocalizedBlogTagLink[] {
  return post.entry.en.tags.map((englishTag, index) => {
    const slug = tagSlug(englishTag);
    const label = post.entry[locale].tags[index] ?? englishTag;
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
  const copy = post.entry[locale];
  const href = `/${locale}/posts/${post.slug}`;
  const tagLinks = localizedTagLinks(post, locale);

  return {
    slug: post.slug,
    locale,
    publishedAt: post.entry.publishedAt,
    updatedAt: post.entry.updatedAt,
    cover: post.entry.cover,
    coverWidth: post.entry.coverWidth,
    coverHeight: post.entry.coverHeight,
    ...copy,
    body: locale === "ko" ? post.entry.bodyKo : post.entry.bodyEn,
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

export async function getBlogPostSlugs() {
  return reader.collections.posts.list();
}

export async function getLocalizedBlogPosts(locale: Locale) {
  const posts = await getSourceBlogPosts();

  return posts
    .map((post) => localizePost(post, locale))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getLocalizedBlogPost(locale: Locale, slug: string) {
  const entry = await reader.collections.posts.read(slug);

  return entry ? localizePost({ slug, entry }, locale) : undefined;
}

export async function getLocalizedBlogTags(locale: Locale): Promise<LocalizedBlogTag[]> {
  const tags = new Map<string, LocalizedBlogTag>();

  for (const post of await getLocalizedBlogPosts(locale)) {
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

export async function getLocalizedPostsByTag(locale: Locale, slug: string) {
  return (await getLocalizedBlogPosts(locale)).filter((post) =>
    post.tagLinks.some((tag) => tag.slug === slug)
  );
}

export async function getLocalizedTagLabel(locale: Locale, slug: string) {
  return (await getLocalizedBlogTags(locale)).find((tag) => tag.slug === slug)?.label;
}

export function formatPostDate(value: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

// Compatibility aliases for existing imports while the canonical functions remain locale-aware.
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
