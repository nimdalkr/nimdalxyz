import { blogCanonicalUrl, defaultLocale } from "@/lib/seo";

export function GET() {
  return Response.redirect(blogCanonicalUrl(defaultLocale, "/rss.xml"), 308);
}
