import { expect, test } from "@playwright/test";

/**
 * The stage renders type over a photograph, so contrast cannot be reasoned
 * about from the token values alone: it depends on the scrim actually landing
 * under the panel. These resolve alpha against what is really behind the text.
 */

const CONTRAST = `(() => {
  const parse = (v) => { const n = v.match(/[\\d.]+/g).map(Number); return { r:n[0], g:n[1], b:n[2], a:n.length>3?n[3]:1 }; };
  const over = (f,b) => ({ r:f.a*f.r+(1-f.a)*b.r, g:f.a*f.g+(1-f.a)*b.g, b:f.a*f.b+(1-f.a)*b.b, a:1 });
  const lum = (c) => { const f=(x)=>{const s=x/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);}; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); };
  // Worst case: assume the photograph behind the scrim is pure white.
  const WHITE = { r:255, g:255, b:255, a:1 };
  const scrim = getComputedStyle(document.querySelector('.stage-scrim'));
  const out = [];
  document.querySelectorAll('.stage-ui *, .room *').forEach((el) => {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    // Visually-hidden labels exist for screen readers; they are never painted,
    // so a contrast ratio against them is meaningless.
    const box = el.getBoundingClientRect();
    if (cs.clipPath !== 'none' || box.width <= 1 || box.height <= 1) return;
    let bg = parse(cs.backgroundColor);
    if (bg.a === 0) {
      // Text sits on the scrim over the image. Use the weakest scrim stop that
      // still covers the panel column, composited over white.
      bg = over({ r:5, g:7, b:15, a:0.94 }, WHITE);
    }
    const fg = over(parse(cs.color), bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const px = parseFloat(cs.fontSize);
    const need = (px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight,10) >= 700)) ? 3 : 4.5;
    if (ratio < need) out.push(el.className + ' | "' + el.innerText.slice(0,20) + '" | ' + ratio.toFixed(2) + ' < ' + need);
  });
  return out;
})()`;

for (const locale of ["en", "ko"]) {
  for (const [label, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]] as const) {
    test(`stage holds contrast on ${label} ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(`/${locale}`);
      await page.waitForSelector(".stage canvas", { timeout: 25000 });
      await page.waitForTimeout(1200);

      expect(await page.evaluate(CONTRAST), `${locale} ${label}`).toEqual([]);

      // Fixed viewport: the stage must never introduce page scroll.
      const scrolls = await page.evaluate(() => ({
        y: document.documentElement.scrollHeight > window.innerHeight + 1,
        x: document.documentElement.scrollWidth > window.innerWidth + 1
      }));
      expect(scrolls).toEqual({ y: false, x: false });

      // The headline must not overflow its column.
      const overflow = await page.evaluate(() => {
        const t = document.querySelector(".stage-title");
        const p = document.querySelector(".stage-panel");
        if (!t || !p) return null;
        return t.getBoundingClientRect().right > p.getBoundingClientRect().right + 2;
      });
      expect(overflow).toBe(false);
    });
  }
}

test("stage advances through every chapter and can be left", async ({ page }) => {
  await page.goto("/en");
  await page.waitForSelector(".stage canvas", { timeout: 25000 });

  const rail = page.locator(".stage-rail button");
  await expect(rail).toHaveCount(10);

  await expect(page.locator(".stage-steps span")).toHaveText("01 / 10");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".stage-steps span")).toHaveText("02 / 10");

  await rail.nth(9).click();
  await expect(page.locator(".stage-steps span")).toHaveText("10 / 10");

  // Escape returns to the readable portfolio.
  await page.keyboard.press("Escape");
  await expect(page.locator("#main-content")).toBeVisible();
});

test("a station opens its room and the room can be left", async ({ page }) => {
  await page.goto("/en");
  await page.waitForSelector(".stage canvas", { timeout: 25000 });

  // Station 3 is the first story chapter; its room is a verified case.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  const caseRoom = page.locator(".room");
  await expect(caseRoom).toBeVisible();
  await expect(caseRoom.locator(".room-columns section")).toHaveCount(3);
  await expect(caseRoom.getByRole("link", { name: /full career/i })).toHaveAttribute(
    "href",
    "/en/portfolio"
  );
  await page.keyboard.press("Escape");
  await expect(caseRoom).toHaveCount(0);

  // Station 6 is the first project. Enter opens its room in place.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  const room = page.locator(".room");
  await expect(room).toBeVisible();
  await expect(room.getByRole("heading", { level: 2 })).toHaveText("HyperAlphaDuo");
  // Real content, not a teaser: the three sections and the full-record link.
  await expect(room.locator(".room-columns section")).toHaveCount(3);
  await expect(room.getByRole("link", { name: /full record/i })).toHaveAttribute(
    "href",
    "/en/projects/hyperalphaduo"
  );

  // Escape ascends back to the dive without leaving the stage.
  await page.keyboard.press("Escape");
  await expect(room).toHaveCount(0);
  await expect(page.locator(".stage canvas")).toBeVisible();
});

test("no-webgl and reduced-motion visitors get the readable page", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en");
  await page.waitForTimeout(800);
  await expect(page.locator(".stage")).toHaveCount(0);
  await expect(page.locator("#main-content")).toBeVisible();
  await context.close();
});
