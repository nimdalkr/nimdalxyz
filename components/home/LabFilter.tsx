"use client";

import Link from "next/link";
import { useState } from "react";

import { Reveal } from "@/components/riso/Reveal";
import { RisoPlate } from "@/components/riso/RisoPlate";

interface LabItem {
  slug: string;
  title: string;
  summary: string;
  status: string;
  statusKey: "live" | "repository" | "prototype" | "concept" | "in-progress";
  media: string;
  mediaAlt: string;
  href: string;
  label: string;
}

interface LabFilterProps {
  items: readonly LabItem[];
  labels: {
    all: string;
    live: string;
    repository: string;
    prototype: string;
    concept: string;
    inProgress: string;
    filterLabel: string;
  };
  empty: { title: string; body: string };
}

const filterKeys = ["all", "live", "repository", "prototype", "concept", "in-progress"] as const;
type FilterKey = (typeof filterKeys)[number];

export function LabFilter({ items, labels, empty }: LabFilterProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = filter === "all" ? items : items.filter((item) => item.statusKey === filter);
  const availableFilters = filterKeys.filter(
    (key) => key === "all" || items.some((item) => item.statusKey === key)
  );
  const filterLabels: Record<FilterKey, string> = {
    all: labels.all,
    live: labels.live,
    repository: labels.repository,
    prototype: labels.prototype,
    concept: labels.concept,
    "in-progress": labels.inProgress
  };

  return (
    <div>
      <div className="filter-row" role="toolbar" aria-label={labels.filterLabel}>
        {availableFilters.map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "is-active" : undefined}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            {filterLabels[key]}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="lab-grid" aria-live="polite">
          {filtered.map((item, index) => (
            <Reveal key={item.slug} as="article" className="lab-item" index={index}>
              <Link href={item.href} className="work-link" aria-label={`${item.label}: ${item.title}`}>
                <RisoPlate
                  className="lab-plate"
                  src={item.media}
                  alt={item.mediaAlt}
                  sizes="(max-width: 767px) 100vw, (max-width: 1024px) 45vw, 30vw"
                />
              </Link>
              <div>
                <p className="work-meta">
                  <span className={item.statusKey === "live" ? "is-live" : undefined}>{item.status}</span>
                </p>
                <h3><Link href={item.href}>{item.title}</Link></h3>
                <p>{item.summary}</p>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="lab-empty" aria-live="polite">
          <h3>{empty.title}</h3>
          <p>{empty.body}</p>
        </div>
      )}
    </div>
  );
}
