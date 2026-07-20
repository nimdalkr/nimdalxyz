export const blogPostStatuses = ["draft", "published"] as const;

export type BlogPostStatus = (typeof blogPostStatuses)[number];

export type BlogEditorLocalizedContent = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  readingTime: string;
};

export type BlogEditorPostDocument = {
  slug: string;
  status: BlogPostStatus;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  ko: BlogEditorLocalizedContent;
  en: BlogEditorLocalizedContent;
  bodyKo: string;
  bodyEn: string;
};

export type BlogPendingBodyImage = {
  id: string;
  path: string;
  alt: string;
  width: number;
  height: number;
};

export type BlogPendingRequest = {
  slug: string;
  queuedAt: string;
  publishedAt: string;
  updatedAt: string;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  titleKo: string;
  bodyKo: string;
  bodyImages: BlogPendingBodyImage[];
};

export type BlogEditorTextFile = {
  path: string;
  contents: string;
};

export type BlogEditorCoverImage = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
};

export type BlogEditorCoverUpload = BlogEditorCoverImage | File;

export type BlogEditorBodyImageUpload = {
  id: string;
  upload: BlogEditorCoverUpload;
};

export type ValidatedBlogCoverImage = BlogEditorCoverImage & {
  extension: "gif" | "jpg" | "png" | "webp";
};

export type BlogEditorCommitResult = {
  oid: string;
  url: string;
  committedDate: string;
};

export type BlogEditorPostSnapshot = {
  document: BlogEditorPostDocument;
  expectedHeadOid: string;
  queued: boolean;
};

export type BlogEditorPostsSnapshot = {
  posts: BlogEditorPostDocument[];
  expectedHeadOid: string;
  pendingSlugs: string[];
};
