import type { ComponentType } from "react";

import CampaignOperationsPost, {
  metadata as campaignOperationsMetadata
} from "./campaign-operations-to-product-systems.mdx";
import NimdalLogbookPost, { metadata as nimdalLogbookMetadata } from "./nimdal-logbook.mdx";
import ResearchToolsPost, {
  metadata as researchToolsMetadata
} from "./research-tools-should-make-markets-readable.mdx";
import { absoluteBlogUrl } from "@/lib/site";

export type BlogPostMetadata = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: readonly string[];
  readingTime: string;
  cover: string;
  draft?: boolean;
};

export type BlogPost = BlogPostMetadata & {
  Content: ComponentType<Record<string, never>>;
  href: string;
  canonicalUrl: string;
  tagHrefs: readonly {
    tag: string;
    slug: string;
    href: string;
  }[];
};

export type BlogTag = {
  label: string;
  slug: string;
  count: number;
  href: string;
};

function assertMetadata(value: Record<string, unknown>): BlogPostMetadata {
  const tags = Array.isArray(value.tags) ? value.tags.filter((tag): tag is string => typeof tag === "string") : [];

  return {
    slug: String(value.slug),
    title: String(value.title),
    description: String(value.description),
    publishedAt: String(value.publishedAt),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
    category: String(value.category),
    tags,
    readingTime: String(value.readingTime),
    cover: String(value.cover),
    draft: typeof value.draft === "boolean" ? value.draft : undefined
  };
}

export function tagToSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createPost(metadata: Record<string, unknown>, Content: BlogPost["Content"]): BlogPost {
  const post = assertMetadata(metadata);

  return {
    ...post,
    Content,
    href: `/posts/${post.slug}`,
    canonicalUrl: absoluteBlogUrl(`/posts/${post.slug}`),
    tagHrefs: post.tags.map((tag) => {
      const slug = tagToSlug(tag);

      return {
        tag,
        slug,
        href: `/tags/${slug}`
      };
    })
  };
}

const allPosts = [
  createPost(nimdalLogbookMetadata, NimdalLogbookPost),
  createPost(researchToolsMetadata, ResearchToolsPost),
  createPost(campaignOperationsMetadata, CampaignOperationsPost)
].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function getBlogPosts(options: { includeDrafts?: boolean } = {}) {
  return allPosts.filter((post) => options.includeDrafts || !post.draft);
}

export function getBlogPost(slug: string) {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function getBlogTags(): BlogTag[] {
  const counts = new Map<string, BlogTag>();

  for (const post of getBlogPosts()) {
    for (const tag of post.tags) {
      const slug = tagToSlug(tag);
      const current = counts.get(slug);

      counts.set(slug, {
        label: current?.label ?? tag,
        slug,
        count: (current?.count ?? 0) + 1,
        href: `/tags/${slug}`
      });
    }
  }

  return [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function getPostsByTag(tagSlug: string) {
  return getBlogPosts().filter((post) => post.tags.some((tag) => tagToSlug(tag) === tagSlug));
}

export function getTagLabel(tagSlug: string) {
  return getBlogTags().find((tag) => tag.slug === tagSlug)?.label;
}

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
