import { timingSafeEqual } from "node:crypto";

import {
  getPendingBlogRequests,
  isBlogEditorConflictError,
  publishPendingBlogEnrichments,
  type BlogEditorPostDocument
} from "@/lib/blog-editor";
import {
  BlogAutomationError,
  buildPublishedBlogDocument,
  generateGeminiBlogEnrichment,
  getGeminiBlogEnrichmentConfig,
  selectDailyBlogEnrichmentBatch,
  shouldStopBlogEnrichmentBatch,
  type BlogEnrichmentFailure,
  type BlogEnrichmentFailureCode
} from "@/lib/blog-automation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store"
    }
  });
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorization);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function failureCode(error: unknown): BlogEnrichmentFailureCode {
  return error instanceof BlogAutomationError ? error.code : "unexpected";
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let snapshot: Awaited<ReturnType<typeof getPendingBlogRequests>>;
  try {
    snapshot = await getPendingBlogRequests();
  } catch {
    return json({ ok: false, error: "pending_queue_unavailable" }, 500);
  }

  const pending = selectDailyBlogEnrichmentBatch(snapshot.requests);
  if (pending.length === 0) {
    return json({ ok: true, processed: 0, published: 0, failed: [] });
  }

  try {
    getGeminiBlogEnrichmentConfig();
  } catch {
    return json({ ok: false, error: "enrichment_not_configured", processed: 0 }, 500);
  }

  const documents: BlogEditorPostDocument[] = [];
  const failures: BlogEnrichmentFailure[] = [];
  let processed = 0;

  for (const pendingRequest of pending) {
    processed += 1;
    try {
      const enrichment = await generateGeminiBlogEnrichment(pendingRequest);
      documents.push(buildPublishedBlogDocument(pendingRequest, enrichment));
    } catch (error) {
      const code = failureCode(error);
      failures.push({ slug: pendingRequest.slug, code });
      if (shouldStopBlogEnrichmentBatch(code)) {
        break;
      }
    }
  }

  if (documents.length === 0) {
    return json(
      {
        ok: false,
        processed,
        published: 0,
        failed: failures
      },
      502
    );
  }

  try {
    await publishPendingBlogEnrichments({
      documents,
      expectedHeadOid: snapshot.expectedHeadOid
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: "atomic_publish_failed",
        processed,
        published: 0,
        failed: failures
      },
      isBlogEditorConflictError(error) ? 409 : 500
    );
  }

  return json({
    ok: failures.length === 0,
    processed,
    published: documents.length,
    failed: failures
  });
}
