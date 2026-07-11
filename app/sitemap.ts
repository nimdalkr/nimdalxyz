import type { MetadataRoute } from "next";

import { absoluteMainUrl } from "@/lib/site";
import { featuredProjectSlugs, portfolioData } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const featuredProjectSet = new Set<string>(featuredProjectSlugs);
  const projectPages = portfolioData.caseStudies
    .filter((project) => featuredProjectSet.has(project.slug))
    .map((project) => ({
      url: absoluteMainUrl(`/projects/${project.slug}/proof`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75
    }));

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
    },
    ...projectPages
  ];
}
