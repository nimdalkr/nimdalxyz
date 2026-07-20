import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getWriterAccess } from "@/lib/auth";
import { getBlogEditorPosts } from "@/lib/blog-editor";

import { EditorShell } from "./_components/EditorShell";
import styles from "./write.module.css";

export default async function WriteIndexPage({
  searchParams
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const access = await getWriterAccess();

  if (access.status === "configuration-required" || access.status === "signed-out") {
    redirect("/write/login");
  }

  if (access.status === "forbidden") {
    redirect("/write/forbidden");
  }

  const { pendingSlugs, posts } = await getBlogEditorPosts();
  const { deleted } = await searchParams;
  const pending = new Set(pendingSlugs);
  const sortedPosts = posts.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <EditorShell email={access.session.user?.email ?? ""} section="posts">
      <header className={styles.workspaceHeader}>
        <div>
          <span className={styles.eyebrow}>POST ARCHIVE</span>
          <h1>글 목록</h1>
        </div>
        <Link className={styles.primaryButton} href="/write/new">
          <Plus aria-hidden="true" size={18} weight="bold" />
          새 글
        </Link>
      </header>

      {deleted === "1" ? (
        <p className={styles.pageNotice} role="status">
          삭제 요청을 저장했습니다. 새 배포가 끝나면 목록에서도 사라집니다.
        </p>
      ) : null}

      <div className={styles.postList}>
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post, index) => (
            <Link className={styles.postRow} href={`/write/edit/${post.slug}`} key={post.slug}>
              <span className={styles.postIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong className={styles.postTitle}>{post.ko.title || post.en.title || post.slug}</strong>
                <span className={styles.listMeta}>{post.slug}</span>
              </span>
              <span>
                <span className={styles.status} data-status={pending.has(post.slug) ? "draft" : post.status}>
                  {pending.has(post.slug) ? "자동 처리 대기" : post.status === "published" ? "공개" : "비공개"}
                </span>
                <br />
                <span className={styles.listMeta}>{post.updatedAt}</span>
              </span>
              <span className={styles.postAction}>수정 →</span>
            </Link>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div>
              <p>아직 작성한 글이 없습니다.</p>
              <Link className={styles.primaryButton} href="/write/new">첫 글 쓰기</Link>
            </div>
          </div>
        )}
      </div>
    </EditorShell>
  );
}
