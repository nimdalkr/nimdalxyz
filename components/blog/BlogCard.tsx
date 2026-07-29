import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { RisoPlate } from "@/components/riso/RisoPlate";
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

export function BlogCard({ post, highlighted = false }: BlogCardProps) {
  return (
    <article className={styles.archiveCard}>
      <Link
        className={`${styles.archiveRow} ${highlighted ? styles.archiveRowHighlighted : ""}`}
        href={post.canonicalUrl}
      >
        <time className={styles.rowDate} dateTime={post.publishedAt}>{archiveDate(post.publishedAt)}</time>
        <h3 className={styles.rowTitle}>{post.title}</h3>
        <span className={styles.rowCategory}>{post.category}</span>
        <RisoPlate
          className={styles.rowMedia}
          src={post.cover}
          alt=""
          quiet
          offset={7}
          sizes="140px"
        />
        <span className={styles.rowArrow} aria-hidden="true">
          <ArrowRight size={24} weight="regular" />
        </span>
      </Link>
    </article>
  );
}
