import type { BlogEditorPostDocument, BlogPendingRequest } from "@/lib/blog-editor/types";

export type BlogEnrichmentTagPair = {
  ko: string;
  en: string;
};

export type BlogEnrichmentOutput = {
  titleEn: string;
  bodyEn: string;
  summaryKo: string;
  summaryEn: string;
  categoryKo: string;
  categoryEn: string;
  tags: BlogEnrichmentTagPair[];
};

export type BlogReadingTimes = {
  ko: string;
  en: string;
};

export type BlogEnrichmentFailureCode =
  | "configuration"
  | "invalid_pending_request"
  | "request_timeout"
  | "upstream_rate_limit"
  | "upstream_unavailable"
  | "upstream_rejected"
  | "invalid_response"
  | "unsafe_output"
  | "unexpected";

export type BlogEnrichmentFailure = {
  slug: string;
  code: BlogEnrichmentFailureCode;
};

export type BlogEnrichmentSnapshot = {
  requests: BlogPendingRequest[];
  expectedHeadOid: string;
};

export type PublishBlogEnrichmentsInput = {
  documents: BlogEditorPostDocument[];
  expectedHeadOid: string;
};

export class BlogAutomationError extends Error {
  readonly code: BlogEnrichmentFailureCode;

  constructor(code: BlogEnrichmentFailureCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BlogAutomationError";
    this.code = code;
  }
}
