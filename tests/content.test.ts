import { expect, test } from "@playwright/test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { serializeStructuredData } from "../components/seo/StructuredData";
import {
  getLocalizedBlogPost,
  getLocalizedBlogPosts
} from "../content/blog/posts";
import { buildPublishedBlogDocument } from "../lib/blog-automation/document";
import {
  buildGeminiGenerateContentBody,
  classifyGeminiUpstreamFailure,
  GEMINI_JSON_MIME_TYPE
} from "../lib/blog-automation/gemini-request";
import { queueAndPublishBlogRequestImmediately } from "../lib/blog-automation/immediate";
import { buildGeminiBlogEnrichmentPrompt } from "../lib/blog-automation/prompt";
import {
  BlogAutomationError,
  type BlogEnrichmentOutput
} from "../lib/blog-automation/types";
import {
  extractOwnedBlogBodyImagePaths,
  validateGeminiBlogEnrichmentOutput
} from "../lib/blog-automation/validation";
import {
  isConfiguredWriterEmail,
  isVerifiedConfiguredWriter
} from "../lib/blog-writer-policy";
import {
  serializeBlogPendingRequestFiles,
  serializeBlogPostFiles
} from "../lib/blog-editor/serialization";
import type {
  BlogEditorCoverImage,
  BlogEditorPostDocument,
  BlogPendingRequest
} from "../lib/blog-editor/types";
import {
  MAX_BLOG_BODY_LENGTH,
  MAX_BLOG_BODY_IMAGES,
  MAX_BLOG_BODY_IMAGES_TOTAL_BYTES,
  MAX_BLOG_COVER_BYTES,
  validateBlogBodyImageUploads,
  validateBlogCoverImage,
  validateBlogPendingRequest,
  validateBlogPostDocument
} from "../lib/blog-editor/validation";
import { clipboardImageFiles, insertAtSelection } from "../lib/blog-editor/clipboard";
import {
  isExpectedBlogEditorHead,
  resolveBlogEditorDeploymentHead,
  resolveBlogEditorPersistenceMode
} from "../lib/blog-editor/persistence-policy";
import {
  careerCases,
  locales,
  projects,
  siteContent
} from "../lib/content";

const expectedLocales = ["en", "ko"] as const;
const mediaRoles = ["career", "concept", "document", "identity", "proof"] as const;
const baselineBlogSlugs = [
  "campaign-operations-to-product-systems",
  "nimdal-logbook",
  "research-tools-should-make-markets-readable"
] as const;

function pendingBlogRequest(slug: string, imageCount = 0): BlogPendingRequest {
  const bodyImages = Array.from({ length: imageCount }, (_, index) => {
    const id = `image${String(index).padStart(3, "0")}`;

    return {
      id,
      path: `/media/blog/${slug}/body-${id}.png`,
      alt: `본문 이미지 ${index + 1}`,
      width: 1280,
      height: 720
    };
  });
  const markdownImages = bodyImages
    .map((image) => `![${image.alt}](${image.path})`)
    .join("\n\n");

  return {
    slug,
    queuedAt: "2026-07-20T09:00:00.000Z",
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    cover: "/media/identity-octopus.jpg",
    coverWidth: 400,
    coverHeight: 400,
    titleKo: "대기 중인 글",
    bodyKo: `# 대기 중인 글\n\n한국어 원문${markdownImages ? `\n\n${markdownImages}` : ""}`,
    bodyImages
  };
}

function pngImage(id: string, byteLength: number): BlogEditorCoverImage {
  const bytes = new Uint8Array(byteLength);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  return {
    bytes,
    fileName: `${id}.png`,
    mimeType: "image/png"
  };
}

function blogEnrichmentOutput(request: BlogPendingRequest): BlogEnrichmentOutput {
  const translatedImages = request.bodyImages
    .map((image) => `![Translated image](${image.path})`)
    .join("\n\n");

  return {
    titleEn: "A pending article",
    bodyEn: `# A pending article\n\nEnglish body${translatedImages ? `\n\n${translatedImages}` : ""}`,
    summaryKo: "한국어 원문을 바탕으로 만든 요약입니다.",
    summaryEn: "A summary grounded in the Korean source.",
    categoryKo: "제작 기록",
    categoryEn: "Build Notes",
    tags: [
      { ko: "자동화", en: "Automation" },
      { ko: "블로그", en: "Blog" },
      { ko: "번역", en: "Translation" }
    ]
  };
}

function expectCompleteValue(value: unknown, path: string): void {
  if (typeof value === "string") {
    expect(value.trim(), `${path} should not be empty`).not.toBe("");
    return;
  }

  if (Array.isArray(value)) {
    expect(value.length, `${path} should not be empty`).toBeGreaterThan(0);
    value.forEach((entry, index) => expectCompleteValue(entry, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    expect(entries.length, `${path} should not be empty`).toBeGreaterThan(0);
    entries.forEach(([key, entry]) => expectCompleteValue(entry, `${path}.${key}`));
    return;
  }

  expect(value, `${path} should be defined`).toBeDefined();
  expect(value, `${path} should not be null`).not.toBeNull();
}

function expectLocalizedEntry(value: unknown, path: string): void {
  expect(value, `${path} should be an object`).toBeTruthy();

  const localized = value as Record<string, unknown>;
  expect(Object.keys(localized).sort(), `${path} should have only KO/EN entries`).toEqual([
    ...expectedLocales
  ]);

  for (const locale of expectedLocales) {
    expectCompleteValue(localized[locale], `${path}.${locale}`);
  }
}

function expectMediaMetadata(
  media: {
    role: string;
    src: string;
    capturedAt: string;
    alt: unknown;
    source: unknown;
    claim: unknown;
    limitation: unknown;
  },
  path: string
): void {
  expect(mediaRoles, `${path}.role should be supported`).toContain(media.role);
  expect(media.src, `${path}.src should reference a media asset`).toMatch(/^\/media\//);
  expect(media.capturedAt.trim(), `${path}.capturedAt should be present`).not.toBe("");

  expectLocalizedEntry(media.alt, `${path}.alt`);
  expectLocalizedEntry(media.source, `${path}.source`);
  expectLocalizedEntry(media.claim, `${path}.claim`);
  expectLocalizedEntry(media.limitation, `${path}.limitation`);
}

test("content inventory keeps the baseline content and unique public posts", async () => {
  const blogPosts = await getLocalizedBlogPosts("en");
  const blogSlugs = blogPosts.map(({ slug }) => slug);

  expect(projects).toHaveLength(9);
  expect(careerCases).toHaveLength(6);
  expect(blogPosts.length).toBeGreaterThanOrEqual(baselineBlogSlugs.length);
  baselineBlogSlugs.forEach((slug) => expect(blogSlugs).toContain(slug));

  expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
  expect(new Set(careerCases.map(({ id }) => id)).size).toBe(careerCases.length);
  expect(new Set(blogSlugs).size).toBe(blogPosts.length);
});

test("all public content has complete KO/EN entries", async () => {
  const [koPosts, enPosts] = await Promise.all([
    getLocalizedBlogPosts("ko"),
    getLocalizedBlogPosts("en")
  ]);

  expect([...locales].sort()).toEqual([...expectedLocales]);
  expectLocalizedEntry(siteContent, "siteContent");

  projects.forEach((project) => expectLocalizedEntry(project.copy, `projects.${project.slug}.copy`));
  careerCases.forEach((career) =>
    expectLocalizedEntry(career.copy, `careerCases.${career.id}.copy`)
  );
  expect(koPosts.map(({ slug }) => slug).sort()).toEqual(enPosts.map(({ slug }) => slug).sort());

  for (const enPost of enPosts) {
    const koPost = koPosts.find(({ slug }) => slug === enPost.slug);
    expect(koPost, `BLOG.${enPost.slug}.ko should exist`).toBeDefined();

    expectCompleteValue(
      {
        title: enPost.title,
        description: enPost.description,
        category: enPost.category,
        tags: enPost.tags,
        readingTime: enPost.readingTime
      },
      `BLOG.${enPost.slug}.en`
    );
    expectCompleteValue(
      {
        title: koPost?.title,
        description: koPost?.description,
        category: koPost?.category,
        tags: koPost?.tags,
        readingTime: koPost?.readingTime
      },
      `BLOG.${enPost.slug}.ko`
    );
    expect(koPost?.tags).toHaveLength(enPost.tags.length);

    const [koBody, enBody] = await Promise.all([koPost?.body(), enPost.body()]);
    expect(koBody?.node, `BLOG.${enPost.slug}.bodyKo should load`).toBeTruthy();
    expect(enBody.node, `BLOG.${enPost.slug}.bodyEn should load`).toBeTruthy();
  }
});

test("pending BLOG requests stay outside every public content loader", async () => {
  const slug = `pending-contract-${process.pid}`;
  const request = pendingBlogRequest(slug, 1);
  const files = serializeBlogPendingRequestFiles(request);
  const pendingDirectory = join(process.cwd(), "content/blog/pending", slug);

  expect(files.map(({ path }) => path)).toEqual([
    `content/blog/pending/${slug}/request.json`,
    `content/blog/pending/${slug}/bodyKo.md`
  ]);

  try {
    for (const file of files) {
      const absolutePath = join(process.cwd(), file.path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.contents, "utf8");
    }

    const [koPosts, enPosts, koPost, enPost] = await Promise.all([
      getLocalizedBlogPosts("ko"),
      getLocalizedBlogPosts("en"),
      getLocalizedBlogPost("ko", slug),
      getLocalizedBlogPost("en", slug)
    ]);

    expect(koPosts.map((post) => post.slug)).not.toContain(slug);
    expect(enPosts.map((post) => post.slug)).not.toContain(slug);
    expect(koPost).toBeUndefined();
    expect(enPost).toBeUndefined();
  } finally {
    await rm(pendingDirectory, { force: true, recursive: true });
  }
});

test("a queued edit keeps the existing published version public until enrichment", async () => {
  const slug = `published-queue-contract-${process.pid}`;
  const publishedDocument: BlogEditorPostDocument = {
    slug,
    status: "published",
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    cover: "/media/identity-octopus.jpg",
    coverWidth: 400,
    coverHeight: 400,
    ko: {
      title: "현재 공개 중인 제목",
      description: "현재 공개 중인 한국어 요약입니다.",
      category: "테스트",
      tags: ["공개"],
      readingTime: "1분"
    },
    en: {
      title: "Currently published title",
      description: "The currently published English summary.",
      category: "Test",
      tags: ["Published"],
      readingTime: "1 min read"
    },
    bodyKo: "# 현재 공개 중인 본문",
    bodyEn: "# Currently published body"
  };
  const queuedRequest = {
    ...pendingBlogRequest(slug),
    titleKo: "아직 공개되면 안 되는 수정 제목",
    bodyKo: "# 아직 공개되면 안 되는 수정 본문"
  };
  const files = [
    ...serializeBlogPostFiles(publishedDocument),
    ...serializeBlogPendingRequestFiles(queuedRequest)
  ];
  const postDirectory = join(process.cwd(), "content/blog/posts", slug);
  const pendingDirectory = join(process.cwd(), "content/blog/pending", slug);

  try {
    for (const file of files) {
      const absolutePath = join(process.cwd(), file.path);
      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, file.contents, "utf8");
    }

    const [koPost, enPost] = await Promise.all([
      getLocalizedBlogPost("ko", slug),
      getLocalizedBlogPost("en", slug)
    ]);

    expect(koPost?.title).toBe(publishedDocument.ko.title);
    expect(enPost?.title).toBe(publishedDocument.en.title);
    expect(koPost?.title).not.toBe(queuedRequest.titleKo);
    expect((await koPost?.body())?.node).toBeTruthy();
    expect((await enPost?.body())?.node).toBeTruthy();
  } finally {
    await Promise.all([
      rm(postDirectory, { force: true, recursive: true }),
      rm(pendingDirectory, { force: true, recursive: true })
    ]);
  }
});

test("pending BLOG requests allow eight resolved Markdown images and reject placeholders", () => {
  const maximumRequest = pendingBlogRequest("pending-eight-images", MAX_BLOG_BODY_IMAGES);
  const bodyFile = serializeBlogPendingRequestFiles(maximumRequest).find(({ path }) =>
    path.endsWith("/bodyKo.md")
  );

  expect(() => validateBlogPendingRequest(maximumRequest)).not.toThrow();
  expect(bodyFile?.contents).toBe(`${maximumRequest.bodyKo}\n`);
  maximumRequest.bodyImages.forEach(({ path }) => {
    expect(bodyFile?.contents).toContain(`](${path})`);
  });

  expect(() =>
    validateBlogPendingRequest(pendingBlogRequest("pending-nine-images", MAX_BLOG_BODY_IMAGES + 1))
  ).toThrow(/최대 8개/);
  expect(() =>
    validateBlogPendingRequest({
      ...pendingBlogRequest("pending-placeholder"),
      bodyKo: "![아직 업로드되지 않은 이미지](attachment:image000)"
    })
  ).toThrow(/업로드되지 않은 이미지/);
});

test("BLOG body image uploads enforce both count and aggregate byte limits", () => {
  const exactLimitUploads = Array.from({ length: MAX_BLOG_BODY_IMAGES }, (_, index) =>
    pngImage(
      `upload${String(index).padStart(3, "0")}`,
      MAX_BLOG_BODY_IMAGES_TOTAL_BYTES / MAX_BLOG_BODY_IMAGES
    )
  );

  expect(validateBlogBodyImageUploads(exactLimitUploads)).toHaveLength(MAX_BLOG_BODY_IMAGES);
  expect(() =>
    validateBlogBodyImageUploads([
      pngImage("uploadtotal0", MAX_BLOG_BODY_IMAGES_TOTAL_BYTES / 2),
      pngImage("uploadtotal1", MAX_BLOG_BODY_IMAGES_TOTAL_BYTES / 2 + 1)
    ])
  ).toThrow(/전체 용량은 2MB/);
  expect(() =>
    validateBlogBodyImageUploads(
      Array.from({ length: MAX_BLOG_BODY_IMAGES + 1 }, (_, index) =>
        pngImage(`overflow${String(index).padStart(3, "0")}`, 8)
      )
    )
  ).toThrow(/최대 8개/);
});

test("BLOG clipboard paste extracts image files without intercepting text or other files", () => {
  const png = { name: "image.png", type: "image/png" } as File;
  const gif = { name: "image.gif", type: "image/gif" } as File;
  const pdf = { name: "notes.pdf", type: "application/pdf" } as File;

  const files = clipboardImageFiles([
    { kind: "string", type: "text/plain", getAsFile: () => null },
    { kind: "file", type: "application/pdf", getAsFile: () => pdf },
    { kind: "file", type: "image/png", getAsFile: () => png },
    { kind: "file", type: "image/gif", getAsFile: () => gif },
    { kind: "file", type: "image/webp", getAsFile: () => null }
  ]);

  expect(files).toEqual([png, gif]);
});

test("BLOG image insertion replaces the selected text and returns the new caret", () => {
  const selectedText = "교체할 문장";
  const body = `앞 문단\n\n${selectedText}\n\n뒤 문단`;
  const start = body.indexOf(selectedText);
  const markdown = "![본문 이미지](attachment:image-id)";

  const inserted = insertAtSelection(
    body,
    { start, end: start + selectedText.length },
    markdown
  );

  expect(inserted.value).toBe(`앞 문단\n\n${markdown}\n\n뒤 문단`);
  expect(inserted.caret).toBe(`앞 문단\n\n${markdown}`.length);
});

test("Gemini prompt and validated output preserve every Markdown image URL in order", () => {
  const request = pendingBlogRequest("gemini-image-contract", 2);
  const prompt = buildGeminiBlogEnrichmentPrompt(request);
  const output = blogEnrichmentOutput(request);

  expect(prompt).toContain("immutableBodyImagePaths");
  request.bodyImages.forEach(({ path }) => {
    expect(prompt).toContain(path);
    expect(output.bodyEn).toContain(`](${path})`);
  });

  expect(validateGeminiBlogEnrichmentOutput(output, request)).toEqual(output);

  const document = buildPublishedBlogDocument(request, output);
  expect(document.status).toBe("published");
  expect(document.bodyKo).toBe(request.bodyKo);
  expect(document.bodyEn).toBe(output.bodyEn);
  expect(document.ko.tags).toEqual(output.tags.map(({ ko }) => ko));
  expect(document.en.tags).toEqual(output.tags.map(({ en }) => en));

  expect(() =>
    validateGeminiBlogEnrichmentOutput(
      {
        ...output,
        bodyEn: output.bodyEn.replace(
          request.bodyImages[0]?.path ?? "",
          "/media/blog/gemini-image-contract/body-changed000.png"
        )
      },
      request
    )
  ).toThrow(/image paths changed/i);

  expect(() =>
    validateGeminiBlogEnrichmentOutput(
      {
        ...output,
        unexpected: "field"
      },
      request
    )
  ).toThrow(/object shape/i);
});

test("Gemini enrichment also preserves body images already present before an edit", () => {
  const request = pendingBlogRequest("gemini-repeat-edit", 1);
  const existingPath = "/media/blog/gemini-repeat-edit/body-existing01.webp";
  const newImage = request.bodyImages[0];

  if (!newImage) {
    throw new Error("The repeat-edit fixture requires one newly uploaded image.");
  }
  const newPath = newImage.path;
  request.bodyKo = [
    "# 다시 편집한 글",
    `![기존 이미지](${existingPath})`,
    `![새 이미지](${newPath})`
  ].join("\n\n");

  const output = {
    ...blogEnrichmentOutput(request),
    bodyEn: [
      "# An edited article",
      `![Existing image](${existingPath})`,
      `![New image](${newPath})`
    ].join("\n\n")
  };

  expect(extractOwnedBlogBodyImagePaths(request.bodyKo, request.slug)).toEqual([
    existingPath,
    newPath
  ]);
  expect(buildGeminiBlogEnrichmentPrompt(request)).toContain(existingPath);
  expect(validateGeminiBlogEnrichmentOutput(output, request)).toEqual(output);

  expect(() =>
    validateGeminiBlogEnrichmentOutput(
      {
        ...output,
        bodyEn: [
          "# An edited article",
          `![New image](${newPath})`,
          `![Existing image](${existingPath})`
        ].join("\n\n")
      },
      request
    )
  ).toThrow(/image paths changed/i);
});

test("Gemini generateContent uses the REST enum for structured JSON output", () => {
  const body = buildGeminiGenerateContentBody("System instruction", "User prompt");

  expect(GEMINI_JSON_MIME_TYPE).toBe("APPLICATION_JSON");
  expect(body.generationConfig.responseFormat.text.mimeType).toBe("APPLICATION_JSON");
  expect(body.generationConfig.responseFormat.text.schema).toBeDefined();
  expect(JSON.stringify(body)).not.toContain('"mimeType":"application/json"');
});

test("Gemini HTTP failures distinguish configuration, quota, and upstream outages", () => {
  expect(classifyGeminiUpstreamFailure(400)).toBe("upstream_rejected");
  expect(classifyGeminiUpstreamFailure(401)).toBe("configuration");
  expect(classifyGeminiUpstreamFailure(403)).toBe("configuration");
  expect(classifyGeminiUpstreamFailure(404)).toBe("configuration");
  expect(classifyGeminiUpstreamFailure(429)).toBe("upstream_rate_limit");
  expect(classifyGeminiUpstreamFailure(503)).toBe("upstream_unavailable");
});

test("BLOG save queues the Korean source before immediate Gemini publishing", async () => {
  const request = pendingBlogRequest("immediate-publish-order");
  const queuedOid = "a".repeat(40);
  const publishedOid = "b".repeat(40);
  const deploymentOid = "c".repeat(40);
  const events: string[] = [];

  const result = await queueAndPublishBlogRequestImmediately(
    { request, expectedHeadOid: deploymentOid },
    {
      queue: async (input) => {
        events.push("queue");
        expect(input.expectedHeadOid).toBe(deploymentOid);
        return { oid: queuedOid, url: "https://example.com/queue", committedDate: request.queuedAt };
      },
      generate: async (input) => {
        events.push("generate");
        expect(input).toEqual(request);
        return blogEnrichmentOutput(request);
      },
      publish: async (input) => {
        events.push("publish");
        expect(input.expectedHeadOid).toBe(queuedOid);
        expect(input.document.status).toBe("published");
        expect(input.document.bodyKo).toBe(request.bodyKo);
        return { oid: publishedOid, url: "https://example.com/publish", committedDate: request.queuedAt };
      }
    }
  );

  expect(events).toEqual(["queue", "generate", "publish"]);
  expect(result.outcome).toBe("published");
  if (result.outcome === "published") {
    expect(result.publishedCommit.oid).toBe(publishedOid);
  }
});

test("BLOG immediate processing keeps the queued source when Gemini fails", async () => {
  const request = pendingBlogRequest("immediate-publish-fallback");
  const events: string[] = [];

  const result = await queueAndPublishBlogRequestImmediately(
    { request, expectedHeadOid: "c".repeat(40) },
    {
      queue: async () => {
        events.push("queue");
        return {
          oid: "a".repeat(40),
          url: "https://example.com/queue",
          committedDate: request.queuedAt
        };
      },
      generate: async () => {
        events.push("generate");
        throw new BlogAutomationError("request_timeout", "Gemini request timed out");
      },
      publish: async () => {
        events.push("publish");
        throw new Error("publish should not run");
      }
    }
  );

  expect(events).toEqual(["queue", "generate"]);
  expect(result.outcome).toBe("queued");
  if (result.outcome === "queued") {
    expect(result.failureCode).toBe("request_timeout");
  }
});

test("BLOG immediate processing does not call Gemini when source storage fails", async () => {
  const request = pendingBlogRequest("immediate-publish-save-error");
  let generated = false;

  await expect(
    queueAndPublishBlogRequestImmediately(
      { request, expectedHeadOid: "c".repeat(40) },
      {
        queue: async () => {
          throw new Error("queue failed");
        },
        generate: async () => {
          generated = true;
          return blogEnrichmentOutput(request);
        },
        publish: async () => ({
          oid: "b".repeat(40),
          url: "https://example.com/publish",
          committedDate: request.queuedAt
        })
      }
    )
  ).rejects.toThrow("queue failed");

  expect(generated).toBe(false);
});

test("BLOG has no scheduled enrichment cron", () => {
  const config = JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8")
  ) as {
    crons?: Array<{ path?: string; schedule?: string }>;
  };

  expect(config.crons ?? []).toEqual([]);
  expect(existsSync(join(process.cwd(), "app/api/cron/blog-enrichment/route.ts"))).toBe(false);
});

test("project and career media include evidence metadata", () => {
  projects.forEach((project) => {
    expect(project.media.length, `projects.${project.slug}.media should not be empty`).toBeGreaterThan(
      0
    );
    project.media.forEach((media, index) =>
      expectMediaMetadata(media, `projects.${project.slug}.media[${index}]`)
    );
  });

  careerCases.forEach((career) =>
    expectMediaMetadata(career.media, `careerCases.${career.id}.media`)
  );
});

test("AlphaDuo is present and the retired ARCDU identity is absent", async () => {
  const alphaDuo = projects.find(({ slug }) => slug === "alphaduo");
  expect(alphaDuo).toBeDefined();
  expect(alphaDuo?.copy.ko.title).toBe("AlphaDuo");
  expect(alphaDuo?.copy.en.title).toBe("AlphaDuo");

  const serializedContent = JSON.stringify({
    blogPosts: await getLocalizedBlogPosts("en"),
    careerCases,
    projects,
    siteContent
  });
  expect(serializedContent.toLowerCase()).not.toContain("arcdu");
});

test("structured data serialization cannot close its script element", () => {
  const serialized = serializeStructuredData({
    headline: '</script><script data-testid="stored-xss">alert(1)</script>',
    separator: "\u2028\u2029"
  });

  expect(serialized).not.toContain("</script");
  expect(serialized).not.toContain("<script");
  expect(serialized).toContain("\\u003c/script");
  expect(serialized).toContain("\\u2028");
  expect(serialized).toContain("\\u2029");
});

test("BLOG writer policy only accepts the two configured owner accounts", () => {
  const configuration = "trialhero41@gmail.com,0xnimdal@gmail.com,attacker@example.com";

  expect(isConfiguredWriterEmail(" trialhero41@gmail.com ", configuration)).toBe(true);
  expect(isConfiguredWriterEmail("0XNIMDAL@GMAIL.COM", configuration)).toBe(true);
  expect(isConfiguredWriterEmail("attacker@example.com", configuration)).toBe(false);
  expect(isConfiguredWriterEmail("trialhero41@gmail.com", "attacker@example.com")).toBe(false);
  expect(isConfiguredWriterEmail(undefined, configuration)).toBe(false);
  expect(
    isVerifiedConfiguredWriter(
      { email: "0xnimdal@gmail.com", emailVerified: true },
      configuration
    )
  ).toBe(true);
  expect(
    isVerifiedConfiguredWriter(
      { email: "0xnimdal@gmail.com", emailVerified: false },
      configuration
    )
  ).toBe(false);
});

test("BLOG editor never writes to GitHub outside production", () => {
  expect(resolveBlogEditorPersistenceMode({
    nodeEnv: "development",
    appId: "configured-in-shell",
    privateKey: "not-a-private-key",
    installationId: "configured-in-shell"
  })).toBe("local");
});

test("BLOG editor binds writes to the exact production deployment head", () => {
  const deployedHead = "a".repeat(40);
  const newerHead = "b".repeat(40);

  expect(resolveBlogEditorDeploymentHead({
    nodeEnv: "production",
    deploymentOid: deployedHead
  })).toEqual({ status: "ready", oid: deployedHead });
  expect(resolveBlogEditorDeploymentHead({
    nodeEnv: "production",
    deploymentOid: undefined
  })).toEqual({ status: "missing-production-sha" });
  expect(resolveBlogEditorDeploymentHead({
    nodeEnv: "production",
    deploymentOid: "not-a-git-object-id"
  })).toEqual({ status: "missing-production-sha" });
  expect(isExpectedBlogEditorHead(deployedHead, deployedHead)).toBe(true);
  expect(isExpectedBlogEditorHead(newerHead, deployedHead)).toBe(false);
  expect(isExpectedBlogEditorHead("forged", deployedHead)).toBe(false);
});

test("BLOG server action module only exports async runtime values", () => {
  const source = readFileSync(join(process.cwd(), "app/write/actions.ts"), "utf8");
  const invalidRuntimeExports = source.match(/^export (?!type\s|async function\s).+$/gm) ?? [];

  expect(invalidRuntimeExports).toEqual([]);
});

test("BLOG editor rejects unsafe tag URLs and forged image content", () => {
  const document = {
    slug: "safe-post",
    status: "published" as const,
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    cover: "/media/identity-octopus.jpg",
    coverWidth: 400,
    coverHeight: 400,
    ko: {
      title: "안전한 글",
      description: "설명",
      category: "기록",
      tags: ["운영", "성장"],
      readingTime: "3분"
    },
    en: {
      title: "Safe post",
      description: "Description",
      category: "Notes",
      tags: ["Growth & Ops", "Research"],
      readingTime: "3 min read"
    },
    bodyKo: "본문",
    bodyEn: "Body"
  };

  expect(() => validateBlogPostDocument(document)).not.toThrow();
  expect(() =>
    validateBlogPostDocument({
      ...document,
      en: { ...document.en, tags: ["Growth & Ops", "Growth and Ops"] }
    })
  ).toThrow(/같은 URL/);
  expect(() =>
    validateBlogPostDocument({
      ...document,
      en: { ...document.en, tags: ["리서치", "Research"] }
    })
  ).toThrow(/영문 또는 숫자/);

  expect(() =>
    validateBlogCoverImage({
      bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
      fileName: "forged.png",
      mimeType: "image/png"
    })
  ).toThrow(/파일 내용과 이미지 형식/);
});

test("BLOG editor payload limits stay below the production request ceiling", async () => {
  const oversizedPng = new Uint8Array(MAX_BLOG_COVER_BYTES + 1);
  oversizedPng.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  expect(() => validateBlogCoverImage({
    bytes: oversizedPng,
    fileName: "oversized.png",
    mimeType: "image/png"
  })).toThrow(/2MB/);

  const baseDocument = {
    slug: "payload-limit",
    status: "published" as const,
    publishedAt: "2026-07-20",
    updatedAt: "2026-07-20",
    cover: "/media/identity-octopus.jpg",
    coverWidth: 400,
    coverHeight: 400,
    ko: {
      title: "제목",
      description: "설명",
      category: "기록",
      tags: ["운영"],
      readingTime: "1분"
    },
    en: {
      title: "Title",
      description: "Description",
      category: "Notes",
      tags: ["Operations"],
      readingTime: "1 min"
    },
    bodyKo: "본문",
    bodyEn: "Body"
  };

  expect(() => validateBlogPostDocument({
    ...baseDocument,
    bodyKo: "가".repeat(MAX_BLOG_BODY_LENGTH + 1)
  })).toThrow(new RegExp(String(MAX_BLOG_BODY_LENGTH)));

  const maximumForm = new FormData();
  maximumForm.set("mode", "edit");
  maximumForm.set("originalSlug", "a".repeat(120));
  maximumForm.set("slug", "a".repeat(120));
  maximumForm.set("expectedHeadOid", "a".repeat(64));
  maximumForm.set("status", "published");
  maximumForm.set("publishedAt", "2026-07-20");
  maximumForm.set("updatedAt", "2026-07-20");
  maximumForm.set("cover", "/media/blog/payload-limit/cover.png");
  maximumForm.set("coverWidth", "20000");
  maximumForm.set("coverHeight", "20000");

  for (const locale of ["ko", "en"] as const) {
    maximumForm.set(`${locale}Title`, "가".repeat(140));
    maximumForm.set(`${locale}Description`, "가".repeat(320));
    maximumForm.set(`${locale}Category`, "가".repeat(80));
    maximumForm.set(`${locale}ReadingTime`, "가".repeat(40));
    maximumForm.set(`${locale}Tags`, Array.from({ length: 12 }, () => "a".repeat(64)).join(","));
  }

  maximumForm.set("bodyKo", "가".repeat(MAX_BLOG_BODY_LENGTH));
  maximumForm.set("bodyEn", "가".repeat(MAX_BLOG_BODY_LENGTH));
  maximumForm.set(
    "coverImage",
    new File([new Uint8Array(MAX_BLOG_COVER_BYTES)], "cover.png", { type: "image/png" })
  );

  const encodedRequest = new Request("https://blog.nimdal.xyz/write", {
    method: "POST",
    body: maximumForm
  });
  const encodedBytes = (await encodedRequest.arrayBuffer()).byteLength;

  expect(encodedBytes).toBeLessThan(4 * 1024 * 1024);
});
