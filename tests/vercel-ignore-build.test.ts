import { expect, test } from "@playwright/test";

import {
  BUILD_PATTERNS,
  SKIP_PATTERNS,
  classifyPath,
  decide
} from "../scripts/build-filter.mjs";

/**
 * The Ignored Build Step filter decides whether a commit reaches Vercel at all,
 * so the cost of a wrong answer is asymmetric: a needless build wastes quota,
 * a wrongly skipped build means a production deploy that never happened. These
 * tests hold the filter to that asymmetry.
 */

test.describe("build trigger classification", () => {
  test("runtime sources are build paths", () => {
    const runtime = [
      "app/[locale]/page.tsx",
      "app/globals.css",
      "components/ink/InkRoster.tsx",
      "lib/content.ts",
      "public/media/partners/leica.png",
      "content/blog/posts.ts",
      "content/intro.mdx",
      "data/projects.json",
      "types/blog.ts",
      "package.json",
      "package-lock.json",
      "next.config.mjs",
      "tsconfig.json",
      "vercel.json",
      "proxy.ts",
      "postcss.config.mjs",
      "keystatic.config.ts",
      "scripts/vercel-ignore-build.mjs"
    ];
    for (const file of runtime) {
      expect(classifyPath(file), `${file} must build`).toBe("build");
    }
  });

  test("records and QA output are skip paths", () => {
    const records = [
      "audits/2026-07-20-blog-redesign/comparison-1440x1024-final.png",
      "artifacts/qa-home-release-1440.png",
      "artifacts/korean-copy-audit/README.md",
      "docs/blog-editor.md",
      "docs/releases.md",
      "wiki/inbox.md",
      "tmp/shots/roster.png",
      "tests/e2e/site.spec.ts",
      "playwright.config.ts",
      ".github/workflows/qa.yml",
      "README.md",
      "INK_RECORDS_PLAN.md",
      ".gitignore",
      ".vercelignore"
    ];
    for (const file of records) {
      expect(classifyPath(file), `${file} must skip`).toBe("skip");
    }
  });

  test("root-level patterns do not swallow nested content", () => {
    // "*.md" is a root-only rule; a post under content/ is a build path.
    expect(classifyPath("content/blog/2026-launch.md")).toBe("build");
    expect(classifyPath("content/blog/2026-launch.mdx")).toBe("build");
    expect(classifyPath("public/media/og-dive.png")).toBe("build");
    expect(classifyPath("CHANGELOG.md")).toBe("skip");
  });

  test("unrecognised paths are unknown, never silently skipped", () => {
    expect(classifyPath("infra/terraform/main.tf")).toBe("unknown");
    expect(classifyPath("src/legacy/index.ts")).toBe("unknown");
    expect(classifyPath("")).toBe("unknown");
  });

  test("every declared pattern is a non-empty string", () => {
    for (const pattern of [...BUILD_PATTERNS, ...SKIP_PATTERNS]) {
      expect(typeof pattern).toBe("string");
      expect(pattern.length).toBeGreaterThan(0);
    }
  });
});

test.describe("build decision", () => {
  test("a docs-only commit skips", () => {
    const verdict = decide(["docs/releases.md", "audits/2026-08-01/home.png"]);
    expect(verdict.build).toBe(false);
    expect(verdict.skipFiles).toHaveLength(2);
    expect(verdict.buildFiles).toHaveLength(0);
  });

  test("an artifacts-only commit skips", () => {
    const verdict = decide([
      "artifacts/qa-home-release-390.png",
      "artifacts/qa-pixelpop/home-1440x1024.png"
    ]);
    expect(verdict.build).toBe(false);
  });

  test("a runtime change builds", () => {
    const verdict = decide(["app/[locale]/page.tsx"]);
    expect(verdict.build).toBe(true);
    expect(verdict.buildFiles).toEqual(["app/[locale]/page.tsx"]);
  });

  test("one runtime file among many records still builds", () => {
    const verdict = decide([
      "docs/releases.md",
      "audits/2026-08-01/home.png",
      "lib/content.ts"
    ]);
    expect(verdict.build).toBe(true);
    expect(verdict.buildFiles).toEqual(["lib/content.ts"]);
  });

  test("an unknown path builds rather than risking a missed deploy", () => {
    const verdict = decide(["docs/releases.md", "infra/pulumi/index.ts"]);
    expect(verdict.build).toBe(true);
    expect(verdict.unknownFiles).toEqual(["infra/pulumi/index.ts"]);
  });

  test("an unexplained empty diff builds", () => {
    expect(decide([]).build).toBe(true);
    expect(decide(null).build).toBe(true);
  });

  test("a redeploy of the identical commit skips", () => {
    const verdict = decide([], { emptyRangeIsNoop: true });
    expect(verdict.build).toBe(false);
  });
});
