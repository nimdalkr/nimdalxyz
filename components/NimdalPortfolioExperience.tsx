"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play, Waves, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePortfolioData } from "@/components/LocaleProvider";
import { featuredProjectSlugs, type CaseStudy } from "@/lib/data";

type Scene = "gate" | "currents" | "project" | "identity" | "profile" | "contact";

type CurrentRoute = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  depth: string;
  tone: string;
  slugs: string[];
  x: string;
  y: string;
};

type TransitionKind = "reef" | "current" | "beacon" | "harbor" | "canal" | "lagoon" | "grove" | "dock";

type ProjectRoomMeta = {
  place: string;
  transition: TransitionKind;
};

type RoomPanel = {
  id: "signal" | "build" | "proof" | "next";
  label: string;
  title: string;
  body: string;
  lines?: readonly string[];
};

const proofLabels: Record<CaseStudy["proofLevel"], string> = {
  "live-link": "Live link",
  screenshot: "Screenshot",
  "metric-claimed": "Metric claimed",
  "internal-only": "Internal proof",
  prototype: "Prototype",
  concept: "Concept",
  repository: "Repository"
};

const roomHotspotPositions: Record<RoomPanel["id"], { x: string; y: string }> = {
  signal: { x: "18%", y: "32%" },
  build: { x: "66%", y: "28%" },
  proof: { x: "76%", y: "63%" },
  next: { x: "31%", y: "72%" }
};

const roomPanelOrder: RoomPanel["id"][] = ["signal", "build", "proof", "next"];

function isRoomPanelId(value: string | null): value is RoomPanel["id"] {
  return Boolean(value && roomPanelOrder.includes(value as RoomPanel["id"]));
}

function withCaseRoomProofHash(href: string) {
  return `${href.split("#")[0]}#case-room-proof`;
}

const currentRoutes: CurrentRoute[] = [
  {
    id: "featured",
    label: "SELECTED 03",
    title: "Featured Projects",
    subtitle: "Three projects with enough product depth, current proof, and public context to inspect closely.",
    depth: "01",
    tone: "#8beaff",
    slugs: [...featuredProjectSlugs],
    x: "23%",
    y: "48%"
  },
  {
    id: "etc",
    label: "ETC / 06",
    title: "Smaller Builds",
    subtitle: "Experiments and utilities kept as concise references instead of full case studies.",
    depth: "02",
    tone: "#ff74a5",
    slugs: [
      "ethosalpha",
      "kol-listing",
      "tg-finance-search-portal",
      "social-poster-one",
      "maple-union",
      "discord-bulk-leave"
    ],
    x: "57%",
    y: "66%"
  }
];

const profileSignals = [
  {
    value: "2012",
    label: "Marketing since",
    body: "Started by running CSR, content, viral, influencer, and digital campaign operations end to end."
  },
  {
    value: "200+",
    label: "Campaigns",
    body: "Operated digital campaigns across brands, clinics, commerce, local businesses, and Web3 projects."
  },
  {
    value: "3K+",
    label: "KOL network",
    body: "Built campaign execution around influencer, KOL, community, and partner communication loops."
  },
  {
    value: "8K+",
    label: "X audience",
    body: "Built Web3 user touchpoints through X, Telegram, Naver Blog, Threads, and community channels."
  }
];

const profileTimeline = [
  {
    years: "2012-2016",
    title: "Makorang Lab",
    body: "Founder experience across proposals, campaign operations, partner communication, CSR messaging, and delivery management."
  },
  {
    years: "2018-2024",
    title: "MKR",
    body: "Founder and Growth Lead for 200+ digital marketing, content, viral, SNS, and influencer campaigns."
  },
  {
    years: "2024-now",
    title: "Nimdal / Alpha Duo",
    body: "Personal Web3 research, content, GTM, community, and portfolio operation under the Nimdal identity."
  },
  {
    years: "2025-2026",
    title: "Web3 GTM",
    body: "Marketing and GTM work across 071Labs and 1six.tech, including NEVADA Korea market SEO, KOL, blog, SNS, and agency operations."
  }
];

const contactChannels = [
  { label: "Email", value: "0xnimdal@gmail.com", href: "mailto:0xnimdal@gmail.com" },
  { label: "X", value: "@0xnimdal", href: "https://x.com/0xnimdal", external: true },
  { label: "Telegram", value: "@nimdal", href: "https://t.me/nimdal", external: true },
  { label: "Phone", value: "010-4935-8531", href: "tel:+821049358531" }
] as const;

const projectVisuals: Record<string, string> = {
  "arcdu-nft": "/media/projects/arcdu-nft.webp",
  ethosalpha: "/media/projects/ethosalpha-proof.png",
  hyperalphaduo: "/media/projects/hyperalphaduo-proof.png",
  "kol-listing": "/media/projects/kol-listing.webp",
  "tg-finance-search-portal": "/media/projects/tg-finance-search-portal.webp",
  "social-poster-one": "/media/projects/social-poster-one.webp",
  mylol: "/media/projects/proof/mylol-draft.webp",
  "maple-union": "/media/projects/maple-union.webp",
  "discord-bulk-leave": "/media/projects/discord-bulk-leave.webp"
};

const projectRooms: Record<string, ProjectRoomMeta> = {
  "arcdu-nft": {
    place: "Arc Intelligence Port",
    transition: "harbor"
  },
  ethosalpha: {
    place: "Reputation Reef",
    transition: "reef"
  },
  hyperalphaduo: {
    place: "Market Current",
    transition: "current"
  },
  "kol-listing": {
    place: "Signal Lighthouse",
    transition: "beacon"
  },
  "tg-finance-search-portal": {
    place: "Message Port",
    transition: "harbor"
  },
  "social-poster-one": {
    place: "Automation Canal",
    transition: "canal"
  },
  mylol: {
    place: "Game Lagoon",
    transition: "lagoon"
  },
  "maple-union": {
    place: "Pixel Forest Reef",
    transition: "grove"
  },
  "discord-bulk-leave": {
    place: "Exit Dock",
    transition: "dock"
  }
};

function getCases(caseStudies: readonly CaseStudy[], slugs: readonly string[]) {
  return slugs
    .map((slug) => caseStudies.find((item) => item.slug === slug))
    .filter((item): item is CaseStudy => Boolean(item));
}

function getRouteForProject(slug: string) {
  return currentRoutes.find((route) => route.slugs.includes(slug));
}

type NimdalPortfolioExperienceProps = {
  initialProjectSlug?: string;
  initialRoomId?: string;
};

export function NimdalPortfolioExperience({
  initialProjectSlug,
  initialRoomId
}: NimdalPortfolioExperienceProps = {}) {
  const { caseStudies } = usePortfolioData();
  const shouldReduceMotion = useReducedMotion();
  const initialProject = caseStudies.find((item) => item.slug === initialProjectSlug);
  const initialRoute = initialProject ? getRouteForProject(initialProject.slug) : undefined;
  const initialRouteCases = initialRoute ? getCases(caseStudies, initialRoute.slugs) : [];
  const initialCaseIndex = initialProject
    ? Math.max(0, initialRouteCases.findIndex((item) => item.slug === initialProject.slug))
    : 0;
  const initialRoomCandidate = initialRoomId ?? null;
  const initialRoom: RoomPanel["id"] | null = isRoomPanelId(initialRoomCandidate)
    ? initialRoomCandidate
    : null;
  const initialRoomIndex = initialRoom ? Math.max(0, roomPanelOrder.indexOf(initialRoom)) : 0;
  const [scene, setScene] = useState<Scene>(initialProject ? "project" : "gate");
  const [activeRouteId, setActiveRouteId] = useState(initialRoute?.id ?? currentRoutes[0].id);
  const [activeCaseIndex, setActiveCaseIndex] = useState(initialCaseIndex);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(initialProject?.slug ?? null);
  const [roomPanelIndex, setRoomPanelIndex] = useState(initialRoomIndex);
  const [scanMode, setScanMode] = useState(Boolean(initialRoom));
  const [scannedPanelIds, setScannedPanelIds] = useState<RoomPanel["id"][]>(
    initialRoom ? roomPanelOrder.slice(0, initialRoomIndex + 1) : []
  );
  const [openEvidencePanelId, setOpenEvidencePanelId] = useState<RoomPanel["id"] | null>(null);
  const [proofFrameIndex, setProofFrameIndex] = useState(0);
  const [isProofReelPlaying, setIsProofReelPlaying] = useState(false);
  const [divingProject, setDivingProject] = useState<CaseStudy | null>(null);
  const diveTimerRef = useRef<number | null>(null);
  const evidenceCloseRef = useRef<HTMLButtonElement | null>(null);
  const drawerFocusReadyRef = useRef(false);
  const pendingRoomRef = useRef<RoomPanel["id"] | null>(initialRoom);
  const pointerFrameRef = useRef<number | null>(null);
  const hydratedProjectRef = useRef(Boolean(initialProject));

  const activeRoute = currentRoutes.find((route) => route.id === activeRouteId) ?? currentRoutes[0];
  const featuredCases = useMemo(
    () => getCases(caseStudies, featuredProjectSlugs),
    [caseStudies]
  );
  const etcCases = useMemo(
    () => getCases(caseStudies, currentRoutes[1].slugs),
    [caseStudies]
  );
  const allCases = useMemo(
    () => currentRoutes.flatMap((route) => getCases(caseStudies, route.slugs)),
    [caseStudies]
  );
  const activeCase = featuredCases[activeCaseIndex] ?? featuredCases[0];
  const activeCaseRepoHref = activeCase?.artifacts?.find(
    (artifact) => artifact.kind === "repo" && artifact.href
  )?.href;
  const selectedProject =
    allCases.find((item) => item.slug === selectedProjectSlug) ?? activeCase ?? allCases[0];
  const projectSequence = selectedProject && featuredProjectSlugs.some((slug) => slug === selectedProject.slug)
    ? featuredCases
    : allCases;
  const selectedProjectRoute = selectedProject ? getRouteForProject(selectedProject.slug) : activeRoute;
  const selectedProjectIndex = selectedProject
    ? Math.max(0, projectSequence.findIndex((item) => item.slug === selectedProject.slug))
    : 0;
  const selectedProjectNumber = selectedProjectIndex + 1;
  const nextProject = projectSequence.length
    ? projectSequence[(selectedProjectIndex + 1) % projectSequence.length]
    : undefined;
  const selectedProjectVisual = selectedProject
    ? projectVisuals[selectedProject.slug] ?? selectedProject.media.src
    : "/media/identity-octopus.jpg";
  const proofReelFrames = useMemo(() => {
    if (!selectedProject) return [];

    if (selectedProject.proofMedia?.length) {
      return selectedProject.proofMedia;
    }

    return [
      {
        label: "Project visual",
        kind: "capture" as const,
        src: selectedProjectVisual,
        alt: selectedProject.media.alt,
        caption: selectedProject.context
      }
    ];
  }, [selectedProject, selectedProjectVisual]);
  const activeProofFrame = proofReelFrames[proofFrameIndex % Math.max(proofReelFrames.length, 1)];
  const proofReelProgress = proofReelFrames.length
    ? Math.round(((proofFrameIndex + 1) / proofReelFrames.length) * 100)
    : 0;
  const selectedRoom = selectedProject
    ? projectRooms[selectedProject.slug]
    : undefined;
  const divingRoom = divingProject
    ? projectRooms[divingProject.slug]
    : undefined;
  const divingProjectVisual = divingProject
    ? projectVisuals[divingProject.slug] ?? divingProject.media.src
    : "/media/identity-octopus.jpg";
  const particleCount = shouldReduceMotion ? 0 : 56;
  const roomPanels = useMemo<RoomPanel[]>(() => {
    if (!selectedProject) return [];

    const place = selectedRoom?.place ?? selectedProject.media.cue;

    return [
      {
        id: "signal",
        label: "Signal",
        title: selectedProject.story.problem,
        body: selectedProject.story.audience,
        lines: [selectedProject.oneLiner]
      },
      {
        id: "build",
        label: "Build",
        title: `${place} system`,
        body: selectedProject.story.decision,
        lines: [selectedProject.story.system, ...selectedProject.strategy.slice(0, 2)]
      },
      {
        id: "proof",
        label: "Proof",
        title: `${proofLabels[selectedProject.proofLevel]} evidence`,
        body: selectedProject.href
          ? "A public surface or evidence layer is attached for direct inspection."
          : "This item is presented with its current proof level and caveats instead of overstating maturity.",
        lines: [
          ...selectedProject.evidence.map((item) => item.value ?? item.label),
          ...selectedProject.stack
        ]
      },
      {
        id: "next",
        label: "Next",
        title: nextProject ? `Continue to ${nextProject.client}` : "Return to Projects",
        body: selectedProject.story.outcome,
        lines: nextProject
          ? [selectedProject.story.next, `Next room: ${projectRooms[nextProject.slug]?.place ?? nextProject.media.cue}`]
          : [selectedProject.story.next]
      }
    ];
  }, [nextProject, selectedProject, selectedRoom?.place]);
  const activeRoomPanel = roomPanels[roomPanelIndex] ?? roomPanels[0];
  const scanProgress = roomPanels.length ? Math.round((scannedPanelIds.length / roomPanels.length) * 100) : 0;
  const isRoomMapped = roomPanels.length > 0 && scannedPanelIds.length >= roomPanels.length;
  const scanStageLabel = isRoomMapped ? "Complete" : scanMode ? activeRoomPanel?.label ?? "Signal" : "Idle";
  const scanButtonLabel = isRoomMapped ? "Reset scan" : scanMode ? "Map next" : "Start scan";
  const drawerPanel = openEvidencePanelId
    ? roomPanels.find((panel) => panel.id === openEvidencePanelId)
    : undefined;
  const drawerPanelIndex = drawerPanel
    ? Math.max(0, roomPanels.findIndex((panel) => panel.id === drawerPanel.id))
    : 0;
  const drawerEvidence = selectedProject?.evidence.length
    ? selectedProject.evidence[drawerPanelIndex % selectedProject.evidence.length]
    : undefined;
  const drawerMedia = selectedProject?.proofMedia?.length
    ? selectedProject.proofMedia[drawerPanelIndex % selectedProject.proofMedia.length]
    : undefined;
  const relatedProofHref = selectedProject?.relatedPosts?.[0]?.href
    ? withCaseRoomProofHash(selectedProject.relatedPosts[0].href)
    : undefined;
  const drawerEvidenceHref = drawerEvidence?.href
    ? drawerPanel?.id === "proof" && drawerEvidence.type === "article"
      ? withCaseRoomProofHash(drawerEvidence.href)
      : drawerEvidence.href
    : undefined;
  const drawerLink =
    drawerEvidenceHref ??
    (drawerPanel?.id === "proof" ? relatedProofHref ?? selectedProject?.href : undefined) ??
    (drawerPanel?.id === "next" ? relatedProofHref : undefined);
  const drawerLinkLabel = drawerEvidenceHref
    ? "Open artifact"
    : drawerPanel?.id === "proof" && relatedProofHref
      ? "Open proof section"
      : drawerPanel?.id === "proof" && selectedProject?.href
        ? "Open live surface"
        : drawerPanel?.id === "next" && relatedProofHref
        ? "Open related log"
        : "Open source";

  const markScannedPanel = useCallback((panelId?: RoomPanel["id"]) => {
    if (!panelId) return;

    setScannedPanelIds((current) => (current.includes(panelId) ? current : [...current, panelId]));
  }, []);

  const selectRoomPanel = useCallback(
    (index: number, options: { openEvidence?: boolean } = {}) => {
      const panel = roomPanels[index];
      if (!panel) return;

      setRoomPanelIndex(index);

      if (scanMode || options.openEvidence) {
        setScanMode(true);
        markScannedPanel(panel.id);
      }

      if (options.openEvidence) {
        setOpenEvidencePanelId(panel.id);
      }
    },
    [markScannedPanel, roomPanels, scanMode]
  );

  const handleScanControl = useCallback(() => {
    if (!roomPanels.length) return;

    if (isRoomMapped) {
      setScanMode(false);
      setScannedPanelIds([]);
      setRoomPanelIndex(0);
      setOpenEvidencePanelId(null);
      return;
    }

    const currentPanel = roomPanels[roomPanelIndex] ?? roomPanels[0];
    const currentIsScanned = scannedPanelIds.includes(currentPanel.id);
    const nextUnscannedIndex = roomPanels.findIndex((panel) => !scannedPanelIds.includes(panel.id));
    const targetIndex = currentIsScanned && nextUnscannedIndex >= 0 ? nextUnscannedIndex : roomPanelIndex;
    const targetPanel = roomPanels[targetIndex] ?? currentPanel;

    setScanMode(true);
    setRoomPanelIndex(targetIndex);
    markScannedPanel(targetPanel.id);
    setOpenEvidencePanelId(targetPanel.id);
  }, [isRoomMapped, markScannedPanel, roomPanelIndex, roomPanels, scannedPanelIds]);

  const closeEvidenceDrawer = useCallback(() => {
    setOpenEvidencePanelId(null);
  }, []);

  const moveProofFrame = useCallback(
    (direction: 1 | -1) => {
      setIsProofReelPlaying(false);
      setProofFrameIndex((current) => {
        if (!proofReelFrames.length) return 0;
        return (current + direction + proofReelFrames.length) % proofReelFrames.length;
      });
    },
    [proofReelFrames.length]
  );

  useEffect(() => {
    const pendingRoomId = pendingRoomRef.current;

    if (pendingRoomId) {
      const roomIndex = Math.max(0, roomPanelOrder.indexOf(pendingRoomId));

      setRoomPanelIndex(roomIndex);
      setScanMode(true);
      setScannedPanelIds(roomPanelOrder.slice(0, roomIndex + 1));
      setOpenEvidencePanelId(null);
      setProofFrameIndex(0);
      setIsProofReelPlaying(false);
      pendingRoomRef.current = null;
      return;
    }

    setRoomPanelIndex(0);
    setScanMode(false);
    setScannedPanelIds([]);
    setOpenEvidencePanelId(null);
    setProofFrameIndex(0);
    setIsProofReelPlaying(false);
  }, [selectedProject?.slug]);

  useEffect(() => {
    if (shouldReduceMotion || !isProofReelPlaying || proofReelFrames.length < 2) return;

    const timer = window.setInterval(() => {
      setProofFrameIndex((current) => (current + 1) % proofReelFrames.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isProofReelPlaying, proofReelFrames.length, shouldReduceMotion]);

  useEffect(() => {
    if (!scanMode) return;
    markScannedPanel(activeRoomPanel?.id);
  }, [activeRoomPanel?.id, markScannedPanel, scanMode]);

  useEffect(() => {
    if (!drawerFocusReadyRef.current) {
      drawerFocusReadyRef.current = true;
      return;
    }

    if (!drawerPanel) return;
    evidenceCloseRef.current?.focus({ preventScroll: true });
  }, [drawerPanel]);

  useEffect(() => {
    return () => {
      if (diveTimerRef.current) {
        window.clearTimeout(diveTimerRef.current);
      }
      if (pointerFrameRef.current) {
        window.cancelAnimationFrame(pointerFrameRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const target = event.currentTarget;

    if (pointerFrameRef.current) return;

    pointerFrameRef.current = window.requestAnimationFrame(() => {
      target.style.setProperty("--px", x.toFixed(3));
      target.style.setProperty("--py", y.toFixed(3));
      target.style.setProperty("--cursor-x", `${cursorX}px`);
      target.style.setProperty("--cursor-y", `${cursorY}px`);
      pointerFrameRef.current = null;
    });
  }, [shouldReduceMotion]);

  const clearProjectUrl = useCallback(() => {
    if (typeof window === "undefined") return;

    window.history.replaceState(null, "", "/");
  }, []);

  const showScene = useCallback((nextScene: Scene) => {
    if (nextScene !== "project") {
      clearProjectUrl();
    }

    if (nextScene === "currents") {
      setActiveRouteId(currentRoutes[0].id);
      setActiveCaseIndex(0);
    }

    setScene(nextScene);
  }, [clearProjectUrl]);

  const focusProject = useCallback(
    (project: CaseStudy) => {
      const projectRoute = getRouteForProject(project.slug);

      setSelectedProjectSlug(project.slug);
      if (projectRoute) {
        const routeCases = getCases(caseStudies, projectRoute.slugs);
        const routeIndex = routeCases.findIndex((item) => item.slug === project.slug);

        setActiveRouteId(projectRoute.id);
        setActiveCaseIndex(Math.max(routeIndex, 0));
      }
    },
    [caseStudies]
  );

  const openProject = useCallback(
    (project = activeCase) => {
      if (!project) return;
      focusProject(project);

      if (shouldReduceMotion) {
        setDivingProject(null);
        setScene("project");
        return;
      }

      if (diveTimerRef.current) {
        window.clearTimeout(diveTimerRef.current);
      }

      setDivingProject(project);
      diveTimerRef.current = window.setTimeout(() => {
        setScene("project");
        window.setTimeout(() => setDivingProject(null), 260);
      }, 360);
    },
    [activeCase, focusProject, shouldReduceMotion]
  );

  useEffect(() => {
    if (scene !== "project" || !selectedProject || !activeRoomPanel || typeof window === "undefined") {
      return;
    }

    const projectPath = `/projects/${selectedProject.slug}/${activeRoomPanel.id}`;
    if (window.location.pathname !== projectPath || window.location.search || window.location.hash) {
      window.history.replaceState(null, "", projectPath);
    }
  }, [activeRoomPanel, scene, selectedProject]);

  useEffect(() => {
    if (hydratedProjectRef.current || !allCases.length || typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hashMatch = window.location.hash.match(/^#project-([a-z0-9-]+)(?:-room-(signal|build|proof|next))?$/);
    const roomParam = params.get("room");
    const hashRoomParam = hashMatch?.[2] ?? null;
    const projectSlug = params.get("project") ?? hashMatch?.[1] ?? "";
    const requestedRoomId = isRoomPanelId(roomParam)
      ? roomParam
      : isRoomPanelId(hashRoomParam)
        ? hashRoomParam
        : null;
    hydratedProjectRef.current = true;

    if (!projectSlug) return;

    const project = allCases.find((item) => item.slug === projectSlug);
    if (!project) return;

    focusProject(project);
    setDivingProject(null);
    setScene("project");

    if (requestedRoomId) {
      const roomIndex = Math.max(0, roomPanelOrder.indexOf(requestedRoomId));

      pendingRoomRef.current = requestedRoomId;
      setRoomPanelIndex(roomIndex);
      setScanMode(true);
      setScannedPanelIds(roomPanelOrder.slice(0, roomIndex + 1));
      setOpenEvidencePanelId(requestedRoomId);
    }
  }, [allCases, focusProject]);

  const moveCase = useCallback(
    (direction: 1 | -1) => {
      setActiveCaseIndex((current) => {
        if (!featuredCases.length) return 0;
        return (current + direction + featuredCases.length) % featuredCases.length;
      });
    },
    [featuredCases.length]
  );

  const moveProject = useCallback(
    (direction: 1 | -1) => {
      if (!projectSequence.length) return;

      const currentIndex = Math.max(
        0,
        projectSequence.findIndex((item) => item.slug === selectedProject?.slug)
      );
      const nextProject = projectSequence[
        (currentIndex + direction + projectSequence.length) % projectSequence.length
      ];

      focusProject(nextProject);
      setRoomPanelIndex(0);
    },
    [focusProject, projectSequence, selectedProject?.slug]
  );

  const moveRoomPanel = useCallback(
    (direction: 1 | -1) => {
      setRoomPanelIndex((current) => {
        if (!roomPanels.length) return 0;
        return (current + direction + roomPanels.length) % roomPanels.length;
      });
    },
    [roomPanels.length]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName.toLowerCase();

      if (targetTag === "input" || targetTag === "textarea" || targetTag === "select") {
        return;
      }

      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (scene === "project") {
        if (event.key.toLowerCase() === "s") {
          event.preventDefault();
          handleScanControl();
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveRoomPanel(1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveRoomPanel(-1);
        }

        if (event.key === "Escape" || event.key === "Esc") {
          event.preventDefault();
          if (drawerPanel) {
            closeEvidenceDrawer();
            return;
          }
          showScene("currents");
        }
      }

      if (scene === "currents") {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveCase(1);
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveCase(-1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeEvidenceDrawer, drawerPanel, handleScanControl, moveCase, moveRoomPanel, scene, showScene]);

  return (
    <div
      className={`zero-shell is-${scene}`}
      onPointerMove={handlePointerMove}
      style={
        {
          "--px": 0.5,
          "--py": 0.5,
          "--cursor-x": "50vw",
          "--cursor-y": "50vh",
          "--current-x": activeRoute.x,
          "--current-y": activeRoute.y,
          "--route-tone": activeRoute.tone
        } as CSSProperties
      }
    >
      <a className="zero-skip-link" href="#nimdal-main">
        Skip to portfolio content
      </a>
      <div className="zero-depth-map" aria-hidden />
      <div className="zero-waterfield" aria-hidden>
        {Array.from({ length: particleCount }).map((_, index) => (
          <span
            key={index}
            className="zero-particle"
            style={
              {
                "--particle-x": `${(index * 37) % 100}%`,
                "--particle-y": `${(index * 61) % 100}%`,
                "--particle-delay": `${(index % 24) * -0.18}s`,
                "--particle-speed": `${5 + (index % 6)}s`
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="zero-noise" aria-hidden />

      <header className="zero-header">
        <button className="zero-mark" onClick={() => showScene("gate")} aria-label="Return to entry">
          <Image src="/media/identity-octopus.jpg" alt="" width={46} height={46} className="zero-pixel" />
          <span>
            <strong>NIMDAL</strong>
            <small>TAK CHANWOO</small>
          </span>
        </button>
        <nav className="zero-nav" aria-label="Portfolio sections">
          <button className={scene === "gate" ? "is-active" : ""} onClick={() => showScene("gate")}>
            Home
          </button>
          <button
            className={scene === "currents" || scene === "project" ? "is-active" : ""}
            onClick={() => showScene("currents")}
          >
            Projects
          </button>
          <a href="https://blog.nimdal.xyz/">nimdalog</a>
          <a href="/portfolio">Portfolio</a>
          <button className={scene === "contact" ? "is-active" : ""} onClick={() => showScene("contact")}>
            Contact
          </button>
        </nav>
      </header>

      <aside className="zero-hud zero-hud-left" aria-hidden>
        <div className="zero-radar">
          <Image src="/media/identity-octopus.jpg" alt="" width={54} height={54} className="zero-pixel" />
        </div>
        <p>NIMDAL</p>
        <span>TAK CHANWOO</span>
        <span>PORTFOLIO</span>
      </aside>

      <main className="zero-main" id="nimdal-main">
        <AnimatePresence mode="wait">
          {scene === "gate" ? (
            <motion.section
              key="gate"
              className="zero-entry"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.018, filter: "blur(8px)" }}
              transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="zero-entry-copy">
                <p className="zero-kicker">Interactive identity / Seoul operator</p>
                <h1>
                  <span>Nimdal</span>
                  <span>Tak Chanwoo</span>
                </h1>
                <p className="zero-lead">
                  Tak Chanwoo builds Web3 research tools, automation systems, and playful product
                  interfaces through a pixel-octopus identity.
                </p>
                <div className="zero-entry-actions">
                  <button className="zero-begin" onClick={() => showScene("currents")}>
                    View Projects
                    <ArrowRight size={16} aria-hidden />
                  </button>
                  <button className="zero-ghost" onClick={() => showScene("identity")}>
                    Meet Nimdal
                  </button>
                  <button className="zero-ghost" onClick={() => showScene("profile")}>
                    View Profile
                  </button>
                </div>
              </div>

              <div className="zero-entry-visual" aria-label="Nimdal portrait and NFT identity">
                <motion.div
                  className="zero-portrait-porthole"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: "calc((var(--px) - 0.5) * -26px)",
                          y: "calc((var(--py) - 0.5) * -18px)"
                        }
                  }
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                >
                  <Image
                    src="/media/operator-portrait.png"
                    alt="Tak Chanwoo, also known as Nimdal."
                    fill
                    priority
                    sizes="(max-width: 900px) 72vw, 32vw"
                    className="zero-portrait"
                  />
                </motion.div>
                <motion.div
                  className="zero-avatar-card"
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : {
                          x: "calc((var(--px) - 0.5) * 44px)",
                          y: "calc((var(--py) - 0.5) * 38px)",
                          rotate: "calc((var(--px) - 0.5) * 9deg)"
                        }
                  }
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                >
                  <Image
                    src="/media/identity-octopus.jpg"
                    alt="Nimdal pixel octopus NFT identity."
                    fill
                    sizes="170px"
                    className="zero-pixel"
                  />
                </motion.div>
              </div>
            </motion.section>
          ) : null}

          {scene === "currents" ? (
            <motion.section
              key="currents"
              className="zero-currents"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="zero-current-intro">
                <p className="zero-kicker">Selected work / 03</p>
                <h2>Featured Projects</h2>
                <p>Only projects with substantial product depth and inspectable proof receive full case rooms.</p>
                <div className="zero-current-tabs" role="tablist" aria-label="Featured projects">
                  {featuredCases.map((project, index) => (
                    <button
                      key={project.slug}
                      role="tab"
                      aria-selected={index === activeCaseIndex}
                      className={index === activeCaseIndex ? "is-active" : ""}
                      onClick={() => {
                        setActiveRouteId(currentRoutes[0].id);
                        setActiveCaseIndex(index);
                      }}
                    >
                      <small>{String(index + 1).padStart(2, "0")} / {proofLabels[project.proofLevel]}</small>
                      <strong>{project.client}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {activeCase ? (
                <div className="zero-project-stage">
                  <div className="zero-project-index">
                    <span>{String(activeCaseIndex + 1).padStart(2, "0")}</span>
                    <span>/ {String(featuredCases.length).padStart(2, "0")}</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={activeCase.slug}
                      className="zero-project-card"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 64 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, x: -64 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span>{activeCase.category}</span>
                      <h3>{activeCase.client}</h3>
                      <p>{activeCase.oneLiner}</p>
                      <div className="zero-proof-strip" aria-label={`${activeCase.client} proof status`}>
                        <b>{activeCase.status}</b>
                        <b>{proofLabels[activeCase.proofLevel]}</b>
                        <b>{activeCase.evidence.length} evidence items</b>
                      </div>
                      <figure className="zero-featured-preview">
                        <Image
                          src={projectVisuals[activeCase.slug] ?? activeCase.media.src}
                          alt={activeCase.media.alt}
                          fill
                          sizes="(max-width: 900px) 88vw, 54vw"
                          className="zero-featured-preview-image"
                        />
                        <figcaption>
                          <span>{activeCase.media.cue}</span>
                          <strong>Current proof surface</strong>
                        </figcaption>
                      </figure>
                      <div className="zero-story-preview">
                        <span>Problem</span>
                        <p>{activeCase.story.problem}</p>
                        <span>System</span>
                        <p>{activeCase.story.system}</p>
                      </div>
                      <ul>
                        {activeCase.strategy.slice(0, 3).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                      <div className="zero-project-actions">
                        <button
                          className="zero-open-project"
                          onClick={() => openProject(activeCase)}
                        >
                          Open project
                          <ArrowRight size={15} aria-hidden />
                        </button>
                        <button onClick={() => moveCase(-1)} aria-label="Previous project">
                          <ArrowLeft size={16} aria-hidden />
                        </button>
                        <button onClick={() => moveCase(1)} aria-label="Next project">
                          <ArrowRight size={16} aria-hidden />
                        </button>
                        {activeCase.href ? (
                          <a href={activeCase.href} target="_blank" rel="noreferrer">
                            Visit
                            <ExternalLink size={15} aria-hidden />
                          </a>
                        ) : null}
                        {activeCaseRepoHref ? (
                          <a href={activeCaseRepoHref} target="_blank" rel="noreferrer">
                            GitHub
                            <ExternalLink size={15} aria-hidden />
                          </a>
                        ) : null}
                      </div>
                    </motion.article>
                  </AnimatePresence>
                  <section className="zero-etc-projects" aria-labelledby="etc-projects-title">
                    <div className="zero-etc-heading">
                      <div>
                        <span>ETC / archive</span>
                        <strong id="etc-projects-title">Smaller experiments</strong>
                      </div>
                      <small>{String(etcCases.length).padStart(2, "0")} references</small>
                    </div>
                    <div className="zero-etc-list">
                      {etcCases.map((item, index) => {
                        const href = item.href ?? item.relatedPosts?.[0]?.href ?? `/projects/${item.slug}/proof`;
                        const isExternal = href.startsWith("http");

                        return (
                          <a
                            key={item.slug}
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noreferrer" : undefined}
                          >
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <strong>{item.client}</strong>
                            <p>{item.oneLiner}</p>
                            {isExternal ? <ExternalLink size={14} aria-hidden /> : <ArrowRight size={14} aria-hidden />}
                          </a>
                        );
                      })}
                    </div>
                  </section>
                </div>
              ) : null}
            </motion.section>
          ) : null}

          {scene === "project" && selectedProject ? (
            <motion.section
              key={`project-${selectedProject.slug}`}
              id={`project-${selectedProject.slug}`}
              className="zero-project-detail"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 72, scale: 0.985 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -54, filter: "blur(8px)" }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="zero-detail-copy">
                <button className="zero-detail-back" onClick={() => showScene("currents")}>
                  <ArrowLeft size={16} aria-hidden />
                  Back to Projects
                </button>

                <div className="zero-detail-heading">
                  <p className="zero-kicker">{selectedProject.category}</p>
                  <h2>{selectedProject.client}</h2>
                  <p>{selectedProject.oneLiner}</p>
                </div>

                <div className="zero-detail-meta" aria-label="Project index and category">
                  <span>{String(selectedProjectNumber).padStart(2, "0")}</span>
                  <span>{selectedRoom?.place ?? selectedProject.media.cue}</span>
                  <span>{selectedProjectRoute?.title ?? "Personal Projects"}</span>
                  <span>{selectedProject.title}</span>
                </div>

                {selectedProject.caseRoom ? (
                  <section className="zero-case-room" aria-label={`${selectedProject.client} case room verdict`}>
                    <div>
                      <span>Case verdict</span>
                      <strong>{selectedProject.caseRoom.verdict}</strong>
                      <p>{selectedProject.caseRoom.judgeNote}</p>
                    </div>
                    <dl>
                      {selectedProject.caseRoom.checkpoints.map((item) => (
                        <div key={item.label}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ) : null}

                <section
                  className={`zero-scan-console ${scanMode ? "is-active" : ""} ${isRoomMapped ? "is-complete" : ""}`}
                  aria-label={`${selectedProject.client} interactive scan console`}
                >
                  <div className="zero-scan-console-head">
                    <span>Nimdal scanner</span>
                    <button type="button" onClick={handleScanControl} aria-pressed={scanMode || isRoomMapped}>
                      {scanButtonLabel}
                    </button>
                  </div>
                  <div className="zero-scan-stage" aria-live="polite">
                    <span>Stage</span>
                    <strong>{scanStageLabel}</strong>
                  </div>
                  <div className="zero-scan-progress" aria-label={`Room scan progress ${scanProgress}%`}>
                    <span style={{ width: `${scanProgress}%` }} />
                  </div>
                  <div className="zero-scan-readout" aria-live="polite">
                    <strong>{isRoomMapped ? "Room mapped" : `${scanProgress}% mapped`}</strong>
                    <p>{activeRoomPanel?.title}</p>
                  </div>
                  <div className="zero-scan-nodes" aria-label="Scan nodes">
                    {roomPanels.map((panel, index) => {
                      const isScanned = scannedPanelIds.includes(panel.id);
                      const isActive = index === roomPanelIndex;

                      return (
                        <button
                          key={panel.id}
                          type="button"
                          className={`${isActive ? "is-active" : ""} ${isScanned ? "is-scanned" : ""}`}
                          onClick={() => {
                            selectRoomPanel(index, { openEvidence: true });
                          }}
                          aria-current={isActive ? "true" : undefined}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{panel.label}</strong>
                          <small>{isScanned ? "logged" : "pending"}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <AnimatePresence>
                  {drawerPanel ? (
                    <motion.aside
                      key={drawerPanel.id}
                      className={`zero-evidence-drawer zero-evidence-dock is-${drawerPanel.id}`}
                      role="dialog"
                      aria-modal="false"
                      aria-labelledby={`zero-evidence-drawer-${drawerPanel.id}`}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
                      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        ref={evidenceCloseRef}
                        type="button"
                        className="zero-evidence-drawer-close"
                        onClick={closeEvidenceDrawer}
                        aria-label="Close evidence drawer"
                      >
                        <X size={15} aria-hidden />
                      </button>
                      <span>{drawerPanel.label} evidence</span>
                      <h3 id={`zero-evidence-drawer-${drawerPanel.id}`}>{drawerPanel.title}</h3>
                      <p>{drawerPanel.body}</p>
                      <div className="zero-evidence-drawer-artifact">
                        <span>{drawerEvidence?.type ?? drawerMedia?.kind ?? "room note"}</span>
                        <strong>{drawerEvidence?.value ?? drawerEvidence?.label ?? drawerMedia?.label ?? "Project room state"}</strong>
                        {drawerEvidence?.caveat ? (
                          <p>{drawerEvidence.caveat}</p>
                        ) : drawerMedia ? (
                          <p>{drawerMedia.caption}</p>
                        ) : null}
                      </div>
                      {drawerMedia ? (
                        <figure>
                          <div>
                            <Image
                              src={drawerMedia.src}
                              alt={drawerMedia.alt}
                              fill
                              sizes="(max-width: 900px) 88vw, 320px"
                              className="zero-evidence-drawer-image"
                            />
                          </div>
                          <figcaption>{drawerMedia.label}</figcaption>
                        </figure>
                      ) : null}
                      {drawerLink ? (
                        <a href={drawerLink} target={drawerLink.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                          {drawerLinkLabel}
                          <ExternalLink size={14} aria-hidden />
                        </a>
                      ) : null}
                    </motion.aside>
                  ) : null}
                </AnimatePresence>

                <div
                  className={`zero-room-interface is-${selectedRoom?.transition ?? "reef"}`}
                  aria-label={`${selectedProject.client} project room panels`}
                >
                  <div className="zero-room-toolbar">
                    <span aria-live="polite">
                      {activeRoomPanel?.label ?? "Signal"} / {String(roomPanelIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <button onClick={() => moveRoomPanel(-1)} aria-label="Previous room panel">
                        <ArrowLeft size={15} aria-hidden />
                      </button>
                      <button onClick={() => moveRoomPanel(1)} aria-label="Next room panel">
                        <ArrowRight size={15} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="zero-room-window">
                    <motion.div
                      className="zero-room-track"
                      animate={{ x: `${roomPanelIndex * -100}%` }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.48, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {roomPanels.map((panel) => (
                        <article key={panel.id} className={`zero-room-panel is-${panel.id}`}>
                          <span>{panel.label}</span>
                          <h3>{panel.title}</h3>
                          <p>{panel.body}</p>
                          {panel.lines?.length ? (
                            <ul>
                              {panel.lines.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          ) : null}
                          {panel.id === "proof" && selectedProject.href ? (
                            <a href={selectedProject.href} target="_blank" rel="noreferrer">
                              Open live
                              <ExternalLink size={15} aria-hidden />
                            </a>
                          ) : null}
                          {panel.id === "next" && nextProject ? (
                            <button onClick={() => moveProject(1)}>
                              Open next project
                              <ArrowRight size={15} aria-hidden />
                            </button>
                          ) : null}
                        </article>
                      ))}
                    </motion.div>
                  </div>

                  <div className="zero-room-dots" aria-label="Project room panel navigation">
                    {roomPanels.map((panel, index) => (
                      <button
                        key={panel.id}
                        className={`${index === roomPanelIndex ? "is-active" : ""} ${
                          scannedPanelIds.includes(panel.id) ? "is-scanned" : ""
                        }`}
                        onClick={() => {
                          selectRoomPanel(index);
                        }}
                        aria-label={`Open ${panel.label} panel`}
                        aria-current={index === roomPanelIndex ? "true" : undefined}
                      >
                        <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {activeProofFrame ? (
                  <section
                    className={`zero-proof-reel ${isProofReelPlaying ? "is-playing" : ""}`}
                    aria-label={`${selectedProject.client} evidence player`}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                        event.preventDefault();
                        event.stopPropagation();
                        moveProofFrame(event.key === "ArrowRight" ? 1 : -1);
                      }
                    }}
                  >
                    <div className="zero-proof-reel-head">
                      <div>
                        <span>Evidence player</span>
                        <strong>
                          {String(proofFrameIndex + 1).padStart(2, "0")} / {String(proofReelFrames.length).padStart(2, "0")}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsProofReelPlaying((current) => !current)}
                        aria-pressed={isProofReelPlaying}
                        disabled={proofReelFrames.length < 2}
                      >
                        {isProofReelPlaying ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                        {isProofReelPlaying ? "Pause" : "Play"}
                      </button>
                    </div>
                    <figure>
                      <div className="zero-proof-reel-media">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeProofFrame.src}
                            initial={shouldReduceMotion ? false : { opacity: 0, x: 22 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -18 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <Image
                              src={activeProofFrame.src}
                              alt={activeProofFrame.alt}
                              fill
                              sizes="(max-width: 900px) 86vw, 34vw"
                              className="zero-proof-reel-image"
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <figcaption>
                        <span>{activeProofFrame.kind}</span>
                        <strong>{activeProofFrame.label}</strong>
                        <p>{activeProofFrame.caption}</p>
                        {activeProofFrame.source || activeProofFrame.capturedAt ? (
                          <dl className="zero-proof-frame-meta">
                            {activeProofFrame.source ? <div><dt>Source</dt><dd>{activeProofFrame.source}</dd></div> : null}
                            {activeProofFrame.capturedAt ? <div><dt>Captured</dt><dd>{activeProofFrame.capturedAt}</dd></div> : null}
                            {activeProofFrame.claim ? <div><dt>Claim</dt><dd>{activeProofFrame.claim}</dd></div> : null}
                            {activeProofFrame.limitation ? <div><dt>Limit</dt><dd>{activeProofFrame.limitation}</dd></div> : null}
                          </dl>
                        ) : null}
                      </figcaption>
                    </figure>
                    <div className="zero-proof-reel-progress" aria-label={`Proof reel frame ${proofFrameIndex + 1} of ${proofReelFrames.length}`}>
                      <span style={{ width: `${proofReelProgress}%` }} />
                    </div>
                    <div className="zero-proof-reel-controls">
                      <button type="button" onClick={() => moveProofFrame(-1)} disabled={proofReelFrames.length < 2}>
                        <ArrowLeft size={14} aria-hidden />
                        Previous
                      </button>
                      <div aria-label="Evidence player frames">
                        {proofReelFrames.map((frame, index) => (
                          <button
                            key={`${frame.label}-${frame.src}`}
                            type="button"
                            className={index === proofFrameIndex ? "is-active" : ""}
                            onClick={() => {
                              setIsProofReelPlaying(false);
                              setProofFrameIndex(index);
                            }}
                            aria-label={`Open proof frame ${index + 1}: ${frame.label}`}
                            aria-current={index === proofFrameIndex ? "true" : undefined}
                          >
                            <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => moveProofFrame(1)} disabled={proofReelFrames.length < 2}>
                        Next
                        <ArrowRight size={14} aria-hidden />
                      </button>
                    </div>
                  </section>
                ) : null}

                {selectedProject.proofManifest ? (
                  <section className="zero-proof-manifest" aria-labelledby="proof-manifest-title">
                    <div className="zero-proof-manifest-heading">
                      <span>Proof manifest</span>
                      <strong id="proof-manifest-title">What this evidence can verify</strong>
                    </div>
                    <dl>
                      <div><dt>Status</dt><dd>{selectedProject.proofManifest.status}</dd></div>
                      <div><dt>Captured</dt><dd>{selectedProject.proofManifest.capturedAt}</dd></div>
                      <div><dt>Build ref</dt><dd>{selectedProject.proofManifest.buildRef}</dd></div>
                      <div><dt>Environment</dt><dd>{selectedProject.proofManifest.environment}</dd></div>
                      <div><dt>Reproduce</dt><dd>{selectedProject.proofManifest.reproduction}</dd></div>
                      <div><dt>Limitation</dt><dd>{selectedProject.proofManifest.limitation}</dd></div>
                    </dl>
                    {selectedProject.proofManifest.sourceHref ? (
                      <a href={selectedProject.proofManifest.sourceHref} target="_blank" rel="noreferrer">
                        Inspect source log
                        <ExternalLink size={14} aria-hidden />
                      </a>
                    ) : null}
                  </section>
                ) : null}

                <aside className="zero-evidence-tray" aria-label={`${selectedProject.client} evidence tray`}>
                  <div className="zero-evidence-heading">
                    <span>Evidence tray</span>
                    <strong>{proofLabels[selectedProject.proofLevel]}</strong>
                  </div>
                  <div className="zero-evidence-grid">
                    {selectedProject.evidence.map((item) => {
                      const content = (
                        <>
                          <span>{item.type}</span>
                          <strong>{item.value ?? item.label}</strong>
                          {item.caveat ? <p>{item.caveat}</p> : null}
                        </>
                      );

                      return item.href ? (
                        <a key={`${item.label}-${item.href}`} href={item.href} target="_blank" rel="noreferrer">
                          {content}
                        </a>
                      ) : (
                        <div key={`${item.label}-${item.type}`}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                  {selectedProject.relatedPosts?.length ? (
                    <div className="zero-related-logs">
                      <span>Related log</span>
                      {selectedProject.relatedPosts.map((post) => (
                        <a key={post.href} href={post.href}>
                          {post.title}
                          <ExternalLink size={14} aria-hidden />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </aside>

                {selectedProject.proofMedia?.length ? (
                  <section className="zero-proof-media" aria-label={`${selectedProject.client} proof media`}>
                    <div className="zero-proof-media-heading">
                      <span>Proof media</span>
                      <strong>{selectedProject.proofMedia.length} captured assets</strong>
                    </div>
                    <div className="zero-proof-media-grid">
                      {selectedProject.proofMedia.map((item) => (
                        <figure key={`${item.label}-${item.src}`}>
                          <div>
                            <Image
                              src={item.src}
                              alt={item.alt}
                              fill
                              sizes="(max-width: 900px) 88vw, 24vw"
                              className="zero-proof-media-image"
                            />
                          </div>
                          <figcaption>
                            <span>{item.kind}</span>
                            <strong>{item.label}</strong>
                            <p>{item.caption}</p>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="zero-detail-actions">
                  <button onClick={() => moveProject(-1)}>
                    <ArrowLeft size={16} aria-hidden />
                    Previous project
                  </button>
                  <button onClick={() => moveProject(1)}>
                    Next project
                    <ArrowRight size={16} aria-hidden />
                  </button>
                  {selectedProject.href ? (
                    <a href={selectedProject.href} target="_blank" rel="noreferrer">
                      Open live
                      <ExternalLink size={15} aria-hidden />
                    </a>
                  ) : null}
                </div>
              </div>

              <motion.div
                className={`zero-detail-visual ${drawerPanel ? "has-evidence-drawer" : ""}`}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        x: "calc((var(--px) - 0.5) * -34px)",
                        y: "calc((var(--py) - 0.5) * -22px)"
                      }
                }
                transition={{ type: "spring", stiffness: 80, damping: 22 }}
              >
                <div className="zero-detail-frame">
                  <Image
                    src={selectedProjectVisual}
                    alt={`${selectedProject.client} project visual evidence.`}
                    fill
                    sizes="(max-width: 900px) 92vw, 46vw"
                    className="zero-detail-image"
                  />
                  <div className="zero-proof-lens" aria-label={`${selectedProject.client} proof summary`}>
                    <span>{selectedProject.status}</span>
                    <strong>{proofLabels[selectedProject.proofLevel]}</strong>
                    <small>{selectedProject.evidence.length} evidence items</small>
                  </div>
                  {scanMode ? (
                    <div className="zero-scan-overlay" aria-hidden>
                      <span className="zero-scan-sweep" />
                      <span className="zero-scan-target" />
                    </div>
                  ) : null}
                  <div className="zero-room-hotspots" aria-label={`${selectedProject.client} visual story controls`}>
                    {roomPanels.map((panel, index) => {
                      const point = roomHotspotPositions[panel.id];
                      const isScanned = scannedPanelIds.includes(panel.id);

                      return (
                        <button
                          key={panel.id}
                          className={`${index === roomPanelIndex ? "is-active" : ""} ${isScanned ? "is-scanned" : ""}`}
                          style={
                            {
                              "--hotspot-x": point.x,
                              "--hotspot-y": point.y
                            } as CSSProperties
                          }
                          onClick={() => {
                            selectRoomPanel(index, { openEvidence: true });
                          }}
                          aria-current={index === roomPanelIndex ? "true" : undefined}
                        >
                          <span>{panel.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="zero-detail-caption">
                  <span>{selectedProject.category}</span>
                  <strong>{selectedProject.client}</strong>
                </div>
              </motion.div>
            </motion.section>
          ) : null}

          {scene === "identity" ? (
            <motion.section
              key="identity"
              className="zero-identity"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="zero-identity-portraits">
                <div className="zero-portrait-scan">
                  <Image
                    src="/media/operator-portrait.png"
                    alt="Tak Chanwoo portrait."
                    fill
                    sizes="(max-width: 900px) 70vw, 28vw"
                    className="zero-portrait"
                  />
                </div>
                <div className="zero-avatar-scan">
                  <Image
                    src="/media/identity-octopus.jpg"
                    alt="Nimdal pixel octopus identity."
                    fill
                    sizes="160px"
                    className="zero-pixel"
                  />
                </div>
              </div>
              <div className="zero-identity-copy">
                <p className="zero-kicker">Tak Chanwoo / Nimdal</p>
                <h2>Tak Chanwoo, Nimdal</h2>
                <p>
                  The portrait grounds the person. The octopus profile carries the digital identity.
                  This page introduces both at once: a Seoul-based builder who turns complex markets,
                  community behavior, automation needs, and game systems into usable products.
                </p>
                <div className="zero-identity-lines">
                  <span>Builder and strategist from Seoul.</span>
                  <span>Web3 research, automation, and games.</span>
                  <span>Interfaces for complex products.</span>
                </div>
              </div>
            </motion.section>
          ) : null}

          {scene === "profile" ? (
            <motion.section
              key="profile"
              className="zero-profile"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -16, filter: "blur(8px)" }}
              transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="zero-profile-lead">
                <p className="zero-kicker">Application dossier / Public version</p>
                <h2>Growth Operator Behind Nimdal</h2>
                <p>
                  Tak Chanwoo has worked across digital marketing, content, viral loops,
                  KOL campaigns, and Web3 GTM since 2012. His strongest pattern is turning
                  a complex product into a message, a channel plan, and an execution system
                  that real users can understand and respond to, with risk-aware messaging
                  for Web3 and trading products.
                </p>
              </div>

              <div className="zero-profile-grid">
                <section className="zero-profile-metrics" aria-label="Nimdal career signals">
                  {profileSignals.map((signal) => (
                    <article key={signal.label}>
                      <strong>{signal.value}</strong>
                      <span>{signal.label}</span>
                      <p>{signal.body}</p>
                    </article>
                  ))}
                </section>

                <section className="zero-profile-timeline" aria-label="Nimdal career timeline">
                  {profileTimeline.map((item) => (
                    <article key={item.title}>
                      <span>{item.years}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </section>
              </div>
            </motion.section>
          ) : null}

          {scene === "contact" ? (
            <motion.section
              key="contact"
              className="zero-contact"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.02, filter: "blur(8px)" }}
              transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="zero-kicker">Contact</p>
              <h2>Contact Nimdal</h2>
              <div className="zero-contact-channels" aria-label="Nimdal contact channels">
                {contactChannels.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={"external" in item ? "_blank" : undefined}
                    rel={"external" in item ? "noreferrer" : undefined}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </a>
                ))}
              </div>
              <p>
                Send a project, collaboration, or question. I will reply when the context is clear.
              </p>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {divingProject ? (
          <motion.div
            key={divingProject.slug}
            className={`zero-dive-transition is-${divingRoom?.transition ?? "reef"}`}
            style={
              {
                "--transition-tone": getRouteForProject(divingProject.slug)?.tone ?? activeRoute.tone
              } as CSSProperties
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden
          >
            <motion.div
              className="zero-dive-image"
              initial={{ scale: 0.7, opacity: 0.15 }}
              animate={{ scale: 1.18, opacity: 0.5 }}
              exit={{ scale: 1.34, opacity: 0 }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={divingProjectVisual}
                alt=""
                fill
                sizes="100vw"
                className="zero-detail-image"
              />
            </motion.div>
            <div className="zero-dive-mask" />
            <motion.div
              className="zero-dive-copy"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>{divingRoom?.place ?? divingProject.media.cue}</span>
              <strong>{divingProject.client}</strong>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="zero-current-orbit" aria-hidden>
        <Waves size={20} />
      </div>
    </div>
  );
}
