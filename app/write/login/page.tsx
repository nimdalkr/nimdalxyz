import { redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";

import { GoogleSignInButton } from "../_components/AuthButtons";
import styles from "../write.module.css";

export default async function WriteLoginPage() {
  const access = await getWriterAccess();

  if (access.status === "authorized") {
    redirect("/write");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  const isConfigured = access.status !== "configuration-required";

  return (
    <main className={styles.authPage}>
      <section className={styles.authRail} aria-label="Nimdal BLOG">
        <div>
          <p className={styles.authKicker}>NIMDAL / BLOG</p>
          <p className={styles.authCounter}>PRIVATE DESK · 01/02</p>
        </div>
        <p className={styles.authVertical} aria-hidden="true">WRITE</p>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.authCopy}>
          <span className={styles.eyebrow}>EDITOR ACCESS</span>
          <h1>글쓰기</h1>
          <p>등록된 Google 계정으로 로그인해 글을 쓰고 수정할 수 있습니다.</p>

          {isConfigured ? (
            <GoogleSignInButton />
          ) : (
            <p className={styles.configNotice} role="status">
              인증 환경 설정이 완료되지 않았습니다. 관리자 설정 후 다시 접속해 주세요.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
