import { defineConfig, devices } from "@playwright/test";

const runsContentTestOnly = process.argv.some((argument) =>
  argument.endsWith("tests/content.test.ts")
);

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
  webServer: runsContentTestOnly
    ? undefined
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI
      }
});
