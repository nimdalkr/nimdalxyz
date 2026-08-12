import { blogCanonicalUrl, blogDefaultLocale } from "@/lib/seo";

export function GET() {
  return Response.redirect(blogCanonicalUrl(blogDefaultLocale, "/rss.xml"), 308);
}
