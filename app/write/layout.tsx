import type { Metadata, Viewport } from "next";

import { notoSansKr, plexMono } from "@/lib/fonts";

import styles from "./write.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Write — Nimdal BLOG",
  description: "Nimdal BLOG private writing workspace.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    nosnippet: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050809",
  colorScheme: "light"
};

export default function WriteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${plexMono.variable}`}>
      <body className={styles.body}>{children}</body>
    </html>
  );
}
