import { blogPosts } from "@/lib/content";
import {
  blogCanonicalUrl,
  hreflangAlternates,
  locales,
  tagSlug,
  type Locale
} from "@/lib/seo";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type SitemapUrl = {
  locale: Locale;
  pathname: string;
  lastModified: string;
};

function urlElement({ locale, pathname, lastModified }: SitemapUrl) {
  const alternates = hreflangAlternates(pathname, "blog");

  return `<url>
    <loc>${escapeXml(blogCanonicalUrl(locale, pathname))}</loc>
    <lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>
    ${Object.entries(alternates)
      .map(
        ([hreflang, href]) =>
          `<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`
      )
      .join("")}
  </url>`;
}

export function GET() {
  const latestPostUpdate = blogPosts.reduce(
    (latest, post) => (Date.parse(post.updatedAt) > Date.parse(latest) ? post.updatedAt : latest),
    blogPosts[0]?.updatedAt ?? "2026-07-02"
  );
  const tagUpdates = new Map<string, string>();

  for (const post of blogPosts) {
    for (const tag of post.copy.en.tags) {
      const slug = tagSlug(tag);
      const currentUpdate = tagUpdates.get(slug);

      if (!currentUpdate || Date.parse(post.updatedAt) > Date.parse(currentUpdate)) {
        tagUpdates.set(slug, post.updatedAt);
      }
    }
  }

  const urls: SitemapUrl[] = locales.flatMap((locale) => [
    {
      locale,
      pathname: "/",
      lastModified: latestPostUpdate
    },
    ...blogPosts.map((post) => ({
      locale,
      pathname: `/posts/${post.slug}`,
      lastModified: post.updatedAt
    })),
    ...[...tagUpdates].map(([slug, lastModified]) => ({
      locale,
      pathname: `/tags/${slug}`,
      lastModified
    }))
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls.map(urlElement).join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
