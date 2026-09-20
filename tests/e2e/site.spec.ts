import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page
} from "@playwright/test";

// The home route now mounts the WebGL stage when the device supports it. These
// suites cover the readable portfolio, so they opt into it explicitly.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { window.sessionStorage.setItem("nimdal-atlas-mode", "readable"); } catch {}
  });
});


const BLOG_HOST = "blog.nimdal.xyz";
const BLOG_HEADERS = {
  host: BLOG_HOST,
  "x-forwarded-host": BLOG_HOST
};
const POST_SLUG = "nimdal-logbook";
const MAIN_HOST = "nimdal.xyz";

function localUrl(baseURL: string | undefined, pathname: string) {
  if (!baseURL) {
    throw new Error("Playwright baseURL is required for the E2E suite.");
  }

  return new URL(pathname, baseURL).toString();
}

function redirectTarget(response: APIResponse, baseURL: string | undefined) {
  const location = response.headers().location;
  expect(location, "redirect should include a Location header").toBeTruthy();
  return new URL(location, localUrl(baseURL, "/"));
}

async function expectPermanentRedirect(
  response: APIResponse,
  baseURL: string | undefined,
  expected: { pathname: string; hash?: string; hostname?: string; search?: string }
) {
  expect(response.status()).toBe(308);

  const target = redirectTarget(response, baseURL);
  expect(target.pathname).toBe(expected.pathname);
  expect(target.hash).toBe(expected.hash ?? "");
  expect(target.search).toBe(expected.search ?? "");

  if (expected.hostname) {
    expect(target.hostname).toBe(expected.hostname);
  }
}

async function blogHostGet(
  request: APIRequestContext,
  baseURL: string | undefined,
  pathname: string,
  maxRedirects?: number
) {
  return request.get(localUrl(baseURL, pathname), {
    headers: BLOG_HEADERS,
    ...(maxRedirects === undefined ? {} : { maxRedirects })
  });
}

async function expectAlternates(
  page: Page,
  urls: { canonical: string; ko: string; en: string; default: string }
) {
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    urls.canonical
  );
  await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute(
    "href",
    urls.ko
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    "href",
    urls.en
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]')
  ).toHaveAttribute("href", urls.default);
}

function formatAxeViolations(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]
) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target.map((target) => String(target)))
        .join(", ");
      return `${violation.impact ?? "unknown"}: ${violation.id} (${targets})`;
    })
    .join("\n");
}

test.describe("localized navigation and metadata", () => {
  test("only the profile home exposes portfolio canonical URLs", async ({ page }) => {
    await page.goto("/en");
    await expectAlternates(page, {
      canonical: "https://nimdal.xyz/en",
      ko: "https://nimdal.xyz/ko",
      en: "https://nimdal.xyz/en",
      default: "https://nimdal.xyz/en"
    });
  });

});

test.describe("legacy routing and host surfaces", () => {
  test("main root defaults to the English portfolio", async ({ request, baseURL }) => {
    const response = await request.get(localUrl(baseURL, "/"), { maxRedirects: 0 });

    await expectPermanentRedirect(response, baseURL, { pathname: "/en" });
  });

  test("legacy query links return home and hashes do not open standalone pages", async ({ page, request, baseURL }) => {
    const response = await request.get(localUrl(baseURL, "/en?project=arcdu-nft&room=proof"), { maxRedirects: 0 });
    await expectPermanentRedirect(response, baseURL, { pathname: "/en" });
    await page.goto("/ko#project-arcdu-nft-room-proof");
    await expect(page.locator("[data-profile-home]")).toBeVisible();
    await expect(page).toHaveURL(/\/ko#project-arcdu-nft-room-proof$/);
  });

  test("the retired BLOG host sends every old link to the profile home", async ({
    request,
    baseURL
  }) => {
    const cases = [
      { from: "/", pathname: "/ko" },
      { from: "/ko", pathname: "/ko" },
      { from: "/en", pathname: "/en" },
      { from: `/ko/posts/${POST_SLUG}?utm_source=legacy`, pathname: "/ko" },
      { from: `/en/posts/${POST_SLUG}`, pathname: "/en" },
      { from: `/posts/${POST_SLUG}`, pathname: "/ko" },
      { from: "/ko/tags/research", pathname: "/ko" },
      { from: "/en/rss.xml", pathname: "/en" },
      { from: "/sitemap.xml", pathname: "/ko" },
      { from: "/write", pathname: "/ko" },
      { from: "/api/auth/signin", pathname: "/ko" }
    ] as const;

    for (const route of cases) {
      const response = await blogHostGet(request, baseURL, route.from, 0);
      await expectPermanentRedirect(response, baseURL, {
        pathname: route.pathname,
        hostname: MAIN_HOST
      });
    }
  });

  test("retired BLOG, writer, and editor paths are gone from the main host", async ({
    request,
    baseURL
  }) => {
    for (const route of [
      `/ko/posts/${POST_SLUG}`,
      "/ko/blog",
      "/ko/rss.xml",
      "/rss.xml",
      "/write",
      "/keystatic",
      "/api/auth/session",
      "/api/keystatic/github/login"
    ]) {
      const response = await request.get(localUrl(baseURL, route), { maxRedirects: 0 });
      expect(response.status(), route).toBe(404);
    }
  });
});

test.describe("public links and not-found behavior", () => {
  test("home retains the intended external contact links without a phone number", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator('a[href^="/ko/projects/"]')).toHaveCount(0);
    await expect(page.locator('a[href="mailto:admin@fiveovertwo.xyz"]')).toBeVisible();
    await expect(page.locator('a[href="https://x.com/0xnimdal"]').last()).toBeVisible();
    await expect(page.locator('a[href="https://t.me/nimdal"]')).toBeVisible();
    await expect(page.locator('a[href="https://www.threads.com/@0xnimdal"]')).toBeVisible();
    await expect(page.locator('a[href="https://t.me/alpha_duo"]')).toContainText("알파를 듀오");
    await expect(page.locator('a[href="https://t.me/nimdaltg"]')).toContainText("나의 문어 선생님");
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("home project dialogs retain external destinations", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Explore myLoL", exact: true }).click();
    await expect(page.getByRole("dialog").locator('a[href="https://cafe.naver.com/xavishowtime"]')).toHaveAttribute("target", "_blank");
    await page.keyboard.press("Escape");
    // HyperAlphaDuo is archived and its deployment is paused, so it must not link out to it.
    const archived = page.getByRole("button", { name: "Explore HyperAlphaDuo", exact: true });
    await expect(archived).toContainText("Archived");
    await archived.click();
    await expect(page.getByRole("dialog").locator('a[href*="hyperalphaduo.vercel.app"]')).toHaveCount(0);
  });

  // Profile interaction, assistant, and detail paging coverage lives in profile-home.spec.ts.

  test("retired project pages and unknown paths return 404", async ({ page }) => {
    const projectResponse = await page.goto("/ko/projects/not-a-real-project");
    expect(projectResponse?.status()).toBe(404);
    await expect(page.locator("body")).toHaveText("Not found");

    const unknownResponse = await page.goto("/en/not-a-real-page");
    expect(unknownResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Nimdal" })).toHaveAttribute("href", "/en");
  });
});

test.describe("responsive and accessible interaction", () => {
  test("390px profile navigation and chronology remain accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    const chronology = page.getByRole("region", { name: "Background", exact: true });
    await expect(chronology.getByRole("listitem")).toHaveCount(7);
    for (const name of ["Makorang Lab", "Baboclub", "FIVE OVER TWO"]) {
      await expect(chronology.getByRole("heading", { name, exact: true })).toBeVisible();
    }
    const contact = page.getByRole("link", { name: "Contact", exact: true });
    const box = await contact.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    await page.getByRole("link", { name: "한국어로 전환" }).click();
    await expect(page).toHaveURL(new RegExp("/ko$"));
  });

  test("keyboard focus starts with the skip link and remains visibly outlined", async ({
    page
  }) => {
    await page.goto("/ko");
    await page.keyboard.press("Tab");

    const focused = page.locator(":focus");
    await expect(focused).toHaveClass(/skip-link/);
    await expect(focused).toBeInViewport();

    const focusStyle = await focused.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth)
      };
    });

    expect(focusStyle.outlineStyle).not.toBe("none");
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveAttribute("aria-label", "탁찬우 소개");
  });

  test("reduced-motion mode keeps the profile readable without animated layers", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ko");
    await expect(page.locator(".scroll-progress")).toBeHidden();
    await expect(page.locator("[data-profile-home]")).toBeVisible();
    const button = page.getByRole("button", { name: "탁찬우 소개" });
    await expect(button).toHaveCSS("transition-duration", "0s");
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  });

  test("200% text-zoom reflow heuristic does not introduce horizontal scrolling", async ({
    page
  }) => {
    await page.setViewportSize({ width: 640, height: 900 });

    for (const pathname of ["/ko", "/en"]) {
      await page.goto(pathname);
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));

      expect(
        dimensions.scrollWidth,
        `${pathname} should reflow without horizontal overflow at 200% text zoom`
      ).toBeLessThanOrEqual(dimensions.clientWidth + 1);

      await page.evaluate(() => {
        document.documentElement.style.removeProperty("font-size");
      });
    }
  });

  for (const pathname of [
    "/ko",
    "/en"
  ]) {
    test(`axe finds no serious or critical issues on ${pathname}`, async ({ page }) => {
      await page.goto(pathname);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const blockingViolations = results.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical"
      );

      expect(
        blockingViolations,
        `Blocking accessibility issues:\n${formatAxeViolations(blockingViolations)}`
      ).toEqual([]);
    });
  }

  test("axe finds no serious or critical issues on the 404 page", async ({ page }) => {
    const response = await page.goto("/en/not-a-real-page");
    expect(response?.status()).toBe(404);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical"
    );

    expect(
      blockingViolations,
      `Blocking accessibility issues:\n${formatAxeViolations(blockingViolations)}`
    ).toEqual([]);
  });
});
