import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("profile is server-rendered with identity, career since 2012, and real media", async ({
  page,
  request,
}, testInfo) => {
  const response = await request.get("/en");
  const html = await response.text();
  expect(html).toContain("Makorang Lab");
  expect(html).toContain("2012");
  expect(html).toContain("FIVE OVER TWO");
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
  ).toHaveCount(8);
  await expect(page.getByRole("button", { name: /^Read case:/ })).toHaveCount(
    6,
  );
  await expect(
    page.locator(
      'a[href*="/en/projects/"], a[href*="/en/portfolio"], a[href*="/en/lab"]',
    ),
  ).toHaveCount(0);
  const images = page.locator("main img");
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

test("all nine projects and career cases open in paginated, keyboard-accessible dialogs", async ({
  page,
}) => {
  await page.goto("/en");
  await page
    .getByRole("button", { name: "All personal projects", exact: true })
    .click();
  const projects = page.getByRole("button", { name: /^Explore / });
  await expect(projects).toHaveCount(9);
  for (const button of await projects.all()) {
    await button.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Overview", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    for (let i = 0; i < 6; i++)
      await dialog.getByRole("button", { name: "Next page" }).click();
    await expect(
      dialog.getByRole("heading", { name: "What's next", exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  }
  for (const button of await page
    .getByRole("button", { name: /^Read case:/ })
    .all()) {
    await button.click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: "Overview", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(
      page.getByRole("heading", { name: "The goal", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
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

test("AI sends history, blocks internal questions, handles failure and preserves the chat", async ({
  page,
}, testInfo) => {
  let calls = 0;
  await page.route("**/api/assistant", async (route) => {
    calls++;
    const data = route.request().postDataJSON();
    expect(data.locale).toBe("en");
    if (calls === 1) {
      expect(data.history).toEqual([]);
      await route.fulfill({
        json: { answer: "Nimdal has been building communities since 2012." },
      });
    } else {
      expect(data.history.length).toBeGreaterThan(0);
      await route.fulfill({ status: 502, json: { error: "offline" } });
    }
  });
  await page.goto("/en");
  await page.getByRole("button", { name: "Ask an AI about Nimdal" }).click();
  await expect(
    page.getByRole("button", { name: "Send question" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Who is Nimdal?" }).click();
  await expect(
    page.getByText("Nimdal has been building communities since 2012.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Your question" })
    .fill("Which API model powers you?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(
    page.getByText(/I don’t share internal implementation details/),
  ).toBeVisible();
  expect(calls).toBe(1);
  await page
    .getByRole("textbox", { name: "Your question" })
    .fill("Tell me more about his career");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "KakaoTalk: trialhero",
  );
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Telegram: @nimdal",
  );
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "X: @0xnimdal",
  );
  await page.screenshot({ path: testInfo.outputPath("profile-ai.png") });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Ask an AI about Nimdal" }).click();
  await expect(
    page.getByText("Nimdal has been building communities since 2012.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/gemini/i);
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
    await expect(
      dialog.getByRole("button", { name: "Next page" }),
    ).toBeInViewport();
    await dialog.getByRole("button", { name: "Next page" }).click();
    await expect(
      dialog.getByRole("heading", { name: "The problem", exact: true }),
    ).toBeVisible();
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
      page.getByRole("textbox", { name: "Your question" }),
    ).toBeInViewport();
    expect(await overflow()).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`profile-chat-${width}.png`),
    });
  });
}
