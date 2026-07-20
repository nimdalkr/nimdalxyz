"use client";

import { ArrowClockwise } from "@phosphor-icons/react";

import styles from "./write.module.css";

export default function WriteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className={styles.authPage}>
      <section className={styles.authRail} aria-hidden="true">
        <p className={styles.authKicker}>NIMDAL / BLOG</p>
        <p className={styles.authVertical}>ERROR</p>
      </section>
      <section className={styles.authPanel}>
        <div className={styles.authCopy}>
          <span className={styles.eyebrow}>EDITOR ERROR</span>
          <h1>불러오지 못했습니다</h1>
          <p>잠시 뒤 다시 시도해 주세요. 같은 문제가 계속되면 저장소 연결 설정을 확인해 주세요.</p>
          <button className={styles.primaryButton} type="button" onClick={reset}>
            <ArrowClockwise aria-hidden="true" size={18} />
            다시 시도
          </button>
        </div>
      </section>
    </main>
  );
}
