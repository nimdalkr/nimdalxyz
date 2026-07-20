import { absoluteBlogUrl } from "@/lib/site";

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /keystatic\nDisallow: /api/keystatic\n\nSitemap: ${absoluteBlogUrl("/sitemap.xml")}\n`,
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  );
}
