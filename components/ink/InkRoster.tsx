"use client";

import { useState } from "react";

/**
 * The roster.
 *
 * Fourteen years of clients written out by hand. Each category is a tab cut
 * into the paper; choosing one stamps it and the names underneath are inked
 * in one after another, the way a clerk copies a list into a fresh ledger.
 */

export type RosterGroup = {
  id: string;
  label: string;
  names: ReadonlyArray<string>;
};

/**
 * The count line arrives as a template rather than a formatter, because a
 * server component cannot hand a function to a client component.
 */
export function InkRoster({
  groups,
  countTemplate
}: {
  groups: ReadonlyArray<RosterGroup>;
  countTemplate: string;
}) {
  const [active, setActive] = useState(0);
  const group = groups[active];

  const pick = (index: number) => {
    setActive(index);
    window.dispatchEvent(new Event("ink-stamp"));
  };

  return (
    <div className="ink-roster">
      <div className="ink-roster-tabs" role="tablist" aria-label={group.label}>
        {groups.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`roster-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls={`roster-panel-${item.id}`}
            className={index === active ? "is-active" : undefined}
            onClick={() => pick(index)}
          >
            {item.label}
            <i>{item.names.length}</i>
          </button>
        ))}
      </div>
      <div
        className="ink-roster-panel"
        role="tabpanel"
        id={`roster-panel-${group.id}`}
        aria-labelledby={`roster-tab-${group.id}`}
      >
        <ul className="ink-roster-names" key={group.id}>
          {group.names.map((name, index) => (
            <li key={name} style={{ animationDelay: `${Math.min(index, 14) * 45}ms` }}>
              {name}
            </li>
          ))}
        </ul>
        <p className="ink-roster-count">
          {countTemplate.replace("{n}", String(group.names.length))}
        </p>
      </div>
    </div>
  );
}
