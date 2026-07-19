"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";

interface ProofItem {
  src: string;
  alt: string;
  label: string;
  caption: string;
  role: string;
}

interface ProofSwitcherProps {
  items: readonly ProofItem[];
}

export function ProofSwitcher({ items }: ProofSwitcherProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = items[activeIndex];

  function selectTab(index: number, moveFocus = false) {
    setActiveIndex(index);
    if (moveFocus) tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(nextIndex, true);
  }

  if (!active) {
    return null;
  }

  return (
    <div className="proof-switcher">
      {items.length > 1 ? (
        <div className="proof-switcher-tabs" role="tablist" aria-label="Project media">
          {items.map((item, index) => (
            <button
              key={`${item.src}-${item.label}`}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel`}
              aria-selected={activeIndex === index}
              tabIndex={activeIndex === index ? 0 : -1}
              className={activeIndex === index ? "is-active" : undefined}
              ref={(node) => { tabRefs.current[index] = node; }}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(index, event)}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <div
        id={`${id}-panel`}
        role={items.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={items.length > 1 ? `${id}-tab-${activeIndex}` : undefined}
      >
        <figure>
          <div className="proof-switcher-media">
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt}
              fill
              sizes="(max-width: 900px) 100vw, 68vw"
            />
          </div>
          <figcaption>
            <span>{active.role}</span>
            <p>{active.caption}</p>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
