import {
  blogPostStatuses,
  type BlogEditorCoverImage,
  type BlogEditorCoverUpload,
  type BlogEditorLocalizedContent,
  type BlogPendingRequest,
  type BlogEditorPostDocument,
  type ValidatedBlogCoverImage
} from "@/lib/blog-editor/types";
import { tagSlug } from "@/lib/seo";

export const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_BLOG_SLUG_LENGTH = 120;
export const MAX_BLOG_BODY_LENGTH = 200_000;
export const MAX_BLOG_COVER_BYTES = 2 * 1024 * 1024;
export const MAX_BLOG_BODY_IMAGES = 8;
export const MAX_BLOG_BODY_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_BLOG_BODY_IMAGES_TOTAL_BYTES = 2 * 1024 * 1024;
export const BLOG_ATTACHMENT_ID_PATTERN = /^[a-z0-9]{8,64}$/;

type ValidationIssue = {
  field: string;
  message: string;
};

const imageExtensions = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

export class BlogEditorValidationError extends Error {
  readonly issues: readonly ValidationIssue[];

  constructor(issues: readonly ValidationIssue[]) {
    super(issues.map(({ field, message }) => `${field}: ${message}`).join("\n"));
    this.name = "BlogEditorValidationError";
    this.issues = issues;
  }
}

function hasImageSignature(bytes: Uint8Array, mimeType: keyof typeof imageExtensions) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  const header = String.fromCharCode(...bytes.slice(0, 6));
  return header === "GIF87a" || header === "GIF89a";
}

function isExactIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isIsoTimestamp(value: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value;
}

function hasControlCharacters(value: string) {
  return /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function validateText(
  issues: ValidationIssue[],
  field: string,
  value: string,
  options: { max: number; required: boolean }
) {
  if (typeof value !== "string") {
    issues.push({ field, message: "문자열이어야 합니다." });
    return;
  }

  if (options.required && value.trim().length === 0) {
    issues.push({ field, message: "값을 입력해 주세요." });
  }

  if (value.length > options.max) {
    issues.push({ field, message: `${options.max}자 이하여야 합니다.` });
  }

  if (hasControlCharacters(value)) {
    issues.push({ field, message: "제어 문자를 포함할 수 없습니다." });
  }
}

function validateLocalizedContent(
  issues: ValidationIssue[],
  field: "ko" | "en",
  content: BlogEditorLocalizedContent,
  required: boolean
) {
  if (!content || typeof content !== "object") {
    issues.push({ field, message: "언어별 메타데이터가 필요합니다." });
    return;
  }

  validateText(issues, `${field}.title`, content.title, { max: 140, required });
  validateText(issues, `${field}.description`, content.description, {
    max: 320,
    required
  });
  validateText(issues, `${field}.category`, content.category, { max: 80, required });
  validateText(issues, `${field}.readingTime`, content.readingTime, {
    max: 40,
    required
  });

  if (!Array.isArray(content.tags)) {
    issues.push({ field: `${field}.tags`, message: "태그 목록이 필요합니다." });
    return;
  }

  if (required && content.tags.length === 0) {
    issues.push({ field: `${field}.tags`, message: "공개 글에는 태그가 하나 이상 필요합니다." });
  }

  if (content.tags.length > 12) {
    issues.push({ field: `${field}.tags`, message: "태그는 최대 12개까지 입력할 수 있습니다." });
  }

  const seen = new Set<string>();
  const seenSlugs = new Set<string>();
  content.tags.forEach((tag, index) => {
    validateText(issues, `${field}.tags.${index}`, tag, { max: 64, required: true });
    const normalized = tag.trim().toLocaleLowerCase("en-US");

    if (seen.has(normalized)) {
      issues.push({ field: `${field}.tags.${index}`, message: "중복 태그입니다." });
    }

    seen.add(normalized);

    if (field === "en") {
      const slug = tagSlug(tag);

      if (!slug) {
        issues.push({
          field: `${field}.tags.${index}`,
          message: "URL에 사용할 영문 또는 숫자가 포함된 태그여야 합니다."
        });
      } else if (seenSlugs.has(slug)) {
        issues.push({
          field: `${field}.tags.${index}`,
          message: "다른 영문 태그와 같은 URL이 만들어집니다."
        });
      }

      seenSlugs.add(slug);
    }
  });
}

export function assertValidBlogSlug(value: string) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_BLOG_SLUG_LENGTH ||
    !BLOG_SLUG_PATTERN.test(value)
  ) {
    throw new BlogEditorValidationError([
      {
        field: "slug",
        message: `영문 소문자, 숫자, 하이픈만 사용해 ${MAX_BLOG_SLUG_LENGTH}자 이내로 입력해 주세요.`
      }
    ]);
  }

  return value;
}

export function blogOwnedCoverPath(slug: string, cover: string) {
  assertValidBlogSlug(slug);
  const prefix = `/media/blog/${slug}/`;

  if (
    typeof cover === "string" &&
    cover.startsWith(prefix) &&
    !cover.includes("..") &&
    !cover.includes("//") &&
    /^\/media\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:gif|jpe?g|png|webp)$/i.test(
      cover
    )
  ) {
    return cover;
  }

  return undefined;
}

export function validateBlogPostDocument(document: BlogEditorPostDocument) {
  const issues: ValidationIssue[] = [];

  try {
    assertValidBlogSlug(document.slug);
  } catch (error) {
    if (error instanceof BlogEditorValidationError) {
      issues.push(...error.issues);
    } else {
      throw error;
    }
  }

  if (!blogPostStatuses.includes(document.status)) {
    issues.push({ field: "status", message: "draft 또는 published여야 합니다." });
  }

  for (const field of ["publishedAt", "updatedAt"] as const) {
    if (!isExactIsoDate(document[field])) {
      issues.push({ field, message: "YYYY-MM-DD 형식의 유효한 날짜여야 합니다." });
    }
  }

  if (
    isExactIsoDate(document.publishedAt) &&
    isExactIsoDate(document.updatedAt) &&
    document.updatedAt < document.publishedAt
  ) {
    issues.push({ field: "updatedAt", message: "발행일보다 빠를 수 없습니다." });
  }

  if (
    typeof document.cover !== "string" ||
    document.cover.length > 240 ||
    !/^\/media\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:gif|jpe?g|png|webp)$/i.test(document.cover) ||
    document.cover.includes("..") ||
    document.cover.includes("//")
  ) {
    issues.push({ field: "cover", message: "public/media 아래의 안전한 이미지 경로여야 합니다." });
  }

  for (const field of ["coverWidth", "coverHeight"] as const) {
    if (!Number.isSafeInteger(document[field]) || document[field] < 1 || document[field] > 20_000) {
      issues.push({ field, message: "1~20,000 사이의 정수여야 합니다." });
    }
  }

  const isPublished = document.status === "published";
  validateLocalizedContent(issues, "ko", document.ko, isPublished);
  validateLocalizedContent(issues, "en", document.en, isPublished);

  if (document.ko?.tags?.length !== document.en?.tags?.length) {
    issues.push({ field: "tags", message: "한국어와 영어 태그 수를 맞춰 주세요." });
  }

  validateText(issues, "bodyKo", document.bodyKo, {
    max: MAX_BLOG_BODY_LENGTH,
    required: isPublished
  });
  validateText(issues, "bodyEn", document.bodyEn, {
    max: MAX_BLOG_BODY_LENGTH,
    required: isPublished
  });

  if (issues.length > 0) {
    throw new BlogEditorValidationError(issues);
  }

  return document;
}

export function validateBlogPendingRequest(request: BlogPendingRequest) {
  const issues: ValidationIssue[] = [];

  try {
    assertValidBlogSlug(request.slug);
  } catch (error) {
    if (error instanceof BlogEditorValidationError) {
      issues.push(...error.issues);
    } else {
      throw error;
    }
  }

  if (!isIsoTimestamp(request.queuedAt)) {
    issues.push({ field: "queuedAt", message: "유효한 ISO 시각이어야 합니다." });
  }

  for (const field of ["publishedAt", "updatedAt"] as const) {
    if (!isExactIsoDate(request[field])) {
      issues.push({ field, message: "YYYY-MM-DD 형식의 유효한 날짜여야 합니다." });
    }
  }

  if (
    isExactIsoDate(request.publishedAt) &&
    isExactIsoDate(request.updatedAt) &&
    request.updatedAt < request.publishedAt
  ) {
    issues.push({ field: "updatedAt", message: "발행일보다 빠를 수 없습니다." });
  }

  if (
    typeof request.cover !== "string" ||
    request.cover.length > 240 ||
    !/^\/media\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(?:gif|jpe?g|png|webp)$/i.test(request.cover) ||
    request.cover.includes("..") ||
    request.cover.includes("//")
  ) {
    issues.push({ field: "cover", message: "public/media 아래의 안전한 이미지 경로여야 합니다." });
  }

  for (const field of ["coverWidth", "coverHeight"] as const) {
    if (!Number.isSafeInteger(request[field]) || request[field] < 1 || request[field] > 20_000) {
      issues.push({ field, message: "1~20,000 사이의 정수여야 합니다." });
    }
  }

  validateText(issues, "titleKo", request.titleKo, { max: 140, required: true });
  validateText(issues, "bodyKo", request.bodyKo, {
    max: MAX_BLOG_BODY_LENGTH,
    required: true
  });

  if (!Array.isArray(request.bodyImages)) {
    issues.push({ field: "bodyImages", message: "본문 이미지 목록이 필요합니다." });
  } else {
    if (request.bodyImages.length > MAX_BLOG_BODY_IMAGES) {
      issues.push({
        field: "bodyImages",
        message: `본문 이미지는 최대 ${MAX_BLOG_BODY_IMAGES}개까지 올릴 수 있습니다.`
      });
    }

    const ids = new Set<string>();
    const paths = new Set<string>();
    for (const [index, image] of request.bodyImages.entries()) {
      const field = `bodyImages.${index}`;
      if (!image || typeof image !== "object") {
        issues.push({ field, message: "이미지 정보가 올바르지 않습니다." });
        continue;
      }

      if (!BLOG_ATTACHMENT_ID_PATTERN.test(image.id)) {
        issues.push({ field: `${field}.id`, message: "이미지 ID가 올바르지 않습니다." });
      } else if (ids.has(image.id)) {
        issues.push({ field: `${field}.id`, message: "중복 이미지 ID입니다." });
      }
      ids.add(image.id);

      const expectedPrefix = `/media/blog/${request.slug}/body-${image.id}.`;
      if (
        typeof image.path !== "string" ||
        !image.path.startsWith(expectedPrefix) ||
        !/\.(?:gif|jpe?g|png|webp)$/i.test(image.path) ||
        image.path.includes("..") ||
        image.path.includes("//")
      ) {
        issues.push({ field: `${field}.path`, message: "본문 이미지 경로가 올바르지 않습니다." });
      } else if (paths.has(image.path)) {
        issues.push({ field: `${field}.path`, message: "중복 이미지 경로입니다." });
      }
      paths.add(image.path);

      validateText(issues, `${field}.alt`, image.alt, { max: 180, required: true });
      if (typeof image.alt === "string" && /[\]\r\n]/.test(image.alt)) {
        issues.push({ field: `${field}.alt`, message: "이미지 설명에 줄바꿈이나 ]를 넣을 수 없습니다." });
      }
      for (const dimension of ["width", "height"] as const) {
        if (!Number.isSafeInteger(image[dimension]) || image[dimension] < 1 || image[dimension] > 20_000) {
          issues.push({ field: `${field}.${dimension}`, message: "1~20,000 사이의 정수여야 합니다." });
        }
      }

      if (typeof image.path === "string" && !request.bodyKo.includes(`](${image.path})`)) {
        issues.push({ field: `${field}.path`, message: "본문에서 사용 중인 이미지만 저장할 수 있습니다." });
      }
    }
  }

  if (/\]\(attachment:[^)]+\)/.test(request.bodyKo)) {
    issues.push({ field: "bodyKo", message: "업로드되지 않은 이미지가 본문에 남아 있습니다." });
  }

  if (issues.length > 0) {
    throw new BlogEditorValidationError(issues);
  }

  return request;
}

export function validateBlogCoverImage(image: BlogEditorCoverImage): ValidatedBlogCoverImage {
  const mimeType = image.mimeType.toLowerCase() as keyof typeof imageExtensions;
  const extension = imageExtensions[mimeType];
  const issues: ValidationIssue[] = [];

  if (!extension) {
    issues.push({
      field: "coverImage",
      message: "JPEG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다."
    });
  }

  if (!(image.bytes instanceof Uint8Array) || image.bytes.length === 0) {
    issues.push({ field: "coverImage", message: "비어 있는 파일은 업로드할 수 없습니다." });
  } else if (image.bytes.length > MAX_BLOG_COVER_BYTES) {
    issues.push({ field: "coverImage", message: "이미지는 2MB 이하여야 합니다." });
  }

  if (extension && image.bytes.length > 0 && !hasImageSignature(image.bytes, mimeType)) {
    issues.push({ field: "coverImage", message: "파일 내용과 이미지 형식이 일치하지 않습니다." });
  }

  if (typeof image.fileName !== "string" || image.fileName.length === 0 || image.fileName.length > 180) {
    issues.push({ field: "coverImage", message: "유효한 파일 이름이 필요합니다." });
  }

  if (issues.length > 0 || !extension) {
    throw new BlogEditorValidationError(issues);
  }

  return { ...image, mimeType, extension };
}

export function validateBlogBodyImage(image: BlogEditorCoverImage): ValidatedBlogCoverImage {
  if (image.mimeType.toLowerCase() === "image/gif") {
    throw new BlogEditorValidationError([
      {
        field: "bodyImages",
        message: "움직이는 GIF는 본문에 올릴 수 없습니다. JPG, PNG, WebP를 사용해 주세요."
      }
    ]);
  }

  try {
    return validateBlogCoverImage(image);
  } catch (error) {
    if (error instanceof BlogEditorValidationError) {
      throw new BlogEditorValidationError(
        error.issues.map((issue) => ({
          ...issue,
          field: issue.field === "coverImage" ? "bodyImages" : issue.field,
          message: issue.message.replace("이미지는 2MB", "본문 이미지는 2MB")
        }))
      );
    }

    throw error;
  }
}

export function validateBlogBodyImageUploads(
  images: readonly BlogEditorCoverImage[]
): ValidatedBlogCoverImage[] {
  const issues: ValidationIssue[] = [];

  if (images.length > MAX_BLOG_BODY_IMAGES) {
    issues.push({
      field: "bodyImages",
      message: `본문 이미지는 최대 ${MAX_BLOG_BODY_IMAGES}개까지 올릴 수 있습니다.`
    });
  }

  const totalBytes = images.reduce((total, image) => total + image.bytes.length, 0);
  if (totalBytes > MAX_BLOG_BODY_IMAGES_TOTAL_BYTES) {
    issues.push({
      field: "bodyImages",
      message: "본문 이미지 전체 용량은 2MB 이하여야 합니다."
    });
  }

  const validated: ValidatedBlogCoverImage[] = [];
  for (const image of images) {
    try {
      validated.push(validateBlogBodyImage(image));
    } catch (error) {
      if (error instanceof BlogEditorValidationError) {
        issues.push(...error.issues);
      } else {
        throw error;
      }
    }
  }

  if (issues.length > 0) {
    throw new BlogEditorValidationError(issues);
  }

  return validated;
}

export async function toBlogEditorCoverImage(
  upload: BlogEditorCoverUpload
): Promise<BlogEditorCoverImage> {
  const candidate = upload as BlogEditorCoverImage;

  if (
    candidate.bytes instanceof Uint8Array &&
    typeof candidate.fileName === "string" &&
    typeof candidate.mimeType === "string"
  ) {
    return candidate;
  }

  const file = upload as File;
  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    fileName: file.name,
    mimeType: file.type
  };
}
