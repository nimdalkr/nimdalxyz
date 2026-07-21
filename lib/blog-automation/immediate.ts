import type {
  BlogEditorCommitResult,
  BlogEditorCoverUpload,
  BlogPendingRequest
} from "@/lib/blog-editor/types";

import { buildPublishedBlogDocument } from "@/lib/blog-automation/document";
import {
  BlogAutomationError,
  type BlogEnrichmentFailureCode,
  type BlogEnrichmentOutput
} from "@/lib/blog-automation/types";

export type PendingBodyImageUpload = {
  path: string;
  upload: BlogEditorCoverUpload;
};

export type ImmediateBlogPublishingInput = {
  request: BlogPendingRequest;
  expectedHeadOid: string;
  bodyImages?: readonly PendingBodyImageUpload[];
};

export type ImmediatePublishingDependencies = {
  generate(request: BlogPendingRequest): Promise<BlogEnrichmentOutput>;
  publish(input: {
    request: BlogPendingRequest;
    document: ReturnType<typeof buildPublishedBlogDocument>;
    expectedHeadOid: string;
  }): Promise<BlogEditorCommitResult>;
  queue(input: {
    request: BlogPendingRequest;
    expectedHeadOid: string;
    bodyImages?: readonly PendingBodyImageUpload[];
  }): Promise<BlogEditorCommitResult>;
};

export function blogEnrichmentFailureCode(error: unknown): BlogEnrichmentFailureCode {
  return error instanceof BlogAutomationError ? error.code : "unexpected";
}

export async function queueAndPublishBlogRequestImmediately(
  input: ImmediateBlogPublishingInput,
  dependencies: ImmediatePublishingDependencies
) {
  const queuedCommit = await dependencies.queue({
    request: input.request,
    expectedHeadOid: input.expectedHeadOid,
    bodyImages: input.bodyImages
  });

  try {
    const enrichment = await dependencies.generate(input.request);
    const document = buildPublishedBlogDocument(input.request, enrichment);
    const publishedCommit = await dependencies.publish({
      request: input.request,
      document,
      expectedHeadOid: queuedCommit.oid
    });

    return {
      outcome: "published" as const,
      document,
      queuedCommit,
      publishedCommit
    };
  } catch (error) {
    return {
      outcome: "queued" as const,
      queuedCommit,
      failureCode: blogEnrichmentFailureCode(error),
      error
    };
  }
}
