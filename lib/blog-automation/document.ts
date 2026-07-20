import type { BlogEditorPostDocument, BlogPendingRequest } from "@/lib/blog-editor/types";
import { validateBlogPostDocument } from "@/lib/blog-editor/validation";

import { calculateBlogReadingTimes } from "@/lib/blog-automation/reading-time";
import type { BlogEnrichmentOutput } from "@/lib/blog-automation/types";
import { validateGeminiBlogEnrichmentOutput } from "@/lib/blog-automation/validation";

export function buildPublishedBlogDocument(
  request: BlogPendingRequest,
  output: BlogEnrichmentOutput
): BlogEditorPostDocument {
  const enrichment = validateGeminiBlogEnrichmentOutput(output, request);
  const readingTime = calculateBlogReadingTimes(request.bodyKo, enrichment.bodyEn);
  const document: BlogEditorPostDocument = {
    slug: request.slug,
    status: "published",
    publishedAt: request.publishedAt,
    updatedAt: request.updatedAt,
    cover: request.cover,
    coverWidth: request.coverWidth,
    coverHeight: request.coverHeight,
    ko: {
      title: request.titleKo,
      description: enrichment.summaryKo,
      category: enrichment.categoryKo,
      tags: enrichment.tags.map(({ ko }) => ko),
      readingTime: readingTime.ko
    },
    en: {
      title: enrichment.titleEn,
      description: enrichment.summaryEn,
      category: enrichment.categoryEn,
      tags: enrichment.tags.map(({ en }) => en),
      readingTime: readingTime.en
    },
    bodyKo: request.bodyKo,
    bodyEn: enrichment.bodyEn
  };

  return validateBlogPostDocument(document);
}
