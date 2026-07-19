import type { MetadataRoute } from "next";

import { projectSlugs } from "@/lib/content";
import {
  absoluteCanonicalUrl,
  hreflangAlternates,
  locales,
  type Locale
} from "@/lib/seo";

type SitemapOptions = {
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

function localizedEntries(pathname: string, options: SitemapOptions): MetadataRoute.Sitemap {
  const languages = hreflangAlternates(pathname);

  return locales.map((locale: Locale) => ({
    url: absoluteCanonicalUrl(locale, pathname),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages }
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...localizedEntries("/", { changeFrequency: "weekly", priority: 1 }),
    ...localizedEntries("/lab", { changeFrequency: "monthly", priority: 0.85 }),
    ...localizedEntries("/portfolio", { changeFrequency: "monthly", priority: 0.85 }),
    ...projectSlugs.flatMap((slug) =>
      localizedEntries(`/projects/${slug}`, {
        changeFrequency: "monthly",
        priority: 0.8
      })
    )
  ];
}
