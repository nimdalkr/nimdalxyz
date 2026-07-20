"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import {
  assertValidBlogSlug,
  BlogEditorConflictError,
  BlogEditorValidationError,
  deleteBlogPostFromGitHub,
  readBlogPostDocument,
  saveBlogPostToGitHub,
  type BlogEditorPostDocument
} from "@/lib/blog-editor";

export type EditorActionState = {
  status: "idle" | "error" | "success";
  message: string;
  field?: string;
};

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formMarkdown(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : "";
}

function formInteger(formData: FormData, name: string) {
  const value = Number.parseInt(formString(formData, name), 10);
  return Number.isSafeInteger(value) ? value : 0;
}

function formTags(formData: FormData, name: string) {
  return formString(formData, name)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
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

function editorDocumentFromForm(formData: FormData): BlogEditorPostDocument {
  const statusValue = formString(formData, "status");

  if (statusValue !== "published") {
    throw new BlogEditorValidationError([
      { field: "status", message: "사이트 편집기에서는 공개 글만 저장할 수 있습니다." }
    ]);
  }

  return {
    slug: formString(formData, "slug"),
    status: "published",
    publishedAt: formString(formData, "publishedAt"),
    updatedAt: formString(formData, "updatedAt"),
    cover: formString(formData, "cover"),
    coverWidth: formInteger(formData, "coverWidth"),
    coverHeight: formInteger(formData, "coverHeight"),
    ko: {
      title: formString(formData, "koTitle"),
      description: formString(formData, "koDescription"),
      category: formString(formData, "koCategory"),
      tags: formTags(formData, "koTags"),
      readingTime: formString(formData, "koReadingTime")
    },
    en: {
      title: formString(formData, "enTitle"),
      description: formString(formData, "enDescription"),
      category: formString(formData, "enCategory"),
      tags: formTags(formData, "enTags"),
      readingTime: formString(formData, "enReadingTime")
    },
    bodyKo: formMarkdown(formData, "bodyKo"),
    bodyEn: formMarkdown(formData, "bodyEn")
  };
}

const editorFieldLabels: Record<string, string> = {
  slug: "URL 주소",
  status: "공개 상태",
  publishedAt: "발행일",
  updatedAt: "수정일",
  coverImage: "대표 이미지 파일",
  cover: "대표 이미지 경로",
  coverWidth: "대표 이미지 너비",
  coverHeight: "대표 이미지 높이",
  "ko.title": "한국어 제목",
  "ko.description": "한국어 요약",
  "ko.category": "한국어 카테고리",
  "ko.readingTime": "한국어 읽는 시간",
  "ko.tags": "한국어 태그",
  "en.title": "영문 제목",
  "en.description": "영문 요약",
  "en.category": "영문 카테고리",
  "en.readingTime": "영문 읽는 시간",
  "en.tags": "영문 태그",
  tags: "태그",
  bodyKo: "한국어 본문",
  bodyEn: "영문 본문"
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

    if (!issue) {
      return { message: error.message };
    }

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

export async function savePostAction(
  _previousState: EditorActionState,
  formData: FormData
): Promise<EditorActionState> {
  await requireWriterMutation();

  try {
    const mode = formString(formData, "mode");
    const originalSlug = formString(formData, "originalSlug");
    const document = editorDocumentFromForm(formData);
    const expectedHeadOid = formString(formData, "expectedHeadOid");

    if (mode === "edit") {
      assertValidBlogSlug(originalSlug);
      document.slug = originalSlug;

      if (!(await readBlogPostDocument(originalSlug))) {
        return { status: "error", message: "수정할 글을 찾을 수 없습니다." };
      }
    } else if (await readBlogPostDocument(document.slug)) {
      return { status: "error", message: "같은 주소를 사용 중인 글이 있습니다." };
    }

    const file = formData.get("coverImage");
    const coverImage = file instanceof File && file.size > 0 ? file : undefined;

    await saveBlogPostToGitHub({ document, expectedHeadOid, coverImage });

    revalidatePath("/write");
    revalidatePath("/ko/blog");
    revalidatePath("/en/blog");
    revalidatePath(`/ko/posts/${document.slug}`);
    revalidatePath(`/en/posts/${document.slug}`);
    if (process.env.NODE_ENV !== "production") {
      redirect(`/write/edit/${document.slug}?saved=1`);
    }

    return {
      status: "success",
      message: "발행 커밋을 저장했습니다. 새 배포가 끝나면 공개 글에 반영됩니다."
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

  await deleteBlogPostFromGitHub({ slug, expectedHeadOid });
  revalidatePath("/write");
  revalidatePath("/ko/blog");
  revalidatePath("/en/blog");
  redirect("/write?deleted=1");
}
