import type {
  BlogEditorLocalizedContent,
  BlogEditorPostDocument,
  BlogEditorTextFile
} from "@/lib/blog-editor/types";
import { validateBlogPostDocument } from "@/lib/blog-editor/validation";

function yamlString(value: string) {
  return JSON.stringify(value);
}

function serializeLocalizedContent(key: "ko" | "en", content: BlogEditorLocalizedContent) {
  const tags = content.tags.map((tag) => `    - ${yamlString(tag.trim())}`).join("\n");

  return [
    `${key}:`,
    `  title: ${yamlString(content.title.trim())}`,
    `  description: ${yamlString(content.description.trim())}`,
    `  category: ${yamlString(content.category.trim())}`,
    ...(tags ? ["  tags:", tags] : ["  tags: []"]),
    `  readingTime: ${yamlString(content.readingTime.trim())}`
  ].join("\n");
}

export function normalizeBlogMarkdown(value: string) {
  const normalized = value.replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").trimEnd();
  return `${normalized}\n`;
}

export function serializeBlogPostYaml(document: BlogEditorPostDocument) {
  validateBlogPostDocument(document);

  return `${[
    `slug: ${yamlString(document.slug)}`,
    `status: ${document.status}`,
    `publishedAt: ${yamlString(document.publishedAt)}`,
    `updatedAt: ${yamlString(document.updatedAt)}`,
    `cover: ${yamlString(document.cover)}`,
    `coverWidth: ${document.coverWidth}`,
    `coverHeight: ${document.coverHeight}`,
    serializeLocalizedContent("ko", document.ko),
    serializeLocalizedContent("en", document.en)
  ].join("\n")}\n`;
}

export function serializeBlogPostFiles(document: BlogEditorPostDocument): BlogEditorTextFile[] {
  const directory = `content/blog/posts/${document.slug}`;

  return [
    {
      path: `${directory}/index.yaml`,
      contents: serializeBlogPostYaml(document)
    },
    {
      path: `${directory}/bodyKo.md`,
      contents: normalizeBlogMarkdown(document.bodyKo)
    },
    {
      path: `${directory}/bodyEn.md`,
      contents: normalizeBlogMarkdown(document.bodyEn)
    }
  ];
}
