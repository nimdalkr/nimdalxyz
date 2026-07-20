import styles from "./write.module.css";

export default function WriteLoading() {
  return (
    <main className={styles.authPage} aria-busy="true" aria-live="polite">
      <section className={styles.authRail} aria-hidden="true">
        <p className={styles.authKicker}>NIMDAL / BLOG</p>
        <p className={styles.authVertical}>WAIT</p>
      </section>
      <section className={styles.authPanel}>
        <div className={styles.authCopy}>
          <span className={styles.eyebrow}>PRIVATE DESK</span>
          <h1>불러오는 중</h1>
        </div>
      </section>
    </main>
  );
}
