"use client";

import { curveMonotoneX, line, scaleLinear, scalePoint } from "d3";
import { useMemo, useState } from "react";

import type { Locale } from "@/lib/content";

import styles from "./NimdalDialogue.module.css";

export type CareerArcItem = {
  id: string;
  period: string;
  organization: string;
  role: string;
  summary: string;
  signal: string;
};

const present = 2026 + 8 / 12;

function periodValue(token: string, isEnd = false) {
  if (/^(now|present)$/i.test(token)) return present;
  const [yearPart, monthPart] = token.split(".");
  const year = Number(yearPart);
  if (!Number.isFinite(year)) return 2012;
  if (monthPart) return year + (Math.max(1, Math.min(12, Number(monthPart))) - 1) / 12;
  return year + (isEnd ? 11 / 12 : 0);
}

function periodBounds(period: string) {
  const tokens = period.match(/\d{4}(?:\.\d{1,2})?|NOW|PRESENT/gi) ?? [];
  const start = periodValue(tokens[0] ?? "2012");
  const end = tokens[1]
    ? periodValue(tokens[1], true)
    : Math.max(start + 8 / 12, present);
  return { start, end: Math.max(start + 0.18, end) };
}

export function CareerTimelineChart({
  items,
  locale
}: {
  items: CareerArcItem[];
  locale: Locale;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const dimensions = useMemo(() => {
    const rows = items.map((item) => ({ ...item, ...periodBounds(item.period) }));
    const min = 2012;
    const max = 2027;
    const x = scaleLinear().domain([min, max]).range([226, 732]);
    return { rows, min, max, x, height: 54 + rows.length * 44 };
  }, [items]);

  const active = dimensions.rows.find((item) => item.id === activeId) ?? dimensions.rows[0];
  const ticks = [2012, 2015, 2018, 2021, 2024, 2026];

  return (
    <figure className={`${styles.dataViz} mt-6 overflow-hidden`} aria-labelledby="career-timeline-title">
      <figcaption className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--rule)] px-4 py-3">
        <span>
          <small>{locale === "ko" ? "인터랙티브 커리어 연대기" : "Interactive career chronology"}</small>
          <strong id="career-timeline-title">{locale === "ko" ? "2012년부터 현재까지의 커리어 아크" : "Career arc since 2012"}</strong>
        </span>
        <em>{active ? `${active.period} · ${active.organization}` : ""}</em>
      </figcaption>
      <div className={styles.timelineCanvas}>
        <svg
          className="block h-auto w-full"
          viewBox={`0 0 760 ${dimensions.height}`}
          role="img"
          aria-label={locale === "ko" ? "2012년부터 현재까지 조직과 역할의 변화를 보여주는 인터랙티브 타임라인" : "Interactive timeline showing organizations and role changes from 2012 to the present"}
        >
          {ticks.map((tick) => (
            <g key={tick} aria-hidden>
              <line x1={dimensions.x(tick)} x2={dimensions.x(tick)} y1={25} y2={dimensions.height - 12} className={styles.chartGridLine} />
              <text x={dimensions.x(tick)} y={17} textAnchor="middle" className={styles.chartTick}>{tick}</text>
            </g>
          ))}
          {dimensions.rows.map((item, index) => {
            const y = 33 + index * 44;
            const isActive = item.id === activeId;
            return (
              <g key={item.id}>
                <line x1={18} x2={742} y1={y + 31} y2={y + 31} className={styles.chartRowLine} aria-hidden />
                <text x={18} y={y + 15} className={isActive ? styles.chartCompanyLabelActive : styles.chartCompanyLabel}>{item.organization}</text>
                <rect
                  x={dimensions.x(item.start)}
                  y={y}
                  width={Math.max(8, dimensions.x(item.end) - dimensions.x(item.start))}
                  height={22}
                  rx={3}
                  className={isActive ? styles.chartBarActive : styles.chartBar}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`${item.organization}, ${item.role}, ${item.period}`}
                  onPointerEnter={() => setActiveId(item.id)}
                  onFocus={() => setActiveId(item.id)}
                  onClick={() => setActiveId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setActiveId(item.id);
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className={styles.timelineMobileList} aria-label={locale === "ko" ? "모바일 커리어 연대기" : "Mobile career chronology"}>
        {dimensions.rows.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveId(item.id)}
            >
              <span>{item.period}</span>
              <strong>{item.organization}</strong>
              <small>{item.role}</small>
            </button>
          );
        })}
      </div>
      {active ? (
        <div className={styles.timelineSelection} aria-live="polite">
          <span>{active.period}</span>
          <div>
            <strong>{active.organization}</strong>
            <small>{active.role}</small>
          </div>
          <p>{active.summary}</p>
          <em>{active.signal}</em>
        </div>
      ) : null}
      <p className="border-t border-[var(--rule)] px-4 py-3">
        {locale === "ko" ? "창업, 커뮤니티, 에이전시와 제품 운영이 병행된 기간은 의도적으로 겹쳐 표시했어요." : "Overlaps are intentional: venture, community, agency, and product roles sometimes ran in parallel."}
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
