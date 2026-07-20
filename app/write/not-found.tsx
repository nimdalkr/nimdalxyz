import Link from "next/link";

import styles from "./write.module.css";

export default function WriteNotFound() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authRail} aria-hidden="true">
        <p className={styles.authKicker}>NIMDAL / BLOG</p>
        <p className={styles.authVertical}>404</p>
      </section>
      <section className={styles.authPanel}>
        <div className={styles.authCopy}>
          <span className={styles.eyebrow}>NOT FOUND</span>
          <h1>글을 찾을 수 없습니다</h1>
          <p>삭제되었거나 주소가 잘못된 글입니다.</p>
          <Link className={styles.primaryButton} href="/write">글 목록</Link>
        </div>
      </section>
    </main>
  );
}
