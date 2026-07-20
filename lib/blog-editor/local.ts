import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile
} from "node:fs/promises";
import path from "node:path";

import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "@/keystatic.config";
import {
  serializeBlogPendingRequestFiles,
  serializeBlogPostFiles
} from "@/lib/blog-editor/serialization";
import type {
  BlogEditorCoverImage,
  BlogPendingRequest,
  BlogEditorPostDocument,
  ValidatedBlogCoverImage
} from "@/lib/blog-editor/types";
import {
  assertValidBlogSlug,
  blogOwnedCoverPath,
  validateBlogBodyImage,
  validateBlogPendingRequest,
  validateBlogCoverImage,
  validateBlogPostDocument
} from "@/lib/blog-editor/validation";

const BLOG_CONTENT_DIRECTORY = path.join(process.cwd(), "content/blog/posts");
const BLOG_PENDING_DIRECTORY = path.join(process.cwd(), "content/blog/pending");

function postDirectory(slug: string) {
  assertValidBlogSlug(slug);
  return path.join(BLOG_CONTENT_DIRECTORY, slug);
}

function pendingDirectory(slug: string) {
  assertValidBlogSlug(slug);
  return path.join(BLOG_PENDING_DIRECTORY, slug);
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function readLocalBlogPostDocument(slug: string) {
  assertValidBlogSlug(slug);
  const reader = createReader(process.cwd(), keystaticConfig);
  const entry = await reader.collections.posts.read(slug);

  if (!entry) {
    return undefined;
  }

  const directory = postDirectory(slug);
  const [bodyKo, bodyEn] = await Promise.all([
    readFile(path.join(directory, "bodyKo.md"), "utf8"),
    readFile(path.join(directory, "bodyEn.md"), "utf8")
  ]);

  return {
    slug,
    status: entry.status,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    cover: entry.cover,
    coverWidth: entry.coverWidth,
    coverHeight: entry.coverHeight,
    ko: {
      ...entry.ko,
      tags: [...entry.ko.tags]
    },
    en: {
      ...entry.en,
      tags: [...entry.en.tags]
    },
    bodyKo,
    bodyEn
  } satisfies BlogEditorPostDocument;
}

export async function readLocalBlogPostDocuments() {
  const reader = createReader(process.cwd(), keystaticConfig);
  const slugs = await reader.collections.posts.list();
  const posts = await Promise.all(slugs.map((slug) => readLocalBlogPostDocument(slug)));

  return posts
    .filter((post): post is BlogEditorPostDocument => Boolean(post))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function readLocalBlogPendingRequest(slug: string) {
  assertValidBlogSlug(slug);
  const directory = pendingDirectory(slug);

  try {
    const [metadataSource, bodyKo] = await Promise.all([
      readFile(path.join(directory, "request.json"), "utf8"),
      readFile(path.join(directory, "bodyKo.md"), "utf8")
    ]);
    const metadata = JSON.parse(metadataSource) as Omit<BlogPendingRequest, "bodyKo">;
    const request = { ...metadata, bodyKo } satisfies BlogPendingRequest;
    return validateBlogPendingRequest(request);
  } catch (error) {
    if (isMissingFile(error)) {
      return undefined;
    }

    if (error instanceof SyntaxError) {
      throw new Error(`대기 중인 글 ${slug}의 요청 파일이 올바른 JSON이 아닙니다.`);
    }

    throw error;
  }
}

export async function readLocalBlogPendingRequests() {
  const entries = await readdir(BLOG_PENDING_DIRECTORY, {
    withFileTypes: true,
    encoding: "utf8"
  }).catch((error: unknown) => {
    if (isMissingFile(error)) {
      return [];
    }
    throw error;
  });
  const requests = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => {
        try {
          assertValidBlogSlug(slug);
          return true;
        } catch {
          return false;
        }
      })
      .map((slug) => readLocalBlogPendingRequest(slug))
  );

  return requests
    .filter((request): request is BlogPendingRequest => Boolean(request))
    .sort((a, b) => b.queuedAt.localeCompare(a.queuedAt));
}

export async function getLocalBlogContentOid() {
  const hash = createHash("sha256");
  const collections = [
    {
      directory: BLOG_CONTENT_DIRECTORY,
      prefix: "posts",
      fileNames: ["index.yaml", "bodyKo.md", "bodyEn.md"]
    },
    {
      directory: BLOG_PENDING_DIRECTORY,
      prefix: "pending",
      fileNames: ["request.json", "bodyKo.md"]
    }
  ] as const;

  for (const collection of collections) {
    const entries = await readdir(collection.directory, {
      withFileTypes: true,
      encoding: "utf8"
    }).catch((error: unknown) => {
      if (isMissingFile(error)) {
        return [];
      }
      throw error;
    });
    const slugs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((slug) => {
        try {
          assertValidBlogSlug(slug);
          return true;
        } catch {
          return false;
        }
      })
      .sort();

    for (const slug of slugs) {
      for (const fileName of collection.fileNames) {
        const relativePath = `${collection.prefix}/${slug}/${fileName}`;
        const contents = await readFile(path.join(collection.directory, slug, fileName));
        hash.update(relativePath);
        hash.update("\0");
        hash.update(contents);
        hash.update("\0");
      }
    }
  }

  return hash.digest("hex");
}

async function assertExpectedLocalHead(expectedHeadOid: string) {
  const currentHeadOid = await getLocalBlogContentOid();

  if (currentHeadOid !== expectedHeadOid) {
    const error = new Error(
      "다른 변경이 먼저 저장되었습니다. 최신 버전을 불러온 뒤 다시 시도해 주세요."
    );
    error.name = "BlogEditorLocalConflictError";
    throw error;
  }
}

async function writeFilesAtomically(
  directory: string,
  files: readonly { path: string; contents: string | Uint8Array }[]
) {
  await mkdir(directory, { recursive: true });
  const temporaryFiles: { temporaryPath: string; finalPath: string }[] = [];

  try {
    for (const file of files) {
      const finalPath = path.join(directory, file.path);
      const temporaryPath = `${finalPath}.${randomUUID()}.tmp`;
      await mkdir(path.dirname(finalPath), { recursive: true });
      await writeFile(temporaryPath, file.contents);
      temporaryFiles.push({ temporaryPath, finalPath });
    }

    for (const { temporaryPath, finalPath } of temporaryFiles) {
      await rename(temporaryPath, finalPath);
    }
  } finally {
    await Promise.all(
      temporaryFiles.map(({ temporaryPath }) => rm(temporaryPath, { force: true }).catch(() => undefined))
    );
  }
}

export async function saveLocalBlogPost(input: {
  document: BlogEditorPostDocument;
  expectedHeadOid: string;
  coverImage?: BlogEditorCoverImage;
}) {
  await assertExpectedLocalHead(input.expectedHeadOid);
  const existingDocument = await readLocalBlogPostDocument(input.document.slug);
  const document: BlogEditorPostDocument = {
    ...input.document,
    ko: { ...input.document.ko, tags: [...input.document.ko.tags] },
    en: { ...input.document.en, tags: [...input.document.en.tags] }
  };
  let image: ValidatedBlogCoverImage | undefined;

  if (input.coverImage) {
    image = validateBlogCoverImage(input.coverImage);
    document.cover = `/media/blog/${document.slug}/cover.${image.extension}`;
  }

  validateBlogPostDocument(document);
  await writeFilesAtomically(
    postDirectory(document.slug),
    serializeBlogPostFiles(document).map((file) => ({
      path: path.basename(file.path),
      contents: file.contents
    }))
  );

  if (image) {
    await writeFilesAtomically(path.join(process.cwd(), "public"), [
      {
        path: document.cover.replace(/^\//, ""),
        contents: image.bytes
      }
    ]);

    const oldCover = existingDocument
      ? blogOwnedCoverPath(document.slug, existingDocument.cover)
      : undefined;
    if (oldCover && oldCover !== document.cover) {
      await rm(path.join(process.cwd(), "public", oldCover.replace(/^\//, "")), { force: true });
    }
  }

  return getLocalBlogContentOid();
}

export async function saveLocalBlogPendingRequest(input: {
  request: BlogPendingRequest;
  expectedHeadOid: string;
  bodyImages: readonly { path: string; image: BlogEditorCoverImage }[];
}) {
  await assertExpectedLocalHead(input.expectedHeadOid);
  validateBlogPendingRequest(input.request);
  const existingRequest = await readLocalBlogPendingRequest(input.request.slug);
  const uploadedPaths = new Set<string>();

  for (const upload of input.bodyImages) {
    const image = validateBlogBodyImage(upload.image);
    if (!input.request.bodyImages.some((candidate) => candidate.path === upload.path)) {
      throw new Error("본문에서 사용하지 않는 이미지 파일은 저장할 수 없습니다.");
    }
    if (!upload.path.endsWith(`.${image.extension}`)) {
      throw new Error("본문 이미지 경로와 파일 형식이 일치하지 않습니다.");
    }
    uploadedPaths.add(upload.path);
  }

  await writeFilesAtomically(
    pendingDirectory(input.request.slug),
    serializeBlogPendingRequestFiles(input.request).map((file) => ({
      path: path.basename(file.path),
      contents: file.contents
    }))
  );

  if (input.bodyImages.length > 0) {
    await writeFilesAtomically(
      path.join(process.cwd(), "public"),
      input.bodyImages.map(({ path: imagePath, image }) => ({
        path: imagePath.replace(/^\//, ""),
        contents: image.bytes
      }))
    );
  }

  const retainedPaths = new Set(input.request.bodyImages.map((image) => image.path));
  for (const image of existingRequest?.bodyImages ?? []) {
    if (!retainedPaths.has(image.path) && !uploadedPaths.has(image.path)) {
      await rm(path.join(process.cwd(), "public", image.path.replace(/^\//, "")), {
        force: true
      });
    }
  }

  return getLocalBlogContentOid();
}

export async function publishLocalBlogPendingResults(input: {
  documents: readonly BlogEditorPostDocument[];
  expectedHeadOid: string;
}) {
  await assertExpectedLocalHead(input.expectedHeadOid);

  for (const document of input.documents) {
    validateBlogPostDocument(document);
    if (document.status !== "published") {
      throw new Error("자동 처리 결과는 공개 상태여야 합니다.");
    }
    if (!(await readLocalBlogPendingRequest(document.slug))) {
      throw new Error(`처리할 대기 글을 찾을 수 없습니다: ${document.slug}`);
    }
  }

  for (const document of input.documents) {
    await writeFilesAtomically(
      postDirectory(document.slug),
      serializeBlogPostFiles(document).map((file) => ({
        path: path.basename(file.path),
        contents: file.contents
      }))
    );
  }

  await Promise.all(
    input.documents.map((document) =>
      rm(pendingDirectory(document.slug), { force: true, recursive: true })
    )
  );

  return getLocalBlogContentOid();
}

export async function listLocalBlogMediaPaths(slug: string) {
  assertValidBlogSlug(slug);
  const directory = path.join(process.cwd(), "public/media/blog", slug);
  const entries = await readdir(directory, { withFileTypes: true, encoding: "utf8" }).catch(
    (error: unknown) => {
      if (isMissingFile(error)) {
        return [];
      }
      throw error;
    }
  );

  return entries
    .filter((entry) => entry.isFile() && /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(entry.name))
    .map((entry) => `/media/blog/${slug}/${entry.name}`)
    .sort();
}

export async function deleteLocalBlogPost(input: {
  slug: string;
  expectedHeadOid: string;
}) {
  assertValidBlogSlug(input.slug);
  await assertExpectedLocalHead(input.expectedHeadOid);
  const [existingDocument, pendingRequest, mediaPaths] = await Promise.all([
    readLocalBlogPostDocument(input.slug),
    readLocalBlogPendingRequest(input.slug),
    listLocalBlogMediaPaths(input.slug)
  ]);

  if (!existingDocument && !pendingRequest) {
    throw new Error("삭제할 글을 찾을 수 없습니다.");
  }

  await Promise.all([
    rm(postDirectory(input.slug), { force: true, recursive: true }),
    rm(pendingDirectory(input.slug), { force: true, recursive: true }),
    ...mediaPaths.map((mediaPath) =>
      rm(path.join(process.cwd(), "public", mediaPath.replace(/^\//, "")), { force: true })
    )
  ]);
  return getLocalBlogContentOid();
}
