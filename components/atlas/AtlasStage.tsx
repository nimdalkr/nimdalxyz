"use client";

import { Canvas } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Frame, type FrameHandle } from "@/components/atlas/scene/Frame";
import { ATLAS_BUDGET } from "@/lib/atlas/capability";
import type { AtlasLandmark } from "@/lib/atlas/world";
import type { Locale } from "@/lib/content";

/**
 * The experience.
 *
 * A fixed viewport, never a scroll. Each chapter is one graded photograph with
 * a quiet panel of type beside it, and the visitor advances deliberately rather
 * than by scrolling past. The canvas does the grade, the grain, the parallax,
 * and the luminance dissolve between chapters.
 */

const ui = {
  ko: {
    skip: "읽기 모드",
    enter: "들어가기",
    open: "프로젝트 열기",
    next: "다음",
    prev: "이전",
    keys: "← →  이동      ENTER  선택",
    chapters: "챕터"
  },
  en: {
    skip: "Read as a page",
    enter: "Enter",
    open: "Open project",
    next: "Next",
    prev: "Previous",
    keys: "← →  move      ENTER  select",
    chapters: "Chapters"
  }
} as const;

type Chapter = {
  key: string;
  image: string;
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
};

interface AtlasStageProps {
  locale: Locale;
  landmarks: AtlasLandmark[];
  tier: "lite" | "full";
  onExit: () => void;
}

export function AtlasStage({ locale, landmarks, tier, onExit }: AtlasStageProps) {
  const router = useRouter();
  const t = ui[locale];
  const korean = locale === "ko";
  const budget = ATLAS_BUDGET[tier];

  const chapters = useMemo<Chapter[]>(() => [
    {
      key: "intro",
      image: "/media/operator-portrait.png",
      eyebrow: korean ? "탁찬우 / 님달" : "Tak Chanwoo / Nimdal",
      title: korean ? "만드는 마케터입니다" : "A marketer who ships",
      body: korean
        ? "2012년부터 캠페인을 운영했고, 지금은 리서치 도구와 자동화 제품을 직접 만듭니다. 아홉 개의 작업을 순서대로 보실 수 있습니다."
        : "Running campaigns since 2012, now building research tools and automation. Nine pieces of work, in order."
    },
    ...landmarks.map((landmark) => ({
      key: landmark.slug,
      image: landmark.image,
      eyebrow: landmark.category,
      title: landmark.title,
      body: landmark.summary,
      href: landmark.href
    }))
  ], [landmarks, korean]);

  const [index, setIndex] = useState(0);
  const frameRef = useRef<FrameHandle | null>(null);
  const chapter = chapters[index];

  const go = useCallback((delta: number) => {
    setIndex((value) => Math.min(Math.max(value + delta, 0), chapters.length - 1));
  }, [chapters.length]);

  const select = useCallback(() => {
    if (chapter?.href) router.push(chapter.href);
    else go(1);
  }, [chapter, router, go]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      else if (event.key === "Enter") { event.preventDefault(); select(); }
      else if (event.key === "Escape") { event.preventDefault(); onExit(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, select, onExit]);

  const onPointerMove = (event: React.PointerEvent) => {
    frameRef.current?.setParallax(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1
    );
  };

  const images = useMemo(() => chapters.map((c) => c.image), [chapters]);
  // Only the opening portrait is a photograph; every project frame is a screen.
  const soft = useMemo(() => chapters.map((c) => c.key !== "intro"), [chapters]);

  return (
    <div className="stage" onPointerMove={onPointerMove}>
      <Canvas
        dpr={budget.dpr}
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Frame images={images} soft={soft} index={index} handleRef={frameRef} accent="#ff4f8b" />
        </Suspense>
      </Canvas>

      {/* Hairline grid. Structure, not decoration: it marks the panel column. */}
      <div className="stage-grid" aria-hidden />
      {/* Deterministic dark ground under the type column. The shader vignette
          alone is image-dependent, so contrast has to be guaranteed in CSS. */}
      <div className="stage-scrim" aria-hidden />

      <div className="stage-ui">
        <header className="stage-top">
          <span className="stage-mark">NIMDAL.XYZ</span>
          <button type="button" className="stage-quiet" onClick={onExit}>{t.skip}</button>
        </header>

        <div className="stage-panel" key={chapter.key}>
          <p className="stage-eyebrow">{chapter.eyebrow}</p>
          <h1 className="stage-title">{chapter.title}</h1>
          <button type="button" className="stage-cta" onClick={select}>
            {chapter.href ? t.open : t.enter}
          </button>
          <p className="stage-body">{chapter.body}</p>
        </div>

        <footer className="stage-bottom">
          <nav className="stage-rail" aria-label={t.chapters}>
            {chapters.map((item, i) => (
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
          </nav>
          <div className="stage-steps">
            <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label={t.prev}>{"<"}</button>
            <span>{String(index + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => go(1)} disabled={index === chapters.length - 1} aria-label={t.next}>{">"}</button>
          </div>
          <p className="stage-keys">{t.keys}</p>
        </footer>
      </div>
    </div>
  );
}
