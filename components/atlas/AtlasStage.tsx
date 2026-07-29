"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Ocean, type OceanHandle } from "@/components/atlas/scene/Ocean";
import { OctopusGuide, type OctopusHandle } from "@/components/atlas/scene/OctopusGuide";
import { ProjectRoom } from "@/components/atlas/ProjectRoom";
import { ATLAS_BUDGET } from "@/lib/atlas/capability";
import { DiveSound } from "@/lib/atlas/sound";
import type { AtlasLandmark } from "@/lib/atlas/world";
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
    soundOn: "소리: 켜짐",
    soundOff: "소리: 꺼짐",
    start: "잠수 시작",
    enter: "들어가기",
    mail: "메일 보내기",
    stations: "정거장",
    keys: "스크롤  잠수      ← →  이동      ENTER  입장",
    prev: "이전 정거장",
    next: "다음 정거장"
  },
  en: {
    skip: "Read as a page",
    soundOn: "SOUND: ON",
    soundOff: "SOUND: OFF",
    start: "Start the dive",
    enter: "Enter",
    mail: "Write to me",
    stations: "Stations",
    keys: "SCROLL  dive      ← →  move      ENTER  enter",
    prev: "Previous station",
    next: "Next station"
  }
} as const;

type Station =
  | { kind: "intro"; key: string; eyebrow: string; title: string; body: string; hue: string }
  | { kind: "project"; key: string; eyebrow: string; title: string; body: string; hue: string; landmark: AtlasLandmark }
  | { kind: "contact"; key: string; eyebrow: string; title: string; body: string; hue: string };

interface AtlasStageProps {
  locale: Locale;
  landmarks: AtlasLandmark[];
  tier: "lite" | "full";
  onExit: () => void;
}

export function AtlasStage({ locale, landmarks, tier, onExit }: AtlasStageProps) {
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
        ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 아홉 개의 작업이 수심을 따라 기다립니다."
        : "Running campaigns since 2012, now building research tools and automation. Nine pieces of work wait down the water column.",
      hue: "#7fd8e8"
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
      kind: "contact",
      key: "floor",
      eyebrow: korean ? "심해저" : "The abyss floor",
      title: korean ? "재미있는 문제를 찾고 있습니다." : "Looking for interesting problems.",
      body: korean
        ? "제품, 시장, 지금 막힌 지점을 보내주세요."
        : "Send the product, the market, and the point where it is stuck.",
      hue: "#ff7ab8"
    }
  ], [landmarks, korean]);

  const count = stations.length;
  const [index, setIndex] = useState(0);
  const [room, setRoom] = useState<AtlasLandmark | null>(null);
  const station = stations[index];

  const [soundOn, setSoundOn] = useState(false);
  const soundRef = useRef<DiveSound | null>(null);
  const oceanRef = useRef<OceanHandle | null>(null);
  const octoRef = useRef<OctopusHandle | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const roomRef = useRef<AtlasLandmark | null>(null);
  useEffect(() => { roomRef.current = room; }, [room]);

  // Drive the scene whenever the station or room changes.
  useEffect(() => {
    const depth = index / (count - 1);
    oceanRef.current?.setDepth(depth);
    oceanRef.current?.setStation(index, station.hue);
    octoRef.current?.setDeep(depth);
    octoRef.current?.setAccent(station.hue);
    soundRef.current?.setDepth(depth);
    if (index > 0) { soundRef.current?.whoosh(0.8); soundRef.current?.ping(); }
    // The guide swims to a slightly different spot at each station.
    const wobble = ((index * 137) % 5) / 5;
    if (index === 0) octoRef.current?.setTarget(-2.1, -1.35);
    else octoRef.current?.setTarget(-1.5 - wobble * 0.6, 0.9 - wobble * 2.0);
    octoRef.current?.dart(0, index === 0 ? 0 : -1.1);
  }, [index, count, station.hue]);

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
    if (current.kind === "project") setRoom(current.landmark);
    else if (current.kind === "intro") go(1);
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

  const depthMeters = Math.round((index / (count - 1)) * 3400);

  return (
    <div
      ref={stageEl}
      className="stage"
      onPointerMove={onPointerMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Canvas
        dpr={budget.dpr}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Ocean handleRef={oceanRef} />
          <OctopusGuide handleRef={octoRef} pointerRef={pointerRef} />
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
          <h1 className="stage-title">{station.title}</h1>
          {station.kind === "contact" ? (
            <a className="stage-cta" href="mailto:0xnimdal@gmail.com">{t.mail}</a>
          ) : (
            <button type="button" className="stage-cta" onClick={select}>
              {station.kind === "intro" ? t.start : t.enter}
            </button>
          )}
          <p className="stage-body">{station.body}</p>
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
        <ProjectRoom landmark={room} locale={locale} onClose={() => setRoom(null)} />
      ) : null}
    </div>
  );
}
