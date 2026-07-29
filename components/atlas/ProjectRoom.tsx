"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import type { AtlasLandmark } from "@/lib/atlas/world";
import type { Locale } from "@/lib/content";

/**
 * A station's room.
 *
 * Entering a project does not leave the dive: the ocean darkens behind and the
 * room opens over it in the same language. The screen is legible here because
 * this is where a screen is meant to be read. DOM rather than canvas, so the
 * text selects, the reader reads, and the keyboard works for free.
 */

const ui = {
  ko: {
    problem: "문제",
    decision: "판단",
    system: "시스템",
    proof: "남은 화면",
    live: "라이브 제품",
    repo: "저장소",
    full: "전체 기록 보기",
    ascend: "올라가기",
    close: "룸 닫기"
  },
  en: {
    problem: "Problem",
    decision: "Decision",
    system: "System",
    proof: "Screens that remain",
    live: "Live product",
    repo: "Repository",
    full: "Read the full record",
    ascend: "Ascend",
    close: "Close the room"
  }
} as const;

interface ProjectRoomProps {
  landmark: AtlasLandmark;
  locale: Locale;
  onClose: () => void;
}

export function ProjectRoom({ landmark, locale, onClose }: ProjectRoomProps) {
  const t = ui[locale];
  const heading = useRef<HTMLHeadingElement>(null);

  // The room is a dialog: focus moves in on open and back out on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    heading.current?.focus();
    return () => previous?.focus?.();
  }, []);

  const sections = [
    { key: "problem", label: t.problem, body: landmark.detail.problem },
    { key: "decision", label: t.decision, body: landmark.detail.decision },
    { key: "system", label: t.system, body: landmark.detail.system }
  ];

  return (
    <div
      className="room"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-title"
      style={{ "--room-accent": landmark.hue } as React.CSSProperties}
    >
      <div className="room-inner">
        <header className="room-head">
          <div>
            <p className="room-place">{landmark.place} · {landmark.category}</p>
            <h2 className="room-title" id="room-title" ref={heading} tabIndex={-1}>
              {landmark.title}
            </h2>
          </div>
          <button type="button" className="room-ascend" onClick={onClose} aria-label={t.close}>
            {t.ascend} <span aria-hidden>ESC</span>
          </button>
        </header>

        <div className="room-columns">
          {sections.map((section) => (
            <section key={section.key} aria-label={section.label}>
              <h3>{section.label}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <section className="room-proof" aria-label={t.proof}>
          <h3>{t.proof}</h3>
          <p>{landmark.detail.proof}</p>
          <div className="room-shots">
            {landmark.media.map((media) => (
              <figure key={media.src}>
                <div className="room-shot">
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                </div>
                <figcaption>{media.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <footer className="room-foot">
          {landmark.liveUrl ? (
            <a className="room-link is-primary" href={landmark.liveUrl} target="_blank" rel="noreferrer">
              {t.live}
            </a>
          ) : null}
          {landmark.repositoryUrl ? (
            <a className="room-link" href={landmark.repositoryUrl} target="_blank" rel="noreferrer">
              {t.repo}
            </a>
          ) : null}
          <Link className="room-link" href={landmark.href}>{t.full}</Link>
        </footer>
      </div>
    </div>
  );
}
