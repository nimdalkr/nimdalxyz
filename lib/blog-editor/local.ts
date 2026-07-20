import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import path from "node:path";

import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "@/keystatic.config";
import { serializeBlogPostFiles } from "@/lib/blog-editor/serialization";
import type {
  BlogEditorCoverImage,
  BlogEditorPostDocument,
  ValidatedBlogCoverImage
} from "@/lib/blog-editor/types";
import {
  assertValidBlogSlug,
  blogOwnedCoverPath,
  validateBlogCoverImage,
  validateBlogPostDocument
} from "@/lib/blog-editor/validation";

const BLOG_CONTENT_DIRECTORY = path.join(process.cwd(), "content/blog/posts");

function postDirectory(slug: string) {
  assertValidBlogSlug(slug);
  return path.join(BLOG_CONTENT_DIRECTORY, slug);
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

export async function getLocalBlogContentOid() {
  const hash = createHash("sha256");
  const entries = await readdir(BLOG_CONTENT_DIRECTORY, {
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
    for (const fileName of ["index.yaml", "bodyKo.md", "bodyEn.md"] as const) {
      const relativePath = `${slug}/${fileName}`;
      const contents = await readFile(path.join(BLOG_CONTENT_DIRECTORY, relativePath));
      hash.update(relativePath);
      hash.update("\0");
      hash.update(contents);
      hash.update("\0");
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

export async function deleteLocalBlogPost(input: {
  slug: string;
  expectedHeadOid: string;
}) {
  assertValidBlogSlug(input.slug);
  await assertExpectedLocalHead(input.expectedHeadOid);
  const existingDocument = await readLocalBlogPostDocument(input.slug);
  const directory = postDirectory(input.slug);

  try {
    const directoryStat = await stat(directory);
    if (!directoryStat.isDirectory()) {
      throw new Error("글 경로가 디렉터리가 아닙니다.");
    }
  } catch (error) {
    if (isMissingFile(error)) {
      throw new Error("삭제할 글을 찾을 수 없습니다.");
    }
    throw error;
  }

  await rm(directory, { recursive: true });
  const cover = existingDocument
    ? blogOwnedCoverPath(input.slug, existingDocument.cover)
    : undefined;
  if (cover) {
    await rm(path.join(process.cwd(), "public", cover.replace(/^\//, "")), { force: true });
  }
  return getLocalBlogContentOid();
}
