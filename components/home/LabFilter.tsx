"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
}

const filterKeys = ["all", "live", "repository", "prototype", "concept", "in-progress"] as const;
type FilterKey = (typeof filterKeys)[number];

export function LabFilter({ items, labels }: LabFilterProps) {
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
      <div className="lab-grid" aria-live="polite">
        {filtered.map((item) => (
          <article className="lab-card" key={item.slug}>
            <Link href={item.href} className="lab-card-media" aria-label={`${item.label}: ${item.title}`}>
              <Image src={item.media} alt={item.mediaAlt} fill sizes="(max-width: 760px) 100vw, 33vw" />
            </Link>
            <div className="lab-card-copy">
              <div className="lab-card-topline">
                <span>{item.status}</span>
                <span>{item.label}</span>
              </div>
              <h3><Link href={item.href}>{item.title}</Link></h3>
              <p>{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
