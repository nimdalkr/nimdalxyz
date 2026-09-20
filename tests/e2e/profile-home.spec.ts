import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { careerCases, featuredProject } from "../../lib/content";

test("profile is server-rendered with identity, career since 2012, and real media", async ({
  page,
  request,
}, testInfo) => {
  const response = await request.get("/en");
  const html = await response.text();
  expect(html).toContain("Makorang Lab");
  expect(html).toContain("2012");
  expect(html).toContain("FIVE OVER TWO");
  // Case details ship in the HTML, not only in the client payload, so search
  // engines and the AI readers the home links to can read them.
  const visibleHtml = html.replace(/<script\b[\s\S]*?<\/script>/g, "");
  expect(visibleHtml).toContain(featuredProject.copy.en.detail.problem);
  expect(visibleHtml).toContain(careerCases[0].copy.en.context);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { name: "Nimdal", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Background", exact: true })
      .getByRole("listitem"),
  ).toHaveCount(7);
  await expect(page.getByRole("button", { name: /^Read case:/ })).toHaveCount(
    6,
  );
  await expect(
    page.locator(
      'a[href*="/en/projects/"], a[href*="/en/portfolio"], a[href*="/en/lab"]',
    ),
  ).toHaveCount(0);
  const images = page.locator("main img:visible");
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        img.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("profile-desktop.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("the profile home preloads no fonts, so Apple devices download none", async ({
  request,
}) => {
  const html = await (await request.get("/en")).text();
  expect(html).not.toMatch(/<link[^>]+as="font"/);
});

test("featured, personal projects and career cases open as single-view, keyboard-accessible case sheets", async ({
  page,
}) => {
  await page.goto("/en");
  const projects = page.getByRole("button", { name: /^Explore / });
  await expect(projects).toHaveCount(3);
  for (const button of await projects.all()) {
    const title = (await button.getAttribute("aria-label"))!.replace(/^Explore /, "");
    await button.click();
    const dialog = page.getByRole("dialog", { name: title });
    await expect(
      dialog.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    // Every fact is readable at once; nothing is paged.
    for (const label of ["Problem", "Approach", "Build", "Evidence", "Limits", "What's next"])
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /page/i })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(button).toBeFocused();
  }
  for (const button of await page
    .getByRole("button", { name: /^Read case:/ })
    .all()) {
    await button.click();
    const dialog = page.getByRole("dialog");
    for (const label of ["Goal", "My role", "Execution", "Outcomes", "Disclosure"])
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await expect(page).toHaveURL(/\/en$/);
});

test("portrait, contact links and language switch work", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en");
  await page
    .getByRole("button", { name: "About Tak Chanwoo", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("img", { name: "Tak Chanwoo", exact: true }),
  ).toHaveAttribute("src", /operator-portrait/);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Links / Contact" }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "KakaoTalk · trialhero", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "trialhero",
  );
  await expect(page.locator('a[href="https://t.me/nimdal"]')).toBeVisible();
  await expect(
    page.locator('a[href="mailto:admin@fiveovertwo.xyz"]'),
  ).toBeVisible();
  await page.getByRole("link", { name: "한국어로 전환" }).click();
  await expect(page).toHaveURL(/\/ko$/);
  await expect(
    page.getByRole("heading", { name: "개인 프로젝트", exact: true }),
  ).toBeVisible();
});

test("AI chooser opens provider links with the same copyable prompt without calling the site API", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  let calls = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/assistant")) calls++;
  });
  await page.goto("/en");
  const toggle = page.getByRole("button", { name: "Ask an AI about Nimdal" });
  await toggle.click();
  const panel = page.getByRole("dialog", { name: "Choose an AI" });
  await expect(panel.getByRole("link")).toHaveCount(4);
  for (const name of ["ChatGPT", "Claude", "Gemini", "Perplexity"]) {
    const link = panel.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("target", "_blank");
    const url = new URL((await link.getAttribute("href"))!);
    expect(url.searchParams.get("q")).toContain("https://nimdal.xyz/en");
    expect(url.searchParams.get("q")).toContain("myLoL is a hobby project");
  }
  await panel.getByRole("button", { name: "Copy the prompt instead" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(
    new URL(
      (await panel
        .getByRole("link", { name: "ChatGPT", exact: true })
        .getAttribute("href"))!,
    ).searchParams.get("q"),
  );
  await context.route("https://chatgpt.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>External assistant</title>",
    }),
  );
  const popupPromise = context.waitForEvent("page");
  await panel.getByRole("link", { name: "ChatGPT", exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(new URL(popup.url()).searchParams.get("q")).toBe(copied);
  await popup.close();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole("heading", { name: "Nimdal", exact: true }).click();
  await expect(panel).toHaveCount(0);
  expect(calls).toBe(0);
});

test("retired projects, blog links and hobby career entries are not public", async ({
  page,
  request,
}) => {
  for (const locale of ["en", "ko"]) {
    await page.goto("/" + locale);
    const featured = page.locator('section[aria-labelledby="featured-title"]');
    const personal = page.locator('section[aria-labelledby="projects-title"]');
    await expect(featured.getByRole("heading", { name: "AlphaDuo", exact: true })).toBeVisible();
    await expect(featured.locator("img")).toHaveAttribute("alt", /AlphaDuo/);
    await expect(personal.getByRole("heading", { level: 3 })).toHaveText(["myLoL", "HyperAlphaDuo"]);
    await expect(personal).toContainText("02");
    await featured.getByRole("button").click();
    await expect(page.getByRole("dialog").locator('a[href="https://alphaduo.pro"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.locator('a[href*="blog.nimdal.xyz"], a[href$="/blog"]'),
    ).toHaveCount(0);
    const background = page.getByRole("region", {
      name: locale === "en" ? "Background" : "걸어온 길",
      exact: true,
    });
    await expect(
      background.getByRole("heading", { name: "myLoL", exact: true }),
    ).toHaveCount(0);
    const labResponse = await request.get("/" + locale + "/lab");
    expect(labResponse.status()).toBe(404);
    const response = await request.get("/" + locale + "/projects/maple-union");
    expect(response.status()).toBe(404);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/projects/maple-union");
});

for (const width of [390, 1440]) {
  test(`${width}px layout, dialog and accessibility`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await expect(page.locator(".scroll-progress")).toBeHidden();
    const overflow = () =>
      page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
    expect(await overflow()).toBe(false);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`profile-${width}.png`),
    });
    await page
      .getByRole("button", { name: "Explore AlphaDuo", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeInViewport();
    await expect(dialog.getByText("Problem", { exact: true })).toBeVisible();
    expect(await overflow()).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`profile-detail-${width}.png`),
    });
    const dialogResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      dialogResults.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      ),
    ).toEqual([]);
    await page.keyboard.press("Tab");
    expect(
      await page
        .locator(":focus")
        .evaluate((el) => Boolean(el.closest("dialog"))),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Ask an AI about Nimdal" }).click();
    await expect(
      page.getByRole("dialog", { name: "Choose an AI" }),
    ).toBeInViewport();
    expect(await overflow()).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`profile-chat-${width}.png`),
    });
  });
}
