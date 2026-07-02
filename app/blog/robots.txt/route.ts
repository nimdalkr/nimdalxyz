import { absoluteBlogUrl } from "@/lib/site";

export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteBlogUrl("/sitemap.xml")}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
