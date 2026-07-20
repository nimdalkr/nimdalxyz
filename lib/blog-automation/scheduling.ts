import type { BlogEnrichmentFailureCode } from "@/lib/blog-automation/types";

export const BLOG_ENRICHMENT_MAX_REQUESTS_PER_RUN = 4;
export const BLOG_ENRICHMENT_MS_PER_DAY = 86_400_000;

type QueuedBlogRequest = {
  slug: string;
  queuedAt: string;
};

function oldestFirst<T extends QueuedBlogRequest>(requests: readonly T[]) {
  return [...requests].sort(
    (left, right) => left.queuedAt.localeCompare(right.queuedAt) || left.slug.localeCompare(right.slug)
  );
}

export function selectDailyBlogEnrichmentBatch<T extends QueuedBlogRequest>(
  requests: readonly T[],
  now = Date.now()
) {
  const ordered = oldestFirst(requests);
  if (ordered.length <= BLOG_ENRICHMENT_MAX_REQUESTS_PER_RUN) return ordered;

  const day = Math.floor(now / BLOG_ENRICHMENT_MS_PER_DAY);
  const offset = (day * BLOG_ENRICHMENT_MAX_REQUESTS_PER_RUN) % ordered.length;

  return Array.from(
    { length: BLOG_ENRICHMENT_MAX_REQUESTS_PER_RUN },
    (_, index) => ordered[(offset + index) % ordered.length]
  );
}

export function shouldStopBlogEnrichmentBatch(code: BlogEnrichmentFailureCode) {
  return (
    code === "request_timeout" ||
    code === "upstream_rate_limit" ||
    code === "upstream_unavailable"
  );
}
