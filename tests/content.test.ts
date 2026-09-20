import { expect, test } from "@playwright/test";

import { serializeStructuredData } from "../components/seo/StructuredData";
import {
  careerCases,
  careerChapters,
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

test("content inventory keeps the baseline content with unique ids", () => {
  expect(projects).toHaveLength(2);
  expect(careerCases).toHaveLength(6);
  expect(careerChapters).toHaveLength(7);

  expect(new Set(projects.map(({ slug }) => slug)).size).toBe(projects.length);
  expect(new Set(careerCases.map(({ id }) => id)).size).toBe(careerCases.length);
  expect(new Set(careerChapters.map(({ id }) => id)).size).toBe(careerChapters.length);
});

test("career chronology covers the full operating arc from 2012 to the present", () => {
  const ids = careerChapters.map(({ id }) => id);
  const periods = careerChapters.map(({ period }) => period);

  expect(ids).toContain("makorang-lab");
  expect(ids).toContain("baboclub-community");
  expect(ids).toContain("five-over-two");
  expect(periods.some((period) => period.startsWith("2012"))).toBe(true);
  expect(periods.some((period) => period.endsWith("NOW"))).toBe(true);
});

test("all public content has complete KO/EN entries", () => {
  expect([...locales].sort()).toEqual([...expectedLocales]);
  expectLocalizedEntry(siteContent, "siteContent");

  projects.forEach((project) => expectLocalizedEntry(project.copy, `projects.${project.slug}.copy`));
  careerCases.forEach((career) =>
    expectLocalizedEntry(career.copy, `careerCases.${career.id}.copy`)
  );
  careerChapters.forEach((chapter) =>
    expectLocalizedEntry(chapter.copy, `careerChapters.${chapter.id}.copy`)
  );
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

test("Only selected personal projects are public and hobby work is absent from careers", () => {
  expect(projects.map(project => project.slug)).toEqual(["hyperalphaduo", "mylol"]);
  expect(careerChapters.map(chapter => chapter.copy.en.organization)).not.toContain("myLoL");

  const serializedContent = JSON.stringify({ careerCases, projects, siteContent });
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
