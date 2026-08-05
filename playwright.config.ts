import { defineConfig, devices } from "@playwright/test";

// Tests that assert on modules rather than on a running site. Naming them here
// keeps a targeted run from booting a dev server it will never call.
const NODE_ONLY_TESTS = ["tests/content.test.ts", "tests/vercel-ignore-build.test.ts"];

const runsNodeOnlyTests =
  process.argv.some((argument) =>
    NODE_ONLY_TESTS.some((file) => argument.endsWith(file) || argument.endsWith(file.replace(/\//g, "\\")))
  ) && !process.argv.some((argument) => argument.endsWith("tests/e2e"));

export default defineConfig({
  testDir: "./tests",
  outputDir: ".next/test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Concurrent first-time route compilation can corrupt Next's dev prerender manifest.
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: runsNodeOnlyTests
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI
      }
});
