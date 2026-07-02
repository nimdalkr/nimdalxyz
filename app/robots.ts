import type { MetadataRoute } from "next";

import { absoluteMainUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: absoluteMainUrl("/sitemap.xml")
  };
}
