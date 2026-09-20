import Link from "next/link";

import { homeSans } from "@/lib/home-fonts";

import "./not-found.css";

export const metadata = {
  title: "404 / Page not found",
  description: "The requested Nimdal route could not be found."
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={homeSans.variable}>
      <body>
        <main className="not-found" id="main-content">
          <p className="not-found-code">404</p>
          <h1>Page not found</h1>
          <p>The address may have changed, or the page moved somewhere else.</p>
          <p lang="ko">주소가 바뀌었거나 페이지가 다른 곳으로 옮겨졌을 수 있어요.</p>
          <div className="not-found-actions">
            <Link href="/en">Back to Nimdal</Link>
            <Link href="/ko" lang="ko">홈으로 돌아가기</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
