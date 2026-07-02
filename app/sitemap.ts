import type { MetadataRoute } from "next";

import { absoluteMainUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteMainUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1
    },
    {
      url: absoluteMainUrl("/portfolio"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];
}
