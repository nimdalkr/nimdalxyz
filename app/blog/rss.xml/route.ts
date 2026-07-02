import { getBlogPosts } from "@/content/blog/posts";
import { absoluteBlogUrl, siteConfig } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getBlogPosts();
  const items = posts
    .map((post) => {
      const pubDate = new Date(post.publishedAt).toUTCString();

      return `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${escapeXml(post.canonicalUrl)}</link>
          <guid>${escapeXml(post.canonicalUrl)}</guid>
          <pubDate>${pubDate}</pubDate>
          <description>${escapeXml(post.description)}</description>
          ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(siteConfig.blogName)}</title>
        <link>${escapeXml(absoluteBlogUrl("/"))}</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en</language>
        <managingEditor>${escapeXml(siteConfig.email)} (${escapeXml(siteConfig.author)})</managingEditor>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
