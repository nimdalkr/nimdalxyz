"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const isKorean = params.locale === "ko";

  return (
    <main className="not-found-page" id="main-content">
      <p className="press-mark">404</p>
      <h1>{isKorean ? "이 페이지는 없습니다." : "This page is not in the run."}</h1>
      <p>
        {isKorean
          ? "주소가 바뀌었거나 페이지가 다른 곳으로 옮겨졌을 수 있습니다."
          : "The address may have changed, or the page moved somewhere else."}
      </p>
      <Link className="rule-link" href={isKorean ? "/ko" : "/en"}>
        {isKorean ? "홈으로 돌아가기" : "Back to Nimdal"}
      </Link>
    </main>
  );
}
