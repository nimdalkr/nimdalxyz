"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Ocean, type OceanHandle } from "@/components/atlas/scene/Ocean";
import { Life } from "@/components/atlas/scene/Life";
import { OctopusGuide, type OctopusHandle } from "@/components/atlas/scene/OctopusGuide";
import { ProjectRoom, type RoomData } from "@/components/atlas/ProjectRoom";
import { ATLAS_BUDGET } from "@/lib/atlas/capability";
import { DiveSound } from "@/lib/atlas/sound";
import type { AtlasLandmark, CaseRoom, LandmarkKind } from "@/lib/atlas/world";
import type { Locale } from "@/lib/content";

/**
 * The dive.
 *
 * A fixed viewport and a single motion: down. The visitor descends a water
 * column where every project is a station at depth; scrolling dives, arrow
 * keys step between stations, Enter enters the station's room, Escape
 * surfaces. The octopus makes the journey alongside.
 */

const ui = {
  ko: {
    skip: "읽기 모드",
    boot: "물에 들어가는 중",
    soundOn: "소리: 켜짐",
    soundOff: "소리: 꺼짐",
    start: "잠수 시작",
    enter: "들어가기",
    open: "기록 열기",
    mail: "메일 보내기",
    stations: "정거장",
    keys: "스크롤  잠수      ← →  이동      ENTER  입장",
    prev: "이전 정거장",
    next: "다음 정거장"
  },
  en: {
    skip: "Read as a page",
    boot: "Entering the water",
    soundOn: "SOUND: ON",
    soundOff: "SOUND: OFF",
    start: "Start the dive",
    enter: "Enter",
    open: "Open the record",
    mail: "Write to me",
    stations: "Stations",
    keys: "SCROLL  dive      ← →  move      ENTER  enter",
    prev: "Previous station",
    next: "Next station"
  }
} as const;

const KIND_INDEX: Record<LandmarkKind, number> = {
  current: 0, reef: 1, ruin: 2, lighthouse: 3, port: 4,
  canal: 5, lagoon: 6, forest: 7, dock: 8
};

type StationBase = { key: string; eyebrow: string; title: string; body: string; hue: string };

type Station =
  | (StationBase & { kind: "intro" })
  | (StationBase & { kind: "record"; stats: { value: string; label: string }[] })
  | (StationBase & { kind: "story"; beacon: number; chips: string[]; caseRoom?: CaseRoom })
  | (StationBase & { kind: "project"; landmark: AtlasLandmark })
  | (StationBase & { kind: "principles"; chips: string[] })
  | (StationBase & { kind: "contact" });

function beaconKind(station: Station): number {
  switch (station.kind) {
    case "project": return KIND_INDEX[station.landmark.kind];
    case "story": return station.beacon;
    case "record": return 10;
    case "principles": return 5;
    case "contact": return 9;
    default: return -1;
  }
}

interface AtlasStageProps {
  locale: Locale;
  landmarks: AtlasLandmark[];
  cases: Record<string, CaseRoom>;
  tier: "lite" | "full";
  onExit: () => void;
}

export function AtlasStage({ locale, landmarks, cases, tier, onExit }: AtlasStageProps) {
  const t = ui[locale];
  const korean = locale === "ko";
  const budget = ATLAS_BUDGET[tier];

  const stations = useMemo<Station[]>(() => [
    {
      kind: "intro",
      key: "surface",
      eyebrow: korean ? "탁찬우 / 님달" : "Tak Chanwoo / Nimdal",
      title: korean ? "만드는 마케터입니다" : "A marketer who ships",
      body: korean
        ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 아래로 내려가며 14년의 일과 세 개의 제품을 보실 수 있습니다."
        : "Running campaigns since 2012, now building research tools and automation. The descent holds fourteen years of work and three products.",
      hue: "#7fd8e8"
    },
    {
      kind: "record",
      key: "record",
      eyebrow: korean ? "소나 기록" : "Sonar record",
      title: korean ? "숫자가 먼저 도착합니다" : "The numbers arrive first",
      body: korean
        ? "14년의 운영이 물에 남긴 눈금입니다. 각 숫자의 출처는 경력 페이지에 적어 두었습니다."
        : "The marks fourteen years of operating left in the water. Every number's source lives on the career page.",
      hue: "#9fd8ff",
      stats: korean
        ? [
            { value: "14 yrs", label: "2012년부터 이어진 운영" },
            { value: "200+", label: "공공 및 상업 프로젝트" },
            { value: "3,000+", label: "크리에이터 네트워크" },
            { value: "15x", label: "활성 커뮤니티 성장" }
          ]
        : [
            { value: "14 yrs", label: "Operating since 2012" },
            { value: "200+", label: "Public and commercial projects" },
            { value: "3,000+", label: "Creator network" },
            { value: "15x", label: "Active community growth" }
          ]
    },
    {
      kind: "story",
      key: "agency",
      beacon: 4,
      eyebrow: korean ? "2012-2024 · 에이전시" : "2012-2024 · The agency years",
      title: korean ? "에이전시를 세우고 키웠습니다" : "Built and ran an agency",
      body: korean
        ? "MKR을 설립해 200건이 넘는 공공·상업 프로젝트와 3,000명 규모의 크리에이터 네트워크를 운영했습니다."
        : "Founded MKR, led more than two hundred public and commercial projects, and ran a creator network three thousand strong.",
      hue: "#ffd166",
      chips: ["MKR", korean ? "200+ 프로젝트" : "200+ projects", korean ? "3,000+ 크리에이터" : "3,000+ creators"],
      caseRoom: cases["mkr-agency-operating-system"]
    },
    {
      kind: "story",
      key: "brands",
      beacon: 1,
      eyebrow: korean ? "대표 클라이언트" : "Selected clients",
      title: korean ? "브랜드의 성장을 맡았습니다" : "Grew other people's brands",
      body: korean
        ? "라이카부터 스위스 기능성 신발, 동물병원까지. 채널과 예산이 달라도 판단은 늘 숫자와 현장에서 나왔습니다."
        : "Leica, Swiss functional footwear, an animal hospital. Channels and budgets changed; the decisions always came from numbers and the field.",
      hue: "#ff9fb1",
      chips: ["LEICA", "JOYA", korean ? "H 동물의료센터" : "H Animal Medical"],
      caseRoom: cases["leica-online-acquisition"]
    },
    {
      kind: "story",
      key: "web3",
      beacon: 3,
      eyebrow: korean ? "2025-2026 · Web3" : "2025-2026 · The Web3 crossing",
      title: korean ? "한국 시장의 다리가 되었습니다" : "Became the bridge into Korea",
      body: korean
        ? "글로벌 프로젝트의 한국 GTM을 이끌며 활성 커뮤니티를 15배로 키웠고, NEVADA의 마케팅 리드를 맡았습니다."
        : "Led Korean GTM for global projects, grew an active community fifteenfold, and ran marketing for NEVADA.",
      hue: "#6ec6ff",
      chips: ["NEVADA", "071LABS", korean ? "15배 성장" : "15x growth"],
      caseRoom: cases["nevada-korea-marketing-lead"]
    },
    ...landmarks.map((landmark): Station => ({
      kind: "project",
      key: landmark.slug,
      eyebrow: landmark.place,
      title: landmark.title,
      body: landmark.summary,
      hue: landmark.hue,
      landmark
    })),
    {
      kind: "principles",
      key: "principles",
      eyebrow: korean ? "일하는 방식" : "How I work",
      title: korean ? "증거, 프로토타입, 한 사이클" : "Evidence, prototypes, one loop",
      body: korean
        ? "숫자는 출처와 함께 말하고, 기획서보다 돌아가는 화면을 먼저 만들고, 기획부터 회고까지 혼자서도 돌립니다."
        : "Numbers travel with their sources, a working screen beats a longer deck, and I run the loop from plan to review myself.",
      hue: "#7fe3c4",
      chips: ["EVIDENCE", "PROTOTYPE", "SOLO OPS"]
    },
    {
      kind: "contact",
      key: "floor",
      eyebrow: korean ? "심해저" : "The abyss floor",
      title: korean ? "재미있는 문제를 찾고 있습니다." : "Looking for interesting problems.",
      body: korean
        ? "제품, 시장, 지금 막힌 지점을 보내주세요."
        : "Send the product, the market, and the point where it is stuck.",
      hue: "#ff7ab8"
    }
  ], [landmarks, cases, korean]);

  const count = stations.length;
  const [index, setIndex] = useState(0);
  const [room, setRoom] = useState<RoomData | null>(null);
  const station = stations[index];

  const [booted, setBooted] = useState(false);
  const bootStart = useRef(0);
  useEffect(() => { bootStart.current = performance.now(); }, []);
  const onOceanReady = useCallback(() => {
    // Hold the boot card long enough to read, never longer than needed.
    const remaining = Math.max(0, 900 - (performance.now() - bootStart.current));
    window.setTimeout(() => setBooted(true), remaining);
  }, []);

  const [soundOn, setSoundOn] = useState(false);
  const soundRef = useRef<DiveSound | null>(null);
  const oceanRef = useRef<OceanHandle | null>(null);
  const octoRef = useRef<OctopusHandle | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const octoPosRef = useRef({ x: -2, y: -1 });
  const depthRef = useRef(0);
  const roomRef = useRef<RoomData | null>(null);
  useEffect(() => { roomRef.current = room; }, [room]);

  // Drive the scene whenever the station or room changes.
  useEffect(() => {
    const depth = index / (count - 1);
    depthRef.current = depth;
    oceanRef.current?.setDepth(depth);
    oceanRef.current?.setStation(index, station.hue, beaconKind(station));
    octoRef.current?.setDeep(depth);
    octoRef.current?.setAccent(station.hue);
    soundRef.current?.setDepth(depth);
    if (index > 0) { soundRef.current?.whoosh(0.8); soundRef.current?.ping(); }
    // The guide swims to a slightly different spot at each station.
    const wobble = ((index * 137) % 5) / 5;
    if (index === 0) octoRef.current?.setTarget(-2.1, -1.35);
    else octoRef.current?.setTarget(-1.5 - wobble * 0.6, 0.9 - wobble * 2.0);
    octoRef.current?.dart(0, index === 0 ? 0 : -1.1);
  }, [index, count, station]);

  useEffect(() => {
    oceanRef.current?.setDive(room ? 1 : 0);
    if (room) {
      octoRef.current?.setTarget(-2.3, -1.6);
      soundRef.current?.whoosh(1.2);
    }
  }, [room]);

  // The audio context lives as long as the stage does.
  useEffect(() => () => { soundRef.current?.dispose(); }, []);

  const toggleSound = async () => {
    if (!soundRef.current) soundRef.current = new DiveSound();
    if (soundOn) {
      soundRef.current.stop();
      setSoundOn(false);
    } else {
      await soundRef.current.start();
      soundRef.current.setDepth(index / (count - 1));
      setSoundOn(true);
    }
  };

  const go = useCallback((delta: number) => {
    setIndex((value) => Math.min(Math.max(value + delta, 0), count - 1));
  }, [count]);

  const select = useCallback(() => {
    const current = stations[index];
    if (current.kind === "project") {
      setRoom({ variant: "project", hue: current.hue, landmark: current.landmark });
    } else if (current.kind === "story" && current.caseRoom) {
      setRoom({ variant: "case", hue: current.hue, place: current.eyebrow, caseRoom: current.caseRoom });
    } else {
      go(1);
    }
  }, [stations, index, go]);

  // Keyboard first: the whole dive is operable without a pointer.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (roomRef.current) {
        if (event.key === "Escape") { event.preventDefault(); setRoom(null); }
        return;
      }
      switch (event.key) {
        case "ArrowRight": case "ArrowDown": event.preventDefault(); go(1); break;
        case "ArrowLeft": case "ArrowUp": event.preventDefault(); go(-1); break;
        case "Enter": event.preventDefault(); select(); break;
        case "Escape": event.preventDefault(); onExit(); break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, select, onExit]);

  // Scrolling dives. The page itself never scrolls, so the wheel is free to
  // mean descent; a threshold keeps trackpads from skipping stations.
  const stageEl = useRef<HTMLDivElement>(null);
  const wheelAcc = useRef(0);
  useEffect(() => {
    const el = stageEl.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (roomRef.current) return;
      event.preventDefault();
      wheelAcc.current += event.deltaY;
      if (wheelAcc.current > 120) { wheelAcc.current = 0; go(1); }
      else if (wheelAcc.current < -120) { wheelAcc.current = 0; go(-1); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  // Touch: a vertical drag dives.
  const touchY = useRef<number | null>(null);
  const onTouchStart = (event: React.TouchEvent) => { touchY.current = event.touches[0]?.clientY ?? null; };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchY.current === null || roomRef.current) return;
    const dy = touchY.current - (event.changedTouches[0]?.clientY ?? touchY.current);
    if (dy > 60) go(1);
    else if (dy < -60) go(-1);
    touchY.current = null;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    pointerRef.current = { x, y };
    oceanRef.current?.setPointer(x, y);
  };

  // A press on open water sends the guide to investigate. Controls keep their
  // own meaning: anything interactive is exempt.
  const onPointerDown = (event: React.PointerEvent) => {
    if (roomRef.current) return;
    if ((event.target as Element).closest("button, a, nav")) return;
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    octoRef.current?.poke(x, y);
    soundRef.current?.ping();
  };

  const depthMeters = Math.round((index / (count - 1)) * 3400);

  return (
    <div
      ref={stageEl}
      className="stage"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Canvas
        dpr={budget.dpr}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Ocean handleRef={oceanRef} onReady={onOceanReady} />
          <Life octoPos={octoPosRef} depthRef={depthRef} />
          <OctopusGuide handleRef={octoRef} pointerRef={pointerRef} posOut={octoPosRef} />
        </Suspense>
      </Canvas>

      <div className="stage-grid" aria-hidden />
      <div className="stage-scrim" aria-hidden />

      <div className={room ? "stage-ui is-hidden" : "stage-ui"}>
        <header className="stage-top">
          <span className="stage-mark">NIMDAL.XYZ</span>
          <div className="stage-top-right">
            <button type="button" className="stage-quiet" onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? t.soundOn : t.soundOff}
            </button>
            <button type="button" className="stage-quiet" onClick={onExit}>{t.skip}</button>
          </div>
        </header>

        {/* Depth meter: place, position, and navigation in one instrument. */}
        <nav className="stage-depth" aria-label={t.stations}>
          <span className="stage-depth-read">-{String(depthMeters).padStart(4, "0")}M</span>
          <div className="stage-rail">
            {stations.map((item, i) => (
              <button
                key={item.key}
                type="button"
                className={i === index ? "is-active" : undefined}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                <span className="sr-only">{item.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="stage-panel" key={station.key}>
          <p className="stage-eyebrow">{station.eyebrow}</p>
          <h1 className="stage-title">
            {station.title.split(" ").map((word, wordIndex) => (
              <span className="stage-title-word" key={`${station.key}-${wordIndex}`}>
                <i style={{ "--i": wordIndex } as React.CSSProperties}>{word}</i>
              </span>
            ))}
          </h1>
          {station.kind === "contact" ? (
            <a className="stage-cta" href="mailto:0xnimdal@gmail.com">{t.mail}</a>
          ) : station.kind === "record" || station.kind === "principles" ? null : (
            <button type="button" className="stage-cta" onClick={select}>
              {station.kind === "intro" ? t.start : station.kind === "story" ? t.open : t.enter}
            </button>
          )}
          <p className="stage-body">{station.body}</p>
          {station.kind === "record" ? (
            <dl className="stage-stats">
              {station.stats.map((stat) => (
                <div key={stat.value}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {station.kind === "story" || station.kind === "principles" ? (
            <ul className="stage-chips">
              {station.chips.map((chip) => <li key={chip}>{chip}</li>)}
            </ul>
          ) : null}
          {station.kind === "contact" ? (
            <nav className="stage-links" aria-label={korean ? "외부 채널" : "Elsewhere"}>
              <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">X</a>
              <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">Telegram</a>
              <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">LinkedIn</a>
            </nav>
          ) : null}
        </div>

        <footer className="stage-bottom">
          <div className="stage-steps">
            <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label={t.prev}>{"<"}</button>
            <span>{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            <button type="button" onClick={() => go(1)} disabled={index === count - 1} aria-label={t.next}>{">"}</button>
          </div>
          <p className="stage-keys">{t.keys}</p>
        </footer>
      </div>

      {room ? (
        <ProjectRoom data={room} locale={locale} onClose={() => setRoom(null)} />
      ) : null}

      {/* The arrival. Honest loading: it leaves as soon as the water is ready. */}
      <div className={booted ? "stage-boot is-done" : "stage-boot"} aria-hidden={booted}>
        <div className="stage-boot-inner">
          {/* The identity greets first, exactly as drawn. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="stage-boot-octo" src="/media/identity-octopus.jpg" alt="" width={72} height={72} />
          <span className="stage-mark">NIMDAL.XYZ</span>
          <span className="stage-boot-line" />
          <span className="stage-boot-word">{t.boot}</span>
        </div>
      </div>
    </div>
  );
}
