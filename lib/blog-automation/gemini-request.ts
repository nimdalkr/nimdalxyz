import { BLOG_ENRICHMENT_JSON_SCHEMA } from "@/lib/blog-automation/prompt";
import type { BlogEnrichmentFailureCode } from "@/lib/blog-automation/types";

export const GEMINI_JSON_MIME_TYPE = "APPLICATION_JSON" as const;

export function buildGeminiGenerateContentBody(
  systemInstruction: string,
  prompt: string
) {
  return {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      candidateCount: 1,
      maxOutputTokens: 65_536,
      responseFormat: {
        text: {
          // The v1beta REST field is an enum, not a literal MIME string.
          mimeType: GEMINI_JSON_MIME_TYPE,
          schema: BLOG_ENRICHMENT_JSON_SCHEMA
        }
      }
    }
  };
}

export function classifyGeminiUpstreamFailure(
  status: number
): BlogEnrichmentFailureCode {
  if (status === 401 || status === 403 || status === 404) {
    return "configuration";
  }

  if (status === 429) {
    return "upstream_rate_limit";
  }

  if (status >= 500) {
    return "upstream_unavailable";
  }

  return "upstream_rejected";
}
