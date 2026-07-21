import "server-only";

import {
  publishQueuedBlogEnrichment,
  saveBlogPendingRequest
} from "@/lib/blog-editor/github";

import { generateGeminiBlogEnrichment } from "@/lib/blog-automation/gemini";
import {
  queueAndPublishBlogRequestImmediately,
  type ImmediateBlogPublishingInput
} from "@/lib/blog-automation/immediate";

export async function runImmediateBlogPublishing(input: ImmediateBlogPublishingInput) {
  return queueAndPublishBlogRequestImmediately(input, {
    generate: generateGeminiBlogEnrichment,
    publish: publishQueuedBlogEnrichment,
    queue: saveBlogPendingRequest
  });
}
