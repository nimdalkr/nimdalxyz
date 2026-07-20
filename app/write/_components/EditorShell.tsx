import { ArrowSquareOut, FileText, Plus } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import styles from "../write.module.css";
import { SignOutButton } from "./AuthButtons";

type EditorShellProps = {
  children: React.ReactNode;
  email: string;
  section: "posts" | "new" | "edit";
};

export function EditorShell({ children, email, section }: EditorShellProps) {
  return (
    <main className={styles.shell}>
      <aside className={styles.rail} aria-label="글쓰기 메뉴">
        <div>
          <Link className={styles.railBrand} href="/write" aria-label="Nimdal BLOG 글 목록">
            <Image
              className={styles.railAvatar}
              src="/media/identity-octopus.jpg"
              alt="Nimdal 픽셀 문어"
              width={72}
              height={72}
              priority
            />
            <span className={styles.railBrandType}>
              <strong>NIMDAL</strong>
              <span>/ BLOG</span>
            </span>
          </Link>

          <p className={styles.railIndex}>PRIVATE DESK · 01/02</p>

          <nav className={styles.railNav}>
            <Link
              href="/write"
              className={section === "posts" || section === "edit" ? styles.railNavActive : undefined}
            >
              <FileText aria-hidden="true" size={19} />
              글 목록
            </Link>
            <Link href="/write/new" className={section === "new" ? styles.railNavActive : undefined}>
              <Plus aria-hidden="true" size={19} />
              새 글
            </Link>
            <a href="/ko" target="_blank" rel="noreferrer">
              <ArrowSquareOut aria-hidden="true" size={19} />
              블로그 보기
            </a>
          </nav>
        </div>

        <div className={styles.railAccount}>
          <span>GOOGLE ACCOUNT</span>
          <strong>{email}</strong>
          <SignOutButton />
        </div>
      </aside>

      <section className={styles.workspace}>{children}</section>
    </main>
  );
}
