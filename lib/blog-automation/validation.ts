import type { BlogPendingRequest } from "@/lib/blog-editor/types";
import {
  BLOG_ATTACHMENT_ID_PATTERN,
  BLOG_SLUG_PATTERN,
  MAX_BLOG_BODY_IMAGES,
  MAX_BLOG_BODY_LENGTH
} from "@/lib/blog-editor/validation";

import {
  BlogAutomationError,
  type BlogEnrichmentOutput,
  type BlogEnrichmentTagPair
} from "@/lib/blog-automation/types";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const BODY_IMAGE_TARGET_PATTERN = /\]\((\/media\/blog\/[A-Za-z0-9._/-]+)\)/g;
const MARKDOWN_DESTINATION_PATTERN = /\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function assertText(
  value: unknown,
  field: string,
  options: { max: number; trim?: boolean }
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > options.max ||
    CONTROL_CHARACTER_PATTERN.test(value) ||
    (options.trim && value !== value.trim())
  ) {
    throw new BlogAutomationError("unsafe_output", `Invalid enrichment field: ${field}`);
  }
}

function tagSlug(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractOwnedBlogBodyImagePaths(markdown: string, slug: string) {
  const prefix = `/media/blog/${slug}/body-`;
  return [...markdown.matchAll(BODY_IMAGE_TARGET_PATTERN)]
    .map((match) => match[1])
    .filter((path): path is string => typeof path === "string" && path.startsWith(prefix));
}

export function extractMarkdownDestinations(markdown: string) {
  return [...markdown.matchAll(MARKDOWN_DESTINATION_PATTERN)]
    .map((match) => match[1])
    .filter((destination): destination is string => typeof destination === "string");
}

export function validatePendingBlogBodyImages(request: BlogPendingRequest) {
  if (
    !BLOG_SLUG_PATTERN.test(request.slug) ||
    !Array.isArray(request.bodyImages) ||
    request.bodyImages.length > MAX_BLOG_BODY_IMAGES
  ) {
    throw new BlogAutomationError("invalid_pending_request", "Invalid pending body image count");
  }

  const ids = new Set<string>();
  const paths = new Set<string>();

  for (const image of request.bodyImages) {
    const expectedPrefix = `/media/blog/${request.slug}/body-${image.id}.`;

    if (
      !BLOG_ATTACHMENT_ID_PATTERN.test(image.id) ||
      ids.has(image.id) ||
      typeof image.path !== "string" ||
      !image.path.startsWith(expectedPrefix) ||
      !/\.(?:gif|jpe?g|png|webp)$/i.test(image.path) ||
      image.path.includes("..") ||
      image.path.includes("//") ||
      paths.has(image.path) ||
      typeof image.alt !== "string" ||
      image.alt.trim().length === 0 ||
      image.alt.length > 180 ||
      CONTROL_CHARACTER_PATTERN.test(image.alt) ||
      !Number.isSafeInteger(image.width) ||
      image.width < 1 ||
      image.width > 20_000 ||
      !Number.isSafeInteger(image.height) ||
      image.height < 1 ||
      image.height > 20_000 ||
      !request.bodyKo.includes(`](${image.path})`)
    ) {
      throw new BlogAutomationError("invalid_pending_request", "Invalid pending body image metadata");
    }

    ids.add(image.id);
    paths.add(image.path);
  }

  if (/\]\(attachment:[^)]+\)/.test(request.bodyKo)) {
    throw new BlogAutomationError("invalid_pending_request", "Unresolved body image attachment");
  }

  return request.bodyImages;
}

function validateTagPair(value: unknown, index: number): asserts value is BlogEnrichmentTagPair {
  if (!isRecord(value) || !hasExactKeys(value, ["ko", "en"])) {
    throw new BlogAutomationError("unsafe_output", `Invalid enrichment tag: ${index}`);
  }

  assertText(value.ko, `tags.${index}.ko`, { max: 64, trim: true });
  assertText(value.en, `tags.${index}.en`, { max: 64, trim: true });
}

export function validateGeminiBlogEnrichmentOutput(
  value: unknown,
  request: BlogPendingRequest
): BlogEnrichmentOutput {
  validatePendingBlogBodyImages(request);

  const requiredKeys = [
    "titleEn",
    "bodyEn",
    "summaryKo",
    "summaryEn",
    "categoryKo",
    "categoryEn",
    "tags"
  ] as const;

  if (!isRecord(value) || !hasExactKeys(value, requiredKeys)) {
    throw new BlogAutomationError("unsafe_output", "Invalid enrichment object shape");
  }

  assertText(value.titleEn, "titleEn", { max: 140, trim: true });
  assertText(value.bodyEn, "bodyEn", { max: MAX_BLOG_BODY_LENGTH });
  assertText(value.summaryKo, "summaryKo", { max: 320, trim: true });
  assertText(value.summaryEn, "summaryEn", { max: 320, trim: true });
  assertText(value.categoryKo, "categoryKo", { max: 80, trim: true });
  assertText(value.categoryEn, "categoryEn", { max: 80, trim: true });

  if (!Array.isArray(value.tags) || value.tags.length < 1 || value.tags.length > 12) {
    throw new BlogAutomationError("unsafe_output", "Invalid enrichment tag count");
  }

  const seenKo = new Set<string>();
  const seenEn = new Set<string>();
  const seenSlugs = new Set<string>();

  value.tags.forEach((tag, index) => {
    validateTagPair(tag, index);
    const normalizedKo = tag.ko.toLocaleLowerCase("ko-KR");
    const normalizedEn = tag.en.toLocaleLowerCase("en-US");
    const slug = tagSlug(tag.en);

    if (!slug || seenKo.has(normalizedKo) || seenEn.has(normalizedEn) || seenSlugs.has(slug)) {
      throw new BlogAutomationError("unsafe_output", "Duplicate or unsafe enrichment tag");
    }

    seenKo.add(normalizedKo);
    seenEn.add(normalizedEn);
    seenSlugs.add(slug);
  });

  const sourceImageTargets = extractOwnedBlogBodyImagePaths(request.bodyKo, request.slug);
  const translatedImageTargets = extractOwnedBlogBodyImagePaths(value.bodyEn, request.slug);
  if (
    sourceImageTargets.length !== translatedImageTargets.length ||
    sourceImageTargets.some((path, index) => translatedImageTargets[index] !== path)
  ) {
    throw new BlogAutomationError("unsafe_output", "Body image paths changed during enrichment");
  }

  const sourceDestinations = extractMarkdownDestinations(request.bodyKo);
  const translatedDestinations = extractMarkdownDestinations(value.bodyEn);
  if (
    sourceDestinations.length !== translatedDestinations.length ||
    sourceDestinations.some(
      (destination, index) => translatedDestinations[index] !== destination
    )
  ) {
    throw new BlogAutomationError("unsafe_output", "Markdown destinations changed during enrichment");
  }

  return value as BlogEnrichmentOutput;
}
