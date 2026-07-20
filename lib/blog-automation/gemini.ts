import type { BlogPendingRequest } from "@/lib/blog-editor/types";

import {
  BLOG_ENRICHMENT_JSON_SCHEMA,
  BLOG_ENRICHMENT_SYSTEM_INSTRUCTION,
  buildGeminiBlogEnrichmentPrompt
} from "@/lib/blog-automation/prompt";
import { BlogAutomationError, type BlogEnrichmentOutput } from "@/lib/blog-automation/types";
import { validateGeminiBlogEnrichmentOutput } from "@/lib/blog-automation/validation";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_MODEL_PATTERN = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const GEMINI_REQUEST_TIMEOUT_MS = 50_000;

type GeminiPart = {
  text?: unknown;
  thought?: unknown;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: unknown;
  }>;
  promptFeedback?: { blockReason?: unknown };
};

export function getGeminiBlogEnrichmentConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_BLOG_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  if (!apiKey || !GEMINI_MODEL_PATTERN.test(model)) {
    throw new BlogAutomationError("configuration", "Gemini blog enrichment is not configured");
  }

  return { apiKey, model };
}

function upstreamFailure(status: number) {
  if (status === 429) {
    return new BlogAutomationError("upstream_rate_limit", "Gemini rate limit reached");
  }

  if (status >= 500) {
    return new BlogAutomationError("upstream_unavailable", "Gemini is unavailable");
  }

  return new BlogAutomationError("upstream_rejected", "Gemini rejected the request");
}

function responseText(response: GeminiResponse) {
  if (response.promptFeedback?.blockReason) {
    throw new BlogAutomationError("invalid_response", "Gemini blocked the prompt");
  }

  const candidate = response.candidates?.[0];
  if (!candidate || candidate.finishReason !== "STOP") {
    throw new BlogAutomationError("invalid_response", "Gemini did not complete the response");
  }

  const text = candidate.content?.parts
    ?.filter((part) => part.thought !== true && typeof part.text === "string")
    .map((part) => part.text)
    .join("");

  if (!text) {
    throw new BlogAutomationError("invalid_response", "Gemini returned no structured output");
  }

  return text;
}

export async function generateGeminiBlogEnrichment(
  request: BlogPendingRequest
): Promise<BlogEnrichmentOutput> {
  const { apiKey, model } = getGeminiBlogEnrichmentConfig();
  const prompt = buildGeminiBlogEnrichmentPrompt(request);
  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: BLOG_ENRICHMENT_SYSTEM_INSTRUCTION }]
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
                mimeType: "application/json",
                schema: BLOG_ENRICHMENT_JSON_SCHEMA
              }
            }
          }
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS)
      }
    );
  } catch (error) {
    if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
      throw new BlogAutomationError("request_timeout", "Gemini request timed out", {
        cause: error
      });
    }

    throw new BlogAutomationError("upstream_unavailable", "Gemini request failed", {
      cause: error
    });
  }

  if (!response.ok) {
    throw upstreamFailure(response.status);
  }

  let payload: GeminiResponse;
  try {
    payload = (await response.json()) as GeminiResponse;
  } catch (error) {
    throw new BlogAutomationError("invalid_response", "Gemini returned invalid JSON", {
      cause: error
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText(payload));
  } catch (error) {
    if (error instanceof BlogAutomationError) {
      throw error;
    }

    throw new BlogAutomationError("invalid_response", "Gemini output was not JSON", {
      cause: error
    });
  }

  return validateGeminiBlogEnrichmentOutput(parsed, request);
}
