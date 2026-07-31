import Link from "next/link";

import { bricolage, notoSerifKr, plexMono } from "@/lib/fonts";

import "./globals.css";

export const metadata = {
  title: "404 / Page not found",
  description: "The requested Nimdal route could not be found."
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${bricolage.variable} ${notoSerifKr.variable} ${plexMono.variable}`}>
      <body>
        <main className="not-found-page" id="main-content">
          <p className="press-mark">404</p>
          <h1>This page is not in the run.</h1>
          <p>The address may have changed, or the page moved somewhere else.</p>
          <Link className="rule-link" href="/en">Back to Nimdal</Link>
        </main>
      </body>
    </html>
  );
}
