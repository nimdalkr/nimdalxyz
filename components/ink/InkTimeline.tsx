"use client";

import { useState } from "react";

import { InkStroke } from "./InkStroke";

/**
 * Fourteen years as one stroke.
 *
 * A drawn line crosses the band and five drops of ink sit along it, one per
 * era. Pointing at a drop brings its era up; clicking stamps it (and thumps,
 * if the sound is on). The active drop turns to seal paste.
 */

export type InkEra = {
  year: string;
  org: string;
  title: string;
  body: string;
  signal: string;
};

const OFFSETS = [14, 2, 18, 0, 10];

export function InkTimeline({ eras, label }: { eras: ReadonlyArray<InkEra>; label: string }) {
  const [active, setActive] = useState(0);
  const era = eras[active];

  const pick = (index: number) => {
    setActive(index);
    window.dispatchEvent(new Event("ink-stamp"));
  };

  return (
    <div className="ink-timeline">
      <div className="ink-timeline-strip" role="group" aria-label={label}>
        <InkStroke
          className="ink-timeline-line"
          d="M10 30 C 240 12, 520 44, 760 22 S 1120 30, 1190 26"
          viewBox="0 0 1200 56"
          strokeWidth={7}
          preserve="none"
        />
        <div className="ink-timeline-nodes">
          {eras.map((item, index) => (
            <button
              key={item.year + item.org}
              type="button"
              className={index === active ? "ink-node is-active" : "ink-node"}
              style={{ transform: `translateY(${OFFSETS[index % OFFSETS.length]}px)` }}
              onClick={() => pick(index)}
              onPointerEnter={() => setActive(index)}
              aria-pressed={index === active}
            >
              <span className="ink-node-dot" aria-hidden />
              <span className="ink-node-year">{item.year}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ink-timeline-card" aria-live="polite">
        <div className="ink-timeline-cardIn" key={active}>
          <p className="ink-timeline-meta">{era.year} · {era.org}</p>
          <h3>{era.title}</h3>
          <p className="ink-timeline-body">{era.body}</p>
          <p className="ink-timeline-signal">{era.signal}</p>
        </div>
      </div>
    </div>
  );
}
