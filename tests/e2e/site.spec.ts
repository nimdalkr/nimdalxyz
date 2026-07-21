import AxeBuilder from "@axe-core/playwright";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type Page
} from "@playwright/test";

const BLOG_HOST = "blog.nimdal.xyz";
const BLOG_HEADERS = {
  host: BLOG_HOST,
  "x-forwarded-host": BLOG_HOST
};
const POST_SLUG = "nimdal-logbook";

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
  for (const pathname of [
    "/ko/projects/alphaduo",
    "/ko/portfolio",
    "/ko/lab"
  ]) {
    test(`locale switch keeps the equivalent path for ${pathname}`, async ({ page }) => {
      await page.goto(pathname);

      const expectedPath = pathname.replace(/^\/ko/, "/en");
      const languageNavigation = page.getByRole("navigation", { name: /Language|언어 선택/ });
      const englishLink = languageNavigation.getByRole("link", { name: "EN", exact: true });

      await expect(englishLink).toHaveAttribute("href", expectedPath);
      await englishLink.click();
      await expect(page).toHaveURL(new RegExp(`${expectedPath.replaceAll("/", "\\/")}/?$`));
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  }

  test("project pages expose canonical and hreflang URLs", async ({ page }) => {
    await page.goto("/ko/projects/alphaduo");

    await expectAlternates(page, {
      canonical: "https://nimdal.xyz/ko/projects/alphaduo",
      ko: "https://nimdal.xyz/ko/projects/alphaduo",
      en: "https://nimdal.xyz/en/projects/alphaduo",
      default: "https://nimdal.xyz/ko/projects/alphaduo"
    });
  });

  test("operator dossier exposes corrected localized canonical URLs", async ({ page }) => {
    await page.goto("/en/portfolio");

    await expectAlternates(page, {
      canonical: "https://nimdal.xyz/en/portfolio",
      ko: "https://nimdal.xyz/ko/portfolio",
      en: "https://nimdal.xyz/en/portfolio",
      default: "https://nimdal.xyz/ko/portfolio"
    });
  });

  test("blog post metadata and locale link stay on the blog canonical surface", async ({
    page,
    request,
    baseURL
  }) => {
    const response = await blogHostGet(
      request,
      baseURL,
      `/ko/posts/${POST_SLUG}`
    );
    expect(response.status()).toBe(200);

    await page.setContent(await response.text(), { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("Nimdal이 블로그를 만든 이유 — Nimdal");
    await expect(page.locator("article article")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "블로그 홈" })).toBeVisible();
    await expect(page.getByText("NIMDAL / BLOG", { exact: true })).toBeVisible();
    await expectAlternates(page, {
      canonical: `https://${BLOG_HOST}/ko/posts/${POST_SLUG}`,
      ko: `https://${BLOG_HOST}/ko/posts/${POST_SLUG}`,
      en: `https://${BLOG_HOST}/en/posts/${POST_SLUG}`,
      default: `https://${BLOG_HOST}/ko/posts/${POST_SLUG}`
    });
    await expect(page.locator('a[lang="en"]')).toHaveAttribute(
      "href",
      `https://${BLOG_HOST}/en/posts/${POST_SLUG}`
    );
  });
});

test.describe("legacy routing and host surfaces", () => {
  test("legacy portfolio route permanently redirects to the localized dossier", async ({
    request,
    baseURL
  }) => {
    const response = await request.get(localUrl(baseURL, "/portfolio"), {
      maxRedirects: 0
    });

    await expectPermanentRedirect(response, baseURL, {
      pathname: "/ko/portfolio"
    });
  });

  test("legacy project rooms permanently redirect to canonical anchors", async ({
    request,
    baseURL
  }) => {
    const cases = [
      {
        from: "/projects/arcdu-nft/proof",
        pathname: "/ko/projects/alphaduo",
        hash: "#proof"
      },
      {
        from: "/en/projects/arcdu-nft/next",
        pathname: "/en/projects/alphaduo",
        hash: "#next"
      },
      {
        from: "/projects/hyperalphaduo/build",
        pathname: "/ko/projects/hyperalphaduo",
        hash: "#build"
      }
    ] as const;

    for (const route of cases) {
      const response = await request.get(localUrl(baseURL, route.from), {
        maxRedirects: 0
      });
      await expectPermanentRedirect(response, baseURL, route);
    }
  });

  test("legacy project query links normalize AlphaDuo and preserve the room anchor", async ({
    request,
    baseURL
  }) => {
    const response = await request.get(
      localUrl(baseURL, "/en?project=arcdu-nft&room=proof"),
      { maxRedirects: 0 }
    );

    await expectPermanentRedirect(response, baseURL, {
      pathname: "/en/projects/alphaduo",
      hash: "#proof"
    });
  });

  test("legacy hash links use the client compatibility bridge", async ({ page }) => {
    await page.goto("/ko#project-arcdu-nft-room-proof");

    await expect(page).toHaveURL(/\/ko\/projects\/alphaduo#proof$/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1, name: "AlphaDuo" })).toBeVisible();
  });

  test("room-less legacy project hashes default to the signal anchor", async ({ page }) => {
    await page.goto("/ko#project-arcdu-nft");

    await expect(page).toHaveURL(/\/ko\/projects\/alphaduo#signal$/, { timeout: 15_000 });
  });

  test("blog host rewrites localized hubs and publishes blog canonicals", async ({
    page,
    request,
    baseURL
  }) => {
    const response = await blogHostGet(request, baseURL, "/ko");
    expect(response.status()).toBe(200);

    await page.setContent(await response.text(), { waitUntil: "domcontentloaded" });
    await expect(page.locator("main h1")).toHaveText("만들고 운영하며 남긴 기록");
    await expect(page).toHaveTitle("만들고 운영하며 남긴 기록 — Nimdal");
    await expectAlternates(page, {
      canonical: `https://${BLOG_HOST}/ko`,
      ko: `https://${BLOG_HOST}/ko`,
      en: `https://${BLOG_HOST}/en`,
      default: `https://${BLOG_HOST}/ko`
    });
  });

  test("old blog-host paths permanently redirect to the Korean localized surface", async ({
    request,
    baseURL
  }) => {
    const cases = [
      { from: "/", pathname: "/ko" },
      {
        from: `/posts/${POST_SLUG}?utm_source=legacy`,
        pathname: `/ko/posts/${POST_SLUG}`,
        search: "?utm_source=legacy"
      },
      {
        from: `/blog/posts/${POST_SLUG}`,
        pathname: `/ko/posts/${POST_SLUG}`
      },
      { from: "/ko/blog", pathname: "/ko" },
      { from: "/rss.xml", pathname: "/ko/rss.xml" }
    ] as const;

    for (const route of cases) {
      const response = await blogHostGet(request, baseURL, route.from, 0);
      await expectPermanentRedirect(response, baseURL, {
        pathname: route.pathname,
        search: "search" in route ? route.search : "",
        hostname: BLOG_HOST
      });
    }
  });

  test("main-host blog post and feed URLs permanently redirect to the blog host", async ({
    request,
    baseURL
  }) => {
    for (const route of [
      `/posts/${POST_SLUG}`,
      `/ko/posts/${POST_SLUG}`,
      "/ko/rss.xml",
      "/ko/blog"
    ]) {
      const response = await request.get(localUrl(baseURL, route), { maxRedirects: 0 });
      const expectedPath = route === "/ko/blog"
        ? "/ko"
        : route.startsWith("/posts/")
          ? `/ko${route}`
          : route;

      await expectPermanentRedirect(response, baseURL, {
        pathname: expectedPath,
        hostname: BLOG_HOST
      });
    }
  });

  test("draft posts return 404 and stay out of RSS and sitemap", async ({
    request,
    baseURL
  }) => {
    const draftSlug = `e2e-draft-${process.pid}`;
    const draftDirectory = path.join(process.cwd(), "content/blog/posts", draftSlug);

    await mkdir(draftDirectory);

    try {
      await Promise.all([
        writeFile(
          path.join(draftDirectory, "index.yaml"),
          `slug: ${draftSlug}\nstatus: draft\npublishedAt: 2026-07-20\nupdatedAt: 2026-07-20\ncover: /media/identity-octopus.jpg\ncoverWidth: 400\ncoverHeight: 400\nko:\n  title: E2E 비공개 초안\n  description: 공개 경로 제외 검사용 초안입니다.\n  category: 테스트\n  tags:\n    - 테스트\n  readingTime: 1분\nen:\n  title: E2E private draft\n  description: A draft fixture for public-route exclusion checks.\n  category: Test\n  tags:\n    - Test\n  readingTime: 1 min read\n`,
          "utf8"
        ),
        writeFile(path.join(draftDirectory, "bodyKo.md"), "공개되면 안 되는 초안입니다.\n", "utf8"),
        writeFile(path.join(draftDirectory, "bodyEn.md"), "This draft must stay private.\n", "utf8")
      ]);

      const draftResponse = await blogHostGet(request, baseURL, `/ko/posts/${draftSlug}`);
      const koreanFeedResponse = await blogHostGet(request, baseURL, "/ko/rss.xml");
      const englishFeedResponse = await blogHostGet(request, baseURL, "/en/rss.xml");
      const sitemapResponse = await blogHostGet(request, baseURL, "/sitemap.xml");

      expect(draftResponse.status()).toBe(404);
      expect(koreanFeedResponse.status()).toBe(200);
      expect(englishFeedResponse.status()).toBe(200);
      expect(sitemapResponse.status()).toBe(200);
      expect(await koreanFeedResponse.text()).not.toContain(draftSlug);
      expect(await englishFeedResponse.text()).not.toContain(draftSlug);
      expect(await sitemapResponse.text()).not.toContain(draftSlug);
    } finally {
      await rm(draftDirectory, { force: true, recursive: true });
    }
  });

  test("localized RSS feeds return the matching language and canonical item URLs", async ({
    request,
    baseURL
  }) => {
    for (const locale of ["ko", "en"] as const) {
      const response = await blogHostGet(request, baseURL, `/${locale}/rss.xml`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/rss+xml");

      const xml = await response.text();
      expect(xml).toContain(
        `<atom:link href="https://${BLOG_HOST}/${locale}/rss.xml" rel="self" type="application/rss+xml" />`
      );
      expect(xml).toContain(`<language>${locale === "ko" ? "ko-KR" : "en"}</language>`);
      expect(xml).toContain(`https://${BLOG_HOST}/${locale}/posts/${POST_SLUG}`);
      expect(xml.match(/<item>/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
    }
  });

  test("blog robots protects the writer and sitemap contains only public routes", async ({
    request,
    baseURL
  }) => {
    const robotsResponse = await blogHostGet(request, baseURL, "/robots.txt");
    expect(robotsResponse.status()).toBe(200);
    const robots = await robotsResponse.text();
    expect(robots).toContain("Disallow: /write");
    expect(robots).toContain("Disallow: /api/auth");
    expect(robots).toContain(`Sitemap: https://${BLOG_HOST}/sitemap.xml`);

    const sitemapResponse = await blogHostGet(request, baseURL, "/sitemap.xml");
    expect(sitemapResponse.status()).toBe(200);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).toContain(`https://${BLOG_HOST}/ko/posts/${POST_SLUG}`);
    expect(sitemap).toContain(`https://${BLOG_HOST}/en/posts/${POST_SLUG}`);
    expect(sitemap).not.toContain("/write");
    expect(sitemap).not.toContain("/api/auth");
  });
});

test.describe("public links and not-found behavior", () => {
  test("the custom BLOG writer fails closed when Google OAuth is not configured", async ({
    page
  }) => {
    const response = await page.goto("/write");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/write\/login$/);
    await expect(page.getByRole("heading", { name: "글쓰기" })).toBeVisible();
    await expect(page.getByRole("status")).toContainText("인증 환경 설정이 완료되지 않았습니다");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
  });

  test("the BLOG editor is mounted in local development", async ({ page }) => {
    const response = await page.goto("/keystatic");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Nimdal BLOG Editor/);
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();

    await page.goto("/keystatic/collection/posts");
    for (const slug of [
      "nimdal-logbook",
      "research-tools-should-make-markets-readable",
      "campaign-operations-to-product-systems"
    ]) {
      await expect(page.getByText(slug, { exact: true }).first()).toBeVisible();
    }

    await page.goto("/keystatic/collection/posts/item/nimdal-logbook");
    await expect(page.locator('input[value="Nimdal이 블로그를 만든 이유"]')).toBeVisible();
    await expect(page.getByText("한국어 본문", { exact: true })).toBeVisible();
    await expect(page.getByText("English body", { exact: true })).toBeVisible();
  });

  test("home and dossier retain the intended external contact links without a phone number", async ({
    page
  }) => {
    await page.goto("/ko");

    await expect(page.locator('a[href="/ko/projects/alphaduo"]')).toBeVisible();
    await expect(page.locator('a[href="mailto:0xnimdal@gmail.com"]')).toBeVisible();
    await expect(page.locator('a[href="https://x.com/0xnimdal"]')).toBeVisible();
    await expect(page.locator('a[href="https://t.me/nimdal"]')).toBeVisible();
    await expect(
      page.locator('a[href="https://linkedin.com/in/chanwoo-tak-132b281a4"]')
    ).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);

    await page.goto("/en/portfolio");
    await expect(page.locator('a[href="mailto:0xnimdal@gmail.com"]')).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });

  test("project evidence pages expose exact live and repository destinations", async ({
    page
  }) => {
    await page.goto("/en/projects/alphaduo");
    await expect(page.locator('a[href="https://alphaduo.pro"]')).toHaveAttribute(
      "target",
      "_blank"
    );

    await page.goto("/en/projects/ethosalpha");
    await expect(
      page.locator('a[href="https://github.com/nimdalkr/ethoskaito"]')
    ).toHaveAttribute("target", "_blank");
  });

  test("invalid project and post slugs return 404", async ({ page, request, baseURL }) => {
    const projectResponse = await page.goto("/ko/projects/not-a-real-project");
    expect(projectResponse?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다." })).toBeVisible({
      timeout: 15_000
    });

    const postResponse = await blogHostGet(
      request,
      baseURL,
      "/en/posts/not-a-real-post"
    );
    expect(postResponse.status()).toBe(404);
  });
});

test.describe("responsive and accessible interaction", () => {
  test("390px navigation is operable and visible touch targets are at least 44px square", async ({
    page
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ko");

    const navigation = page.getByRole("navigation", { name: "주요 메뉴" });
    await expect(navigation.getByRole("link", { name: "WORK" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "BLOG" })).toBeVisible();
    await expect(navigation.getByRole("link", { name: "ABOUT" })).toBeHidden();
    await expect(navigation.getByRole("link", { name: "CAREER" })).toBeHidden();
    await expect(navigation.getByRole("link", { name: "CONTACT" })).toBeHidden();

    const targets = navigation.locator("a");
    const count = await targets.count();

    for (let index = 0; index < count; index += 1) {
      const target = targets.nth(index);
      if (!(await target.isVisible())) continue;

      const box = await target.boundingBox();
      expect(box, `touch target ${index} should have a bounding box`).not.toBeNull();
      expect(box?.width ?? 0, `touch target ${index} should be at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0, `touch target ${index} should be at least 44px high`).toBeGreaterThanOrEqual(44);
    }

    await navigation.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("390px BLOG links keep 44px touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://blog.localhost:3000/ko");

    const targets = page.locator("a");
    const count = await targets.count();

    for (let index = 0; index < count; index += 1) {
      const target = targets.nth(index);
      if (!(await target.isVisible())) continue;

      const box = await target.boundingBox();
      expect(box, `BLOG touch target ${index} should have a bounding box`).not.toBeNull();
      expect(box?.width ?? 0, `BLOG touch target ${index} should be at least 44px wide`).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0, `BLOG touch target ${index} should be at least 44px high`).toBeGreaterThanOrEqual(44);
    }
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
    await expect(page.locator(":focus")).toHaveAttribute("href", "/ko");
  });

  test("reduced-motion mode removes the progress layer and renders reveals statically", async ({
    page
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ko");

    await expect(page.locator(".scroll-progress")).toBeHidden();
    await expect(page.locator(".cinema-track")).toHaveCount(0);
    await expect(page.locator(".pp-intro-track")).toBeVisible();
    await expect(page.locator(".pp-about")).toBeVisible();
    const staticStory = page.locator(".cinema-static-story");
    await expect(staticStory).toBeVisible();
    await expect(staticStory.locator(".cinema-static-scene")).toHaveCount(3);
    await expect(page.locator(".pp-career")).toBeVisible();
    await expect(page.locator(".pp-blog")).toBeVisible();
    await expect(page.locator(".pp-contact")).toBeVisible();

    const motionStyles = await staticStory.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationDuration: style.animationDuration,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        transitionDuration: style.transitionDuration
      };
    });

    expect(motionStyles.scrollBehavior).toBe("auto");
    const durationInSeconds = (value: string) => {
      const firstDuration = value.split(",")[0]?.trim() ?? "0s";
      return firstDuration.endsWith("ms")
        ? Number.parseFloat(firstDuration) / 1000
        : Number.parseFloat(firstDuration);
    };

    expect(durationInSeconds(motionStyles.animationDuration)).toBeLessThanOrEqual(0.00001);
    expect(durationInSeconds(motionStyles.transitionDuration)).toBeLessThanOrEqual(0.00001);
  });

  test("200% text-zoom reflow heuristic does not introduce horizontal scrolling", async ({
    page
  }) => {
    await page.setViewportSize({ width: 640, height: 900 });

    for (const pathname of ["/ko", "/ko/projects/alphaduo", "/ko/portfolio"]) {
      await page.goto(pathname);
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
    }
  });

  for (const pathname of [
    "/ko",
    "/ko/projects/alphaduo",
    "/ko/portfolio",
    "/ko/lab"
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

  test("axe finds no serious or critical issues on the blog host", async ({ page }) => {
    const response = await page.goto("http://blog.localhost:3000/ko");
    expect(response?.status()).toBe(200);

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
