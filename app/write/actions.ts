"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import { runImmediateBlogPublishing } from "@/lib/blog-automation/immediate-server";
import type { BlogEnrichmentFailureCode } from "@/lib/blog-automation/types";
import {
  assertValidBlogSlug,
  BLOG_ATTACHMENT_ID_PATTERN,
  BlogEditorConflictError,
  BlogEditorValidationError,
  deleteBlogPostFromGitHub,
  MAX_BLOG_BODY_IMAGES,
  readBlogPendingRequest,
  readBlogPostDocument,
  validateBlogBodyImageUploads,
  type BlogEditorCoverImage,
  type BlogPendingBodyImage,
  type BlogPendingRequest
} from "@/lib/blog-editor";

export type EditorActionState = {
  status: "idle" | "error" | "queued" | "success";
  message: string;
  field?: string;
};

type AttachmentManifestEntry = {
  id: string;
  alt: string;
  width: number;
  height: number;
};

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formMarkdown(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : "";
}

async function requireWriterMutation() {
  const access = await getWriterAccess();

  if (access.status === "configuration-required" || access.status === "signed-out") {
    redirect("/write/login");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  return access.session;
}

function parseAttachmentManifest(formData: FormData) {
  const source = formString(formData, "attachmentsManifest");
  if (!source) return [];
  if (source.length > 12_000) {
    throw new BlogEditorValidationError([
      { field: "bodyImages", message: "이미지 정보가 너무 큽니다." }
    ]);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new BlogEditorValidationError([
      { field: "bodyImages", message: "이미지 정보를 읽지 못했습니다." }
    ]);
  }

  if (!Array.isArray(parsed)) {
    throw new BlogEditorValidationError([
      { field: "bodyImages", message: "이미지 목록이 올바르지 않습니다." }
    ]);
  }

  if (parsed.length > MAX_BLOG_BODY_IMAGES) {
    throw new BlogEditorValidationError([
      {
        field: "bodyImages",
        message: `본문 이미지는 최대 ${MAX_BLOG_BODY_IMAGES}개까지 올릴 수 있습니다.`
      }
    ]);
  }

  const seen = new Set<string>();
  return parsed.map((value, index) => {
    const candidate = value as Partial<AttachmentManifestEntry>;
    const field = `bodyImages.${index}`;
    if (
      !candidate ||
      typeof candidate !== "object" ||
      typeof candidate.id !== "string" ||
      !BLOG_ATTACHMENT_ID_PATTERN.test(candidate.id) ||
      seen.has(candidate.id) ||
      typeof candidate.alt !== "string" ||
      candidate.alt.trim().length === 0 ||
      candidate.alt.length > 180 ||
      /[\]\r\n]/.test(candidate.alt) ||
      !Number.isSafeInteger(candidate.width) ||
      !Number.isSafeInteger(candidate.height) ||
      (candidate.width ?? 0) < 1 ||
      (candidate.width ?? 0) > 20_000 ||
      (candidate.height ?? 0) < 1 ||
      (candidate.height ?? 0) > 20_000
    ) {
      throw new BlogEditorValidationError([
        { field, message: "이미지 정보가 올바르지 않습니다." }
      ]);
    }
    seen.add(candidate.id);
    return {
      id: candidate.id,
      alt: candidate.alt.trim(),
      width: candidate.width,
      height: candidate.height
    } as AttachmentManifestEntry;
  });
}

async function prepareNewBodyImages(formData: FormData, bodyKo: string, slug: string) {
  const manifest = parseAttachmentManifest(formData);
  const files = formData
    .getAll("bodyImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const filesById = new Map<string, File>();

  for (const file of files) {
    const id = file.name.split("--", 1)[0] ?? "";
    if (!BLOG_ATTACHMENT_ID_PATTERN.test(id) || filesById.has(id)) {
      throw new BlogEditorValidationError([
        { field: "bodyImages", message: "이미지 파일 이름이 올바르지 않습니다." }
      ]);
    }
    filesById.set(id, file);
  }

  const manifestById = new Map(manifest.map((entry) => [entry.id, entry]));
  for (const id of filesById.keys()) {
    if (!manifestById.has(id)) {
      throw new BlogEditorValidationError([
        { field: "bodyImages", message: "선택한 이미지 정보가 누락되었습니다." }
      ]);
    }
  }

  const placeholderIds = [...bodyKo.matchAll(/\]\(attachment:([a-z0-9]{8,64})\)/g)].map(
    (match) => match[1] ?? ""
  );
  const usedIds = [...new Set(placeholderIds)];
  const images: BlogEditorCoverImage[] = [];
  const usedManifest: AttachmentManifestEntry[] = [];

  for (const id of usedIds) {
    const file = filesById.get(id);
    const entry = manifestById.get(id);
    if (!file || !entry) {
      throw new BlogEditorValidationError([
        { field: "bodyImages", message: "본문 이미지 파일을 다시 선택해 주세요." }
      ]);
    }
    images.push({
      bytes: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
      mimeType: file.type
    });
    usedManifest.push(entry);
  }

  const validated = validateBlogBodyImageUploads(images);
  const pendingImages: BlogPendingBodyImage[] = [];
  const uploads: { path: string; upload: BlogEditorCoverImage }[] = [];
  let resolvedBody = bodyKo;

  validated.forEach((image, index) => {
    const entry = usedManifest[index];
    if (!entry) return;
    const imagePath = `/media/blog/${slug}/body-${entry.id}.${image.extension}`;
    resolvedBody = resolvedBody.replaceAll(`attachment:${entry.id}`, imagePath);
    pendingImages.push({
      id: entry.id,
      path: imagePath,
      alt: entry.alt,
      width: entry.width,
      height: entry.height
    });
    uploads.push({ path: imagePath, upload: image });
  });

  if (/\]\(attachment:[^)]+\)/.test(resolvedBody)) {
    throw new BlogEditorValidationError([
      { field: "bodyImages", message: "본문 이미지 파일을 다시 선택해 주세요." }
    ]);
  }

  return { bodyKo: resolvedBody, pendingImages, uploads };
}

async function createAvailableSlug() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = `note-${date}-${randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const [post, pending] = await Promise.all([
      readBlogPostDocument(slug),
      readBlogPendingRequest(slug)
    ]);
    if (!post && !pending) return slug;
  }

  throw new Error("새 글 주소를 만들지 못했습니다. 다시 저장해 주세요.");
}

const editorFieldLabels: Record<string, string> = {
  titleKo: "제목",
  bodyKo: "본문",
  bodyImages: "본문 이미지",
  slug: "글 주소"
};

function editorFieldLabel(field: string) {
  const normalized = field.replace(/\.\d+$/, "");
  return editorFieldLabels[normalized] ?? field;
}

function humanizeEditorError(error: unknown): Pick<EditorActionState, "message" | "field"> {
  if (error instanceof BlogEditorConflictError) {
    return { message: error.message };
  }

  if (error instanceof BlogEditorValidationError) {
    const issue = error.issues[0];
    if (!issue) return { message: error.message };
    const remaining = error.issues.length - 1;
    return {
      field: issue.field,
      message: `${editorFieldLabel(issue.field)}: ${issue.message}${remaining > 0 ? ` (외 ${remaining}건)` : ""}`
    };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  return { message: "저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요." };
}

function queuedProcessingMessage(code: BlogEnrichmentFailureCode) {
  if (code === "configuration") {
    return "원문은 저장했습니다. 새 배포가 끝난 뒤 Gemini 설정을 확인하고 다시 처리해 주세요.";
  }

  if (code === "upstream_rate_limit") {
    return "원문은 저장했습니다. 새 배포가 끝나고 Gemini 사용량 제한이 풀리면 다시 처리해 주세요.";
  }

  if (code === "request_timeout" || code === "upstream_unavailable") {
    return "원문은 저장했습니다. Gemini 응답이 지연되어 공개하지 못했습니다. 새 배포 후 다시 처리해 주세요.";
  }

  if (code === "upstream_rejected") {
    return "원문은 저장했습니다. Gemini 요청이 거절되었습니다. 새 배포 후 다시 처리해 주세요.";
  }

  if (code === "invalid_response" || code === "unsafe_output") {
    return "원문은 저장했습니다. 생성 결과를 검증하지 못했습니다. 새 배포 후 내용을 확인하고 다시 처리해 주세요.";
  }

  return "원문은 저장했습니다. 공개 처리 중 문제가 발생했습니다. 새 배포 후 다시 처리해 주세요.";
}

export async function savePostAction(
  _previousState: EditorActionState,
  formData: FormData
): Promise<EditorActionState> {
  await requireWriterMutation();

  try {
    const mode = formString(formData, "mode");
    const originalSlug = formString(formData, "originalSlug");
    const expectedHeadOid = formString(formData, "expectedHeadOid");
    const slug = mode === "edit" ? assertValidBlogSlug(originalSlug) : await createAvailableSlug();
    const [publishedDocument, pendingRequest] = await Promise.all([
      readBlogPostDocument(slug),
      readBlogPendingRequest(slug)
    ]);

    if (mode === "edit" && !publishedDocument && !pendingRequest) {
      return { status: "error", message: "수정할 글을 찾을 수 없습니다." };
    }

    const titleKo = formString(formData, "koTitle");
    const rawBodyKo = formMarkdown(formData, "bodyKo");
    const prepared = await prepareNewBodyImages(formData, rawBodyKo, slug);
    const retainedImages = (pendingRequest?.bodyImages ?? []).filter((image) =>
      prepared.bodyKo.includes(`](${image.path})`)
    );
    const bodyImages = [...retainedImages, ...prepared.pendingImages];
    const today = new Date().toISOString().slice(0, 10);
    let cover = pendingRequest?.cover ?? publishedDocument?.cover ?? "/media/identity-octopus.jpg";
    let coverWidth = pendingRequest?.coverWidth ?? publishedDocument?.coverWidth ?? 400;
    let coverHeight = pendingRequest?.coverHeight ?? publishedDocument?.coverHeight ?? 400;

    if (!publishedDocument && bodyImages[0]) {
      cover = bodyImages[0].path;
      coverWidth = bodyImages[0].width;
      coverHeight = bodyImages[0].height;
    } else if (
      cover.startsWith(`/media/blog/${slug}/body-`) &&
      !bodyImages.some((image) => image.path === cover)
    ) {
      const fallback = bodyImages[0];
      cover = publishedDocument?.cover ?? fallback?.path ?? "/media/identity-octopus.jpg";
      coverWidth = publishedDocument?.coverWidth ?? fallback?.width ?? 400;
      coverHeight = publishedDocument?.coverHeight ?? fallback?.height ?? 400;
    }

    const request: BlogPendingRequest = {
      slug,
      queuedAt: new Date().toISOString(),
      publishedAt: pendingRequest?.publishedAt ?? publishedDocument?.publishedAt ?? today,
      updatedAt: today,
      cover,
      coverWidth,
      coverHeight,
      titleKo,
      bodyKo: prepared.bodyKo,
      bodyImages
    };

    const publishing = await runImmediateBlogPublishing({
      request,
      expectedHeadOid,
      bodyImages: prepared.uploads
    });

    revalidatePath("/write");

    if (publishing.outcome === "queued") {
      console.error("[blog-editor] immediate publishing deferred", {
        slug,
        failureCode: publishing.failureCode,
        queuedCommitOid: publishing.queuedCommit.oid,
        errorName: publishing.error instanceof Error ? publishing.error.name : undefined,
        errorMessage:
          publishing.error instanceof Error
            ? publishing.error.message.replace(/[\r\n]+/g, " ").slice(0, 500)
            : undefined
      });

      return {
        status: "queued",
        message: queuedProcessingMessage(publishing.failureCode)
      };
    }

    console.info("[blog-editor] immediate publishing committed", {
      slug,
      publishedCommitOid: publishing.publishedCommit.oid
    });
    revalidatePath("/ko/blog");
    revalidatePath("/en/blog");
    revalidatePath(`/ko/posts/${slug}`);
    revalidatePath(`/en/posts/${slug}`);

    if (process.env.NODE_ENV !== "production") {
      redirect(`/write/edit/${slug}?saved=1`);
    }

    return {
      status: "success",
      message: "번역과 분류를 마쳤습니다. 새 배포가 끝나면 한국어·영어 글이 함께 공개됩니다."
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return { status: "error", ...humanizeEditorError(error) };
  }
}

export async function deletePostAction(formData: FormData) {
  await requireWriterMutation();

  const slug = formString(formData, "slug");
  const expectedHeadOid = formString(formData, "expectedHeadOid");
  assertValidBlogSlug(slug);

  try {
    await deleteBlogPostFromGitHub({ slug, expectedHeadOid });
  } catch (error) {
    const reason = error instanceof BlogEditorConflictError ? "conflict" : "failed";
    redirect(`/write/edit/${slug}?deleteError=${reason}`);
  }

  revalidatePath("/write");
  revalidatePath("/ko/blog");
  revalidatePath("/en/blog");
  redirect("/write?deleted=1");
}
