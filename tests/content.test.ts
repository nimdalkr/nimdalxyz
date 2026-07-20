import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { serializeStructuredData } from "../components/seo/StructuredData";
import { getLocalizedBlogPosts } from "../content/blog/posts";
import {
  isConfiguredWriterEmail,
  isVerifiedConfiguredWriter
} from "../lib/blog-writer-policy";
import {
  MAX_BLOG_BODY_LENGTH,
  MAX_BLOG_COVER_BYTES,
  validateBlogCoverImage,
  validateBlogPostDocument
} from "../lib/blog-editor/validation";
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

test("content inventory has the expected project, career, and post counts", async () => {
  const blogPosts = await getLocalizedBlogPosts("en");

  expect(projects).toHaveLength(9);
  expect(careerCases).toHaveLength(6);
  expect(blogPosts).toHaveLength(3);

  expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
  expect(new Set(careerCases.map(({ id }) => id)).size).toBe(careerCases.length);
  expect(new Set(blogPosts.map(({ slug }) => slug)).size).toBe(blogPosts.length);
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
