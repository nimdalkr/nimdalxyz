import { expect, test } from "@playwright/test";

/**
 * Contrast has to hold on both stocks, and the accent is the trap: it is a
 * plate colour, not a type colour, and any softened ink laid over it composites
 * down below AA. Alpha is resolved here rather than compared raw, which is the
 * check that caught the accent flood.
 */
const PAGES = ["/ko", "/en", "/en/about", "/en/portfolio", "/en/lab", "/en/projects/hyperalphaduo"];

const AUDIT = `(() => {
  const parse = (value) => {
    const parts = value.match(/[\\d.]+/g).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1
  });
  const lum = (c) => {
    const f = (channel) => {
      const s = channel / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const out = [];
  document.querySelectorAll('main *, .masthead *, .colophon *, .articleMain *').forEach((el) => {
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || !cs.color) return;
    let bgRaw = cs.backgroundColor;
    let node = el;
    while (parse(bgRaw).a === 0 && node.parentElement) {
      node = node.parentElement;
      bgRaw = getComputedStyle(node).backgroundColor;
    }
    const bg = parse(bgRaw);
    if (bg.a === 0) return;
    const fg = over(parse(cs.color), bg);
    const L1 = lum(fg);
    const L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const large = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      out.push(el.className + ' | "' + el.innerText.slice(0, 24) + '" | ' + ratio.toFixed(2) + ' < ' + need);
    }
  });
  return out;
})()`;

for (const path of PAGES) {
  test(`contrast holds on both stocks for ${path}`, async ({ page }) => {
    await page.goto(path);

    for (const stock of ["paper", "black"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.stock = value;
      }, stock);
      const failures = await page.evaluate(AUDIT);
      expect(failures, `${path} on ${stock} stock`).toEqual([]);
    }
  });
}
