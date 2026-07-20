import { expect, test } from "@playwright/test";

import { getLocalizedBlogPosts } from "../content/blog/posts";
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
