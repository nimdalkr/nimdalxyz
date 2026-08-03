"use client";

import { useState } from "react";

/**
 * The roster.
 *
 * A selection of the clients from fourteen years, not the whole ledger. Each
 * category is a tab cut into the paper; choosing one stamps it and the names
 * underneath are inked in one after another, the way a clerk copies a list
 * into a fresh page.
 *
 * Every line carries a mark at its left: a real logo where one is on file,
 * otherwise a small seal cut from the first letter of the name.
 */

export type RosterName = string | { name: string; logo: string };

export type RosterGroup = {
  id: string;
  label: string;
  names: ReadonlyArray<RosterName>;
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
          {group.names.map((item, index) => {
            const entry = typeof item === "string" ? { name: item, logo: undefined } : item;
            const delay = `${Math.min(index, 14) * 45}ms`;
            return (
              <li key={entry.name} style={{ animationDelay: delay }}>
                {entry.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img className="ink-roster-mark is-logo" src={entry.logo} alt="" style={{ animationDelay: delay }} />
                ) : (
                  <span className="ink-roster-mark" aria-hidden style={{ animationDelay: delay }}>
                    {entry.name.trim().charAt(0)}
                  </span>
                )}
                <span className="ink-roster-name">{entry.name}</span>
              </li>
            );
          })}
        </ul>
        <p className="ink-roster-count">
          {countTemplate.replace("{n}", String(group.names.length))}
        </p>
      </div>
    </div>
  );
}
