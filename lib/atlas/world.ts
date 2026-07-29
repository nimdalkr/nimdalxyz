import type { Locale } from "@/lib/content";
import { getProject, projects } from "@/lib/content";

/**
 * The dive plan.
 *
 * The portfolio is a descent. Every project is a station in the water column
 * with a place name, an accent it glows with, and a depth. The order is
 * hand-authored: it opens on the strongest live product and settles into the
 * small utilities near the floor, which is how the work should be read.
 */

type Place = { ko: string; en: string };

export type LandmarkKind =
  | "current" | "reef" | "ruin" | "lighthouse" | "port"
  | "canal" | "lagoon" | "forest" | "dock";

const STATIONS: ReadonlyArray<{ slug: string; place: Place; hue: string; kind: LandmarkKind }> = [
  { slug: "hyperalphaduo", kind: "current", place: { ko: "시장 해류", en: "Market Current" }, hue: "#ffb347" },
  { slug: "alphaduo", kind: "reef", place: { ko: "지갑 산호초", en: "Wallet Reef" }, hue: "#ff7ab8" },
  { slug: "ethosalpha", kind: "ruin", place: { ko: "평판 유적", en: "Reputation Ruin" }, hue: "#7fe3c4" },
  { slug: "kol-listing", kind: "lighthouse", place: { ko: "시그널 등대", en: "Signal Lighthouse" }, hue: "#ffd166" },
  { slug: "tg-finance-search-portal", kind: "port", place: { ko: "메시지 항구", en: "Message Port" }, hue: "#6ec6ff" },
  { slug: "social-poster-one", kind: "canal", place: { ko: "자동화 수로", en: "Automation Canal" }, hue: "#b28dff" },
  { slug: "mylol", kind: "lagoon", place: { ko: "게임 석호", en: "Game Lagoon" }, hue: "#5ee0a0" },
  { slug: "maple-union", kind: "forest", place: { ko: "픽셀 숲 산호", en: "Pixel Forest Reef" }, hue: "#ff8fb1" },
  { slug: "discord-bulk-leave", kind: "dock", place: { ko: "출항 부두", en: "Exit Dock" }, hue: "#9fb3c8" }
];

export type AtlasMedia = {
  src: string;
  alt: string;
  caption: string;
};

export type AtlasLandmark = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  href: string;
  image: string;
  imageAlt: string;
  place: string;
  hue: string;
  kind: LandmarkKind;
  detail: {
    problem: string;
    decision: string;
    system: string;
    proof: string;
  };
  media: AtlasMedia[];
  liveUrl?: string;
  repositoryUrl?: string;
};

export function buildAtlas(locale: Locale): AtlasLandmark[] {
  return STATIONS.flatMap(({ slug, place, hue, kind }) => {
    const project = getProject(slug);
    if (!project) return [];
    const copy = project.copy[locale];
    const lead = project.media.find((item) => item.role === "proof") ?? project.media[0];
    return [{
      slug: project.slug,
      title: copy.title,
      category: copy.category,
      summary: copy.summary,
      status: project.status,
      href: `/${locale}/projects/${project.slug}`,
      image: lead.src,
      imageAlt: lead.alt[locale],
      place: place[locale],
      hue,
      kind,
      detail: {
        problem: copy.detail.problem,
        decision: copy.detail.decision,
        system: copy.detail.system,
        proof: copy.detail.proof
      },
      media: project.media.slice(0, 2).map((item) => ({
        src: item.src,
        alt: item.alt[locale],
        caption: item.claim[locale]
      })),
      liveUrl: project.liveUrl,
      repositoryUrl: project.repositoryUrl
    }];
  });
}

/** Guards the hand-authored plan against a project being renamed or removed. */
export function atlasCoverage() {
  const planned = new Set<string>(STATIONS.map((s) => s.slug));
  const known = new Set<string>(projects.map((item) => item.slug));
  return {
    missingFromPlan: [...known].filter((slug) => !planned.has(slug)),
    unknownInPlan: [...planned].filter((slug) => !known.has(slug))
  };
}
