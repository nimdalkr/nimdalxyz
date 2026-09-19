import { getLocalizedBlogPosts } from "@/content/blog/posts";
import { isLocale, locales, siteContent } from "@/lib/content";
import { blogCanonicalUrl, type Locale } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type RouteContext = {
  params: Promise<{ locale: string }>;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function rssDocument(locale: Locale) {
  const channelUrl = blogCanonicalUrl(locale);
  const feedUrl = blogCanonicalUrl(locale, "/rss.xml");
  const copy = siteContent[locale].blog;
  const posts = await getLocalizedBlogPosts(locale);
  const latestUpdate = posts.reduce(
    (latest, post) => Math.max(latest, Date.parse(post.updatedAt)),
    0
  );
  const items = posts
    .map((post) => {
      const canonicalUrl = blogCanonicalUrl(locale, `/posts/${post.slug}`);

      return `<item>
        <title>${escapeXml(post.title)}</title>
        <link>${escapeXml(canonicalUrl)}</link>
        <guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <description>${escapeXml(post.description)}</description>
        ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
      </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(copy.title)}</title>
    <link>${escapeXml(channelUrl)}</link>
    <description>${escapeXml(copy.description)}</description>
    <language>${locale === "ko" ? "ko-KR" : "en"}</language>
    <lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>
    <managingEditor>${escapeXml(siteConfig.email)} (${escapeXml(siteConfig.author)})</managingEditor>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(await rssDocument(locale), {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
