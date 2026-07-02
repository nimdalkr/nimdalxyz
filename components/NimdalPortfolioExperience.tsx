"use client";

import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Waves } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePortfolioData } from "@/components/LocaleProvider";
import type { CaseStudy } from "@/lib/data";

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

const currentRoutes: CurrentRoute[] = [
  {
    id: "research",
    label: "GROUP 01",
    title: "Research Systems",
    subtitle: "Crypto markets, KOL activity, reputation data, and searchable financial research tools.",
    depth: "01",
    tone: "#8beaff",
    slugs: ["hyperalphaduo", "kol-listing", "ethosalpha", "tg-finance-search-portal"],
    x: "23%",
    y: "48%"
  },
  {
    id: "automation",
    label: "GROUP 02",
    title: "Automation Channels",
    subtitle: "API-driven tools for reducing repetitive social and server workflows.",
    depth: "02",
    tone: "#d8ff56",
    slugs: ["social-poster-one", "discord-bulk-leave"],
    x: "57%",
    y: "66%"
  },
  {
    id: "play",
    label: "GROUP 03",
    title: "Playable Worlds",
    subtitle: "Game-like products built from real data, fandom culture, and idle loops.",
    depth: "03",
    tone: "#ff74a5",
    slugs: ["mylol", "maple-union"],
    x: "78%",
    y: "36%"
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
  ethosalpha: "/media/projects/ethosalpha.png",
  hyperalphaduo: "/media/projects/hyperalphaduo.png",
  "kol-listing": "/media/projects/kol-listing.png",
  "tg-finance-search-portal": "/media/projects/tg-finance-search-portal.png",
  "social-poster-one": "/media/projects/social-poster-one.png",
  mylol: "/media/projects/mylol.png",
  "maple-union": "/media/projects/maple-union.png",
  "discord-bulk-leave": "/media/projects/discord-bulk-leave.png"
};

const projectRooms: Record<string, ProjectRoomMeta> = {
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

export function NimdalPortfolioExperience() {
  const { caseStudies } = usePortfolioData();
  const shouldReduceMotion = useReducedMotion();
  const [scene, setScene] = useState<Scene>("gate");
  const [activeRouteId, setActiveRouteId] = useState(currentRoutes[0].id);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [roomPanelIndex, setRoomPanelIndex] = useState(0);
  const [divingProject, setDivingProject] = useState<CaseStudy | null>(null);
  const diveTimerRef = useRef<number | null>(null);

  const activeRoute = currentRoutes.find((route) => route.id === activeRouteId) ?? currentRoutes[0];
  const activeCases = useMemo(
    () => getCases(caseStudies, activeRoute.slugs),
    [activeRoute.slugs, caseStudies]
  );
  const allCases = useMemo(
    () => currentRoutes.flatMap((route) => getCases(caseStudies, route.slugs)),
    [caseStudies]
  );
  const activeCase = activeCases[activeCaseIndex] ?? activeCases[0];
  const selectedProject =
    allCases.find((item) => item.slug === selectedProjectSlug) ?? activeCase ?? allCases[0];
  const selectedProjectRoute = selectedProject ? getRouteForProject(selectedProject.slug) : activeRoute;
  const selectedProjectIndex = selectedProject
    ? Math.max(0, allCases.findIndex((item) => item.slug === selectedProject.slug))
    : 0;
  const selectedProjectNumber = selectedProjectIndex + 1;
  const nextProject = allCases.length
    ? allCases[(selectedProjectIndex + 1) % allCases.length]
    : undefined;
  const selectedProjectVisual = selectedProject
    ? projectVisuals[selectedProject.slug] ?? selectedProject.media.src
    : "/media/identity-octopus.jpg";
  const selectedRoom = selectedProject
    ? projectRooms[selectedProject.slug]
    : undefined;
  const divingRoom = divingProject
    ? projectRooms[divingProject.slug]
    : undefined;
  const divingProjectVisual = divingProject
    ? projectVisuals[divingProject.slug] ?? divingProject.media.src
    : "/media/identity-octopus.jpg";
  const roomPanels = useMemo<RoomPanel[]>(() => {
    if (!selectedProject) return [];

    const place = selectedRoom?.place ?? selectedProject.media.cue;

    return [
      {
        id: "signal",
        label: "Signal",
        title: `Why ${selectedProject.client} exists`,
        body: selectedProject.context,
        lines: [selectedProject.oneLiner]
      },
      {
        id: "build",
        label: "Build",
        title: `${place} mechanics`,
        body: "The room turns the project into a focused interaction model instead of a static case-study block.",
        lines: selectedProject.strategy
      },
      {
        id: "proof",
        label: "Proof",
        title: selectedProject.href ? "Live artifact and stack" : "Artifact and stack",
        body: selectedProject.href
          ? "A public surface is attached for direct inspection. The stack below marks the core product behavior."
          : "This item is presented as a portfolio artifact, prototype, or in-progress build. The stack below marks the core product behavior.",
        lines: selectedProject.stack
      },
      {
        id: "next",
        label: "Next",
        title: nextProject ? `Continue to ${nextProject.client}` : "Return to Projects",
        body: nextProject
          ? `Move laterally from ${selectedProject.client} into ${nextProject.client} without returning to a vertical page.`
          : "Return to the personal projects surface and choose another project.",
        lines: nextProject ? [projectRooms[nextProject.slug]?.place ?? nextProject.media.cue, nextProject.oneLiner] : undefined
      }
    ];
  }, [nextProject, selectedProject, selectedRoom?.place]);
  const activeRoomPanel = roomPanels[roomPanelIndex] ?? roomPanels[0];

  useEffect(() => {
    setActiveCaseIndex(0);
  }, [activeRouteId]);

  useEffect(() => {
    setRoomPanelIndex(0);
  }, [selectedProject?.slug]);

  useEffect(() => {
    return () => {
      if (diveTimerRef.current) {
        window.clearTimeout(diveTimerRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    event.currentTarget.style.setProperty("--px", x.toFixed(3));
    event.currentTarget.style.setProperty("--py", y.toFixed(3));
    event.currentTarget.style.setProperty("--cursor-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--cursor-y", `${event.clientY - rect.top}px`);
  }, []);

  const showScene = useCallback((nextScene: Scene) => {
    setScene(nextScene);
  }, []);

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

  const moveCase = useCallback(
    (direction: 1 | -1) => {
      setActiveCaseIndex((current) => {
        if (!activeCases.length) return 0;
        return (current + direction + activeCases.length) % activeCases.length;
      });
    },
    [activeCases.length]
  );

  const moveProject = useCallback(
    (direction: 1 | -1) => {
      if (!allCases.length) return;

      const currentIndex = Math.max(
        0,
        allCases.findIndex((item) => item.slug === selectedProject?.slug)
      );
      const nextProject = allCases[(currentIndex + direction + allCases.length) % allCases.length];

      focusProject(nextProject);
      setRoomPanelIndex(0);
    },
    [allCases, focusProject, selectedProject?.slug]
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
  }, [moveCase, moveRoomPanel, scene, showScene]);

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
      <div className="zero-depth-map" aria-hidden />
      <div className="zero-waterfield" aria-hidden>
        {Array.from({ length: 120 }).map((_, index) => (
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
          <Image src="/media/identity-octopus.jpg" alt="" width={46} height={46} priority className="zero-pixel" />
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
          <a href="/blog">Logbook</a>
          <a href="/portfolio">Portfolio</a>
          <button className={scene === "identity" ? "is-active" : ""} onClick={() => showScene("identity")}>
            Identity
          </button>
          <button className={scene === "profile" ? "is-active" : ""} onClick={() => showScene("profile")}>
            Profile
          </button>
          <button className={scene === "contact" ? "is-active" : ""} onClick={() => showScene("contact")}>
            Contact
          </button>
        </nav>
      </header>

      <aside className="zero-hud zero-hud-left" aria-hidden>
        <div className="zero-radar">
          <Image src="/media/identity-octopus.jpg" alt="" width={54} height={54} priority className="zero-pixel" />
        </div>
        <p>NIMDAL</p>
        <span>TAK CHANWOO</span>
        <span>PORTFOLIO</span>
      </aside>

      <main className="zero-main">
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
                    priority
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
                <p className="zero-kicker">Personal projects</p>
                <h2>{activeRoute.title}</h2>
                <p>{activeRoute.subtitle}</p>
                <div className="zero-current-tabs" role="tablist" aria-label="Personal project categories">
                  {currentRoutes.map((route) => (
                    <button
                      key={route.id}
                      role="tab"
                      aria-selected={route.id === activeRouteId}
                      className={route.id === activeRouteId ? "is-active" : ""}
                      onClick={() => setActiveRouteId(route.id)}
                      onMouseEnter={() => setActiveRouteId(route.id)}
                    >
                      <small>{route.label}</small>
                      <strong>{route.title}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {activeCase ? (
                <div className="zero-project-stage">
                  <div className="zero-project-index">
                    <span>{String(activeCaseIndex + 1).padStart(2, "0")}</span>
                    <span>/ {String(activeCases.length).padStart(2, "0")}</span>
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
                      </div>
                    </motion.article>
                  </AnimatePresence>
                  <div className="zero-project-rail" aria-label="Projects in this category">
                    {activeCases.map((item, index) => (
                      <button
                        key={item.slug}
                        className={index === activeCaseIndex ? "is-active" : ""}
                        onClick={() => {
                          setActiveCaseIndex(index);
                          openProject(item);
                        }}
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {item.client}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </motion.section>
          ) : null}

          {scene === "project" && selectedProject ? (
            <motion.section
              key={`project-${selectedProject.slug}`}
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
                        className={index === roomPanelIndex ? "is-active" : ""}
                        onClick={() => setRoomPanelIndex(index)}
                        aria-label={`Open ${panel.label} panel`}
                        aria-current={index === roomPanelIndex ? "true" : undefined}
                      />
                    ))}
                  </div>
                </div>

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
                className="zero-detail-visual"
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
                    alt={`${selectedProject.client} project visual placeholder.`}
                    fill
                    sizes="(max-width: 900px) 92vw, 46vw"
                    className="zero-detail-image"
                  />
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
