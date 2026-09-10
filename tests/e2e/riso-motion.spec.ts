import { expect, test } from "@playwright/test";

test("home remains readable when scrolling with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  for (const name of ["Featured", "Personal projects", "Selected career work", "Background", "Links / Contact"]) {
    const section = page.getByRole("region", { name, exact: true });
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  }
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await page.getByRole("button", { name: "Ask an AI about Nimdal" }).click();
  await expect(page.getByRole("dialog", { name: "Choose an AI" })).toBeVisible();
});
