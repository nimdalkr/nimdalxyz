"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const isKorean = params.locale === "ko";

  return (
    <main className="not-found-page" id="main-content">
      <p className="section-kicker">404 / {isKorean ? "경로 없음" : "LOST SIGNAL"}</p>
      <h1>{isKorean ? "페이지를 찾을 수 없습니다." : "Nothing surfaced here."}</h1>
      <p>
        {isKorean
          ? "주소가 바뀌었거나 페이지가 이동했을 수 있습니다."
          : "The route may have moved deeper into the archive."}
      </p>
      <Link className="text-link" href={isKorean ? "/ko" : "/en"}>
        {isKorean ? "Nimdal 홈으로" : "Return to Nimdal"}
      </Link>
    </main>
  );
}
