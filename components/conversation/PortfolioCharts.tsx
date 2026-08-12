"use client";

import { curveMonotoneX, line, scaleLinear, scalePoint } from "d3";
import { useMemo, useState } from "react";

import type { Locale } from "@/lib/content";

import styles from "./NimdalDialogue.module.css";

type TimelineItem = {
  id: string;
  period: string;
  title: string;
};

function periodBounds(period: string) {
  const years = period.match(/\d{4}/g)?.map(Number) ?? [];
  const start = years[0] ?? 2012;
  return { start, end: years[1] ?? 2026 };
}

export function CareerTimelineChart({
  items,
  locale,
  onSelect
}: {
  items: TimelineItem[];
  locale: Locale;
  onSelect: (id: string, title: string) => void;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const dimensions = useMemo(() => {
    const rows = items.map((item) => ({ ...item, ...periodBounds(item.period) }));
    const min = Math.min(...rows.map((item) => item.start), 2012);
    const max = Math.max(...rows.map((item) => item.end), 2026);
    const x = scaleLinear().domain([min, max]).range([118, 696]);
    return { rows, min, max, x, height: 58 + rows.length * 42 };
  }, [items]);

  const active = dimensions.rows.find((item) => item.id === activeId) ?? dimensions.rows[0];
  const ticks = dimensions.x.ticks(Math.min(7, dimensions.max - dimensions.min));

  return (
    <figure className={`${styles.dataViz} mt-6 overflow-hidden`} aria-labelledby="career-timeline-title">
      <figcaption className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--rule)] px-4 py-3">
        <span>
          <small>{locale === "ko" ? "D3 경력 지도" : "D3 career map"}</small>
          <strong id="career-timeline-title">{locale === "ko" ? "동시에 운영한 프로젝트의 시간축" : "Career cases across time"}</strong>
        </span>
        <em>{active ? `${active.period} · ${active.title}` : ""}</em>
      </figcaption>
      <svg
        className="block h-auto w-full"
        viewBox={`0 0 720 ${dimensions.height}`}
        role="img"
        aria-label={locale === "ko" ? "경력 사례의 시작과 종료 연도를 보여주는 인터랙티브 타임라인" : "Interactive timeline showing the start and end years of career cases"}
      >
        {ticks.map((tick) => (
          <g key={tick} aria-hidden>
            <line x1={dimensions.x(tick)} x2={dimensions.x(tick)} y1={24} y2={dimensions.height - 16} className={styles.chartGridLine} />
            <text x={dimensions.x(tick)} y={17} textAnchor="middle" className={styles.chartTick}>{tick}</text>
          </g>
        ))}
        {dimensions.rows.map((item, index) => {
          const y = 35 + index * 42;
          const isActive = item.id === activeId;
          return (
            <g key={item.id}>
              <text x={98} y={y + 16} textAnchor="end" className={styles.chartLabel}>{String(index + 1).padStart(2, "0")}</text>
              <rect
                x={dimensions.x(item.start)}
                y={y}
                width={Math.max(8, dimensions.x(item.end) - dimensions.x(item.start))}
                height={22}
                rx={3}
                className={isActive ? styles.chartBarActive : styles.chartBar}
                role="button"
                tabIndex={0}
                aria-label={`${item.title}, ${item.period}`}
                onPointerEnter={() => setActiveId(item.id)}
                onFocus={() => setActiveId(item.id)}
                onClick={() => onSelect(item.id, item.title)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onSelect(item.id, item.title);
                }}
              />
            </g>
          );
        })}
      </svg>
      <p className="border-t border-[var(--rule)] px-4 py-3">
        {locale === "ko" ? "막대를 선택하면 해당 경력 사례를 이 대화에서 확인할 수 있어요." : "Select a bar to open that career case in this conversation."}
      </p>
    </figure>
  );
}

export function CommunityGrowthChart({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const data = locale === "ko"
    ? [{ label: "초기 활성 인원", value: 200 }, { label: "성장 후 활성 인원", value: 3000 }]
    : [{ label: "Initial active members", value: 200 }, { label: "Active members after growth", value: 3000 }];
  const width = 720;
  const height = 250;
  const x = scalePoint<string>().domain(data.map((item) => item.label)).range([90, width - 70]);
  const y = scaleLinear().domain([0, 3200]).nice().range([height - 48, 34]);
  const path = line<(typeof data)[number]>()
    .x((item) => x(item.label) ?? 0)
    .y((item) => y(item.value))
    .curve(curveMonotoneX)(data) ?? "";

  return (
    <figure className={`${styles.dataViz} mt-6 overflow-hidden`} aria-labelledby="community-growth-title">
      <figcaption className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--rule)] px-4 py-3">
        <span>
          <small>{locale === "ko" ? "검증 범위 내 수치" : "Recorded metric"}</small>
          <strong id="community-growth-title">{locale === "ko" ? "한국 활성 커뮤니티 성장" : "Korean active-community growth"}</strong>
        </span>
        <em>{data[activeIndex].value.toLocaleString()}+</em>
      </figcaption>
      <svg className="block h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={locale === "ko" ? "활성 커뮤니티가 약 200명에서 3천명 이상으로 성장한 기록" : "Recorded active-community growth from roughly 200 to more than 3,000"}>
        {y.ticks(4).map((tick) => (
          <g key={tick} aria-hidden>
            <line x1={70} x2={width - 50} y1={y(tick)} y2={y(tick)} className={styles.chartGridLine} />
            <text x={60} y={y(tick) + 4} textAnchor="end" className={styles.chartTick}>{tick.toLocaleString()}</text>
          </g>
        ))}
        <path d={path} className={styles.chartLine} />
        {data.map((item, index) => (
          <g key={item.label}>
            <circle
              cx={x(item.label)}
              cy={y(item.value)}
              r={activeIndex === index ? 10 : 7}
              className={activeIndex === index ? styles.chartPointActive : styles.chartPoint}
              tabIndex={0}
              role="button"
              aria-label={`${item.label}: ${item.value.toLocaleString()}`}
              onPointerEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            />
            <text x={x(item.label)} y={height - 20} textAnchor="middle" className={styles.chartAxisLabel}>{item.label}</text>
          </g>
        ))}
      </svg>
      <p className="border-t border-[var(--rule)] px-4 py-3">
        {locale === "ko" ? "두 공개 기록 지점만 표시하며 중간 성장률은 추정하지 않았어요." : "Only the two recorded endpoints are shown; no intermediate growth rate is inferred."}
      </p>
    </figure>
  );
}
