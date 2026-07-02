import { getBlogPosts, getBlogTags } from "@/content/blog/posts";
import { absoluteBlogUrl } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const urls = [
    {
      loc: absoluteBlogUrl("/"),
      lastmod: new Date().toISOString()
    },
    ...getBlogPosts().map((post) => ({
      loc: post.canonicalUrl,
      lastmod: new Date(post.updatedAt ?? post.publishedAt).toISOString()
    })),
    ...getBlogTags().map((tag) => ({
      loc: absoluteBlogUrl(`/tags/${tag.slug}`),
      lastmod: new Date().toISOString()
    }))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls
        .map(
          (url) => `
            <url>
              <loc>${escapeXml(url.loc)}</loc>
              <lastmod>${url.lastmod}</lastmod>
            </url>`
        )
        .join("")}
    </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
