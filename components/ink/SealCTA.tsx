"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * The visitor's seal.
 *
 * Contact is not a button here, it is an act: press and hold the blank seal
 * and it stamps your mark beside the author's signature. The mark stays for
 * the session, the way a guest's seal stays in a visitors' book.
 */

const STORE = "ink-visitor-seal";

export function SealCTA({
  holdLabel,
  doneLabel
}: {
  holdLabel: string;
  doneLabel: string;
}) {
  const [stamped, setStamped] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const mark = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORE) === "yes") setStamped(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!stamped || !mark.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      mark.current,
      { scale: 1.9, opacity: 0, rotate: 14 },
      { scale: 1, opacity: 1, rotate: 3, duration: 0.3, ease: "power3.in" }
    );
  }, [stamped]);

  const begin = () => {
    if (stamped) return;
    holdTimer.current = window.setTimeout(() => {
      setStamped(true);
      try { window.sessionStorage.setItem(STORE, "yes"); } catch {}
    }, 550);
  };
  const cancel = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  return (
    <div className="seal-cta-row">
      <button
        type="button"
        className={stamped ? "seal-cta is-stamped" : "seal-cta"}
        onPointerDown={begin}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setStamped(true); } }}
        aria-pressed={stamped}
      >
        {stamped ? doneLabel : holdLabel}
      </button>
      {stamped ? (
        <span ref={mark} className="seal seal-visitor" aria-hidden>覽</span>
      ) : null}
    </div>
  );
}
