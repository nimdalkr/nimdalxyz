import { expect, test } from "@playwright/test";

test("standalone portfolio pages are unavailable on all hosts, including RSC requests", async ({ request }) => {
  const paths = [
    "/ko/portfolio", "/en/projects/alphaduo", "/en/projects/alphaduo/proof",
    "/ko/projects/hyperalphaduo", "/en/projects/mylol", "/en/about", "/ko/lab",
    "/portfolio", "/protfolio", "/projects/arcdu-nft/proof", "/about", "/lab",
    "/ko/portfolio/", "/ko/%70ortfolio", "/ko/portfolio.rsc"
  ];
  const headerVariants: Record<string, string>[] = [
    {},
    { host: "blog.nimdal.xyz", "x-forwarded-host": "blog.nimdal.xyz" },
    { host: "nimdalxyz.vercel.app", "x-forwarded-host": "nimdalxyz.vercel.app" },
    { RSC: "1", "Next-Router-Prefetch": "1" }
  ];
  for (const headers of headerVariants) {
    for (const pathname of paths) {
      // Next normalizes a trailing slash before the proxy runs.
      const response = await request.get(pathname + "?_rsc=check", { headers, maxRedirects: pathname.endsWith("/") ? 1 : 0 });
      expect(response.status(), pathname).toBe(404);
      expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
      expect(response.headers().location).toBeUndefined();
      expect(await response.text()).toBe("Not found");
    }
  }
});

test("the portfolio sitemap lists only its two localized homepages", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).toEqual([
    "https://nimdal.xyz/ko", "https://nimdal.xyz/en"
  ]);
  for (const path of ["/about", "/lab", "/portfolio", "/projects/"]) {
    expect(xml).not.toContain(path);
  }
});
