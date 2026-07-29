import { expect, test } from "@playwright/test";

/**
 * The design system leans on scroll-driven motion, so these guard the two ways
 * it can silently fail: a reveal that never fires leaves content invisible, and
 * a plate that never registers leaves every image permanently misaligned.
 */
test.describe("riso motion", () => {
  test("scroll reveals bring content in", async ({ page }) => {
    await page.goto("/en");

    const reveal = page.locator("[data-reveal]").first();
    await expect(reveal).toHaveCSS("opacity", "0");

    await reveal.scrollIntoViewIfNeeded();
    await expect(reveal).toHaveCSS("opacity", "1", { timeout: 4000 });
  });

  test("accent plates resolve into registration on scroll", async ({ page }) => {
    await page.goto("/en");

    const plate = page.locator(".feature-plate .riso-plate-flo");
    const offsetAtRest = await plate.evaluate((el) => getComputedStyle(el).transform);
    expect(offsetAtRest).not.toBe("none");

    await page.locator(".feature-plate").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);

    await expect
      .poll(
        async () => {
          const matrix = await plate.evaluate((el) => getComputedStyle(el).transform);
          const parts = matrix.match(/-?\d+\.?\d*/g);
          return parts ? Math.abs(Number(parts[4])) : 999;
        },
        { timeout: 5000 }
      )
      .toBeLessThan(4);
  });

  test("reduced motion keeps everything visible and still", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/en");

    const reveal = page.locator("[data-reveal]").first();
    await expect(reveal).toHaveCSS("opacity", "1");

    const plate = page.locator(".cover-portrait .riso-plate-flo");
    const offset = await plate.evaluate((el) => {
      const parts = getComputedStyle(el).transform.match(/-?\d+\.?\d*/g);
      return parts ? Math.abs(Number(parts[4])) + Math.abs(Number(parts[5])) : 0;
    });
    expect(offset).toBe(0);

    await context.close();
  });

  test("both stocks keep the primary call to action readable", async ({ page }) => {
    await page.goto("/en");

    const cta = page.locator(".cover .btn").first();
    const toggle = page.getByRole("button", { name: /switch to .* stock/i });

    for (let pass = 0; pass < 2; pass += 1) {
      const { color, background } = await cta.evaluate((el) => {
        const cs = getComputedStyle(el);
        let bg = cs.backgroundColor;
        let node: HTMLElement | null = el as HTMLElement;
        while (bg === "rgba(0, 0, 0, 0)" && node?.parentElement) {
          node = node.parentElement;
          bg = getComputedStyle(node).backgroundColor;
        }
        return { color: cs.color, background: bg };
      });

      const luminance = (value: string) => {
        const [r, g, b] = value.match(/\d+/g)!.map(Number).map((channel) => {
          const scaled = channel / 255;
          return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const a = luminance(color);
      const b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);

      await toggle.click();
      await page.waitForTimeout(300);
    }
  });
});
