import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import type { LocalizedBlogPost } from "@/content/blog/posts";

import styles from "./BlogSurface.module.css";

interface BlogCardProps {
  post: LocalizedBlogPost;
  highlighted?: boolean;
  eager?: boolean;
}

function archiveDate(value: string) {
  return value.replaceAll("-", ".");
}

export function BlogCard({ post, highlighted = false, eager = false }: BlogCardProps) {
  return (
    <article className={styles.archiveCard}>
      <Link
        className={`${styles.archiveRow} ${highlighted ? styles.archiveRowHighlighted : ""}`}
        href={post.canonicalUrl}
      >
        <time className={styles.rowDate} dateTime={post.publishedAt}>{archiveDate(post.publishedAt)}</time>
        <span className={styles.rowCategory}>{post.category}</span>
        <h3 className={styles.rowTitle}>{post.title}</h3>
        <span className={styles.rowMedia}>
          <Image
            src={post.cover}
            alt=""
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 720px) 88px, 142px"
            className={styles.image}
          />
        </span>
        <span className={styles.rowArrow} aria-hidden="true">
          <ArrowRight size={26} weight="regular" />
        </span>
      </Link>
    </article>
  );
}
