import type { Locale } from "@/lib/content";
import { careerCases, getProject, projects } from "@/lib/content";

/**
 * The dive plan.
 *
 * The portfolio is a descent. The dive carries only the three builds worth
 * showing and, before them, the career itself: the record, the agency years,
 * the brand work, and the Web3 crossing, each opening a verified case room.
 * The rest of the projects stay reachable from the archive, not the stage.
 */

type Place = { ko: string; en: string };

export type LandmarkKind =
  | "current" | "reef" | "ruin" | "lighthouse" | "port"
  | "canal" | "lagoon" | "forest" | "dock";

const STATIONS: ReadonlyArray<{ slug: string; place: Place; hue: string; kind: LandmarkKind }> = [
  { slug: "hyperalphaduo", kind: "current", place: { ko: "시장 해류", en: "Market Current" }, hue: "#ffb347" },
  { slug: "alphaduo", kind: "reef", place: { ko: "지갑 산호초", en: "Wallet Reef" }, hue: "#ff7ab8" },
  { slug: "mylol", kind: "lagoon", place: { ko: "게임 석호", en: "Game Lagoon" }, hue: "#5ee0a0" }
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

export type CaseRoom = {
  id: string;
  period: string;
  title: string;
  context: string;
  objective: string;
  role: string;
  result: string;
  channels: string[];
  media: AtlasMedia[];
};

/** The verified client work, shaped for the dive's story rooms. */
export function buildCases(locale: Locale): Record<string, CaseRoom> {
  const wanted = new Set([
    "mkr-agency-operating-system",
    "leica-online-acquisition",
    "nevada-korea-marketing-lead"
  ]);
  const out: Record<string, CaseRoom> = {};
  for (const item of careerCases) {
    if (!wanted.has(item.id)) continue;
    const copy = item.copy[locale];
    out[item.id] = {
      id: item.id,
      period: item.period,
      title: copy.title,
      context: copy.context,
      objective: copy.objective,
      role: copy.role,
      result: copy.result,
      channels: [...copy.channels],
      media: [{
        src: item.media.src,
        alt: item.media.alt[locale],
        caption: item.media.claim[locale]
      }]
    };
  }
  return out;
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
