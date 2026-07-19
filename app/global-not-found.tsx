import Link from "next/link";

import { notoSansKr, plexMono } from "@/lib/fonts";

import "./globals.css";

export const metadata = {
  title: "404 — Lost signal",
  description: "The requested Nimdal route could not be found."
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${notoSansKr.variable} ${plexMono.variable}`}>
      <body>
        <main className="not-found-page" id="main-content">
          <p className="section-kicker">404 / LOST SIGNAL</p>
          <h1>Nothing surfaced here.</h1>
          <p>The route may have moved deeper into the archive.</p>
          <Link className="text-link" href="/ko">Return to Nimdal</Link>
        </main>
      </body>
    </html>
  );
}
