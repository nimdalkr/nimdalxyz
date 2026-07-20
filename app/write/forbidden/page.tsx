import Link from "next/link";

import { getWriterAccess } from "@/lib/auth";

import { SignOutButton } from "../_components/AuthButtons";
import styles from "../write.module.css";

interface ForbiddenPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function WriteForbiddenPage({ searchParams }: ForbiddenPageProps) {
  const [{ error }, access] = await Promise.all([searchParams, getWriterAccess()]);
  const email = access.session?.user?.email;

  return (
    <main className={styles.authPage}>
      <section className={styles.authRail} aria-label="Nimdal BLOG">
        <div>
          <p className={styles.authKicker}>NIMDAL / BLOG</p>
          <p className={styles.authCounter}>ACCESS DENIED · 02/02</p>
        </div>
        <p className={styles.authVertical}>STOP</p>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.authCopy}>
          <span className={styles.eyebrow}>PRIVATE EDITOR</span>
          <h1>접근할 수 없습니다</h1>
          <p>
            {error === "AccessDenied"
              ? "글쓰기 권한이 없는 Google 계정입니다."
              : "이 계정에는 글쓰기 권한이 없습니다."}
          </p>
          {email ? <p className={styles.accountLabel}>{email}</p> : null}
          <div className={styles.authActions}>
            {email ? <SignOutButton /> : <Link className={styles.primaryButton} href="/write/login">다른 계정으로 로그인</Link>}
            <Link className={styles.textLink} href="/ko">블로그로 돌아가기</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
