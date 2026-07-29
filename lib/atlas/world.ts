import type { Locale } from "@/lib/content";
import { getProject, projects } from "@/lib/content";

/**
 * The running order.
 *
 * The stage plays as a sequence of chapters, so the only thing this file owns
 * is which projects appear and in what order. The order is hand-authored rather
 * than derived: it opens on the strongest live product and closes on the small
 * utilities, which is how the work should be read.
 */

const ORDER = [
  "hyperalphaduo",
  "alphaduo",
  "ethosalpha",
  "kol-listing",
  "tg-finance-search-portal",
  "social-poster-one",
  "mylol",
  "maple-union",
  "discord-bulk-leave"
] as const;

export type AtlasLandmark = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  href: string;
  image: string;
  imageAlt: string;
};

export function buildAtlas(locale: Locale): AtlasLandmark[] {
  return ORDER.flatMap((slug) => {
    const project = getProject(slug);
    if (!project) return [];
    const copy = project.copy[locale];
    const media = project.media.find((item) => item.role === "proof") ?? project.media[0];
    return [{
      slug: project.slug,
      title: copy.title,
      category: copy.category,
      summary: copy.summary,
      status: project.status,
      href: `/${locale}/projects/${project.slug}`,
      image: media.src,
      imageAlt: media.alt[locale]
    }];
  });
}

/** Guards the hand-authored order against a project being renamed or removed. */
export function atlasCoverage() {
  const ordered = new Set<string>(ORDER);
  const known = new Set<string>(projects.map((item) => item.slug));
  return {
    missingFromOrder: [...known].filter((slug) => !ordered.has(slug)),
    unknownInOrder: [...ordered].filter((slug) => !known.has(slug))
  };
}
