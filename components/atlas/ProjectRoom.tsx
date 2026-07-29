"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

import type { AtlasLandmark, CaseRoom } from "@/lib/atlas/world";
import type { Locale } from "@/lib/content";

export type RoomData =
  | { variant: "project"; hue: string; landmark: AtlasLandmark }
  | { variant: "case"; hue: string; place: string; caseRoom: CaseRoom };

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
    objective: "목표",
    role: "담당",
    result: "결과",
    channels: "채널",
    proof: "남은 화면",
    live: "라이브 제품",
    repo: "저장소",
    full: "전체 기록 보기",
    career: "경력 전체 보기",
    ascend: "올라가기",
    close: "룸 닫기"
  },
  en: {
    problem: "Problem",
    decision: "Decision",
    system: "System",
    objective: "Objective",
    role: "Ownership",
    result: "Outcome",
    channels: "Channels",
    proof: "Screens that remain",
    live: "Live product",
    repo: "Repository",
    full: "Read the full record",
    career: "See the full career",
    ascend: "Ascend",
    close: "Close the room"
  }
} as const;

interface ProjectRoomProps {
  data: RoomData;
  locale: Locale;
  onClose: () => void;
}

export function ProjectRoom({ data, locale, onClose }: ProjectRoomProps) {
  const t = ui[locale];
  const heading = useRef<HTMLHeadingElement>(null);

  // The room is a dialog: focus moves in on open and back out on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    heading.current?.focus();
    return () => previous?.focus?.();
  }, []);

  const isProject = data.variant === "project";
  const title = isProject ? data.landmark.title : data.caseRoom.title;
  const placeLine = isProject
    ? `${data.landmark.place} · ${data.landmark.category}`
    : `${data.place} · ${data.caseRoom.period}`;
  const sections = isProject
    ? [
        { key: "problem", label: t.problem, body: data.landmark.detail.problem },
        { key: "decision", label: t.decision, body: data.landmark.detail.decision },
        { key: "system", label: t.system, body: data.landmark.detail.system }
      ]
    : [
        { key: "objective", label: t.objective, body: data.caseRoom.objective },
        { key: "role", label: t.role, body: data.caseRoom.role },
        { key: "result", label: t.result, body: data.caseRoom.result }
      ];
  const media = isProject ? data.landmark.media : data.caseRoom.media;
  const proofIntro = isProject ? data.landmark.detail.proof : data.caseRoom.context;

  return (
    <div
      className="room"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-title"
      style={{ "--room-accent": data.hue } as React.CSSProperties}
    >
      <div className="room-inner">
        <header className="room-head">
          <div>
            <p className="room-place">{placeLine}</p>
            <h2 className="room-title" id="room-title" ref={heading} tabIndex={-1}>
              {title}
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

        <section className="room-proof" aria-label={isProject ? t.proof : t.channels}>
          <h3>{isProject ? t.proof : t.channels}</h3>
          {isProject ? (
            <p>{proofIntro}</p>
          ) : (
            <>
              <p>{proofIntro}</p>
              <ul className="room-chips">
                {data.caseRoom.channels.map((channel) => <li key={channel}>{channel}</li>)}
              </ul>
            </>
          )}
          <div className="room-shots">
            {media.map((item) => (
              <figure key={item.src}>
                <div className="room-shot">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 900px) 100vw, 40vw"
                  />
                </div>
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <footer className="room-foot">
          {isProject && data.landmark.liveUrl ? (
            <a className="room-link is-primary" href={data.landmark.liveUrl} target="_blank" rel="noreferrer">
              {t.live}
            </a>
          ) : null}
          {isProject && data.landmark.repositoryUrl ? (
            <a className="room-link" href={data.landmark.repositoryUrl} target="_blank" rel="noreferrer">
              {t.repo}
            </a>
          ) : null}
          {isProject ? (
            <Link className="room-link" href={data.landmark.href}>{t.full}</Link>
          ) : (
            <Link className="room-link" href={`/${locale}/portfolio`}>{t.career}</Link>
          )}
        </footer>
      </div>
    </div>
  );
}
