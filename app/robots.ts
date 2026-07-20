import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/keystatic", "/api/keystatic"]
    },
    sitemap: new URL("/sitemap.xml", siteConfig.mainUrl).toString(),
    host: siteConfig.mainUrl
  };
}
