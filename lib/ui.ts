import type { Locale, ProjectMediaRole } from "@/lib/content";

export const uiCopy = {
  ko: {
    header: { work: "작업", lab: "Lab", about: "소개", log: "기록", contact: "연락" },
    selected: {
      eyebrow: "Selected proof",
      title: "아이디어보다 작동하는 증거를 먼저 봅니다.",
      description: "실서비스, 공개 저장소, QA 화면처럼 확인 가능한 표면이 강한 순서로 대표 작업을 배치했습니다.",
      open: "케이스 스터디",
      live: "실서비스"
    },
    practice: {
      eyebrow: "Dual practice",
      title: "캠페인 운영과 제품 시스템을 하나의 루프로 다룹니다.",
      operations: "Growth operations",
      product: "Product systems",
      operationsBody: "시장·검색·콘텐츠·KOL·리포팅 신호를 실행 가능한 운영 구조로 만듭니다.",
      productBody: "반복되는 조사와 판단을 읽기 쉬운 인터페이스, 자동화, 도구로 바꿉니다."
    },
    lab: {
      all: "전체", live: "공개", repository: "저장소", prototype: "프로토타입", concept: "보관", inProgress: "제작 중",
      archive: "전체 Lab 보기"
    },
    about: {
      eyebrow: "Operator dossier",
      title: "Nimdal 뒤에서 문제를 구조화하고 끝까지 운영하는 사람.",
      body: "탁찬우는 서울을 기반으로 캠페인 운영, 웹3 한국 GTM, 리서치 도구와 개인 제품을 연결합니다. 공개 수치는 증거 경계와 함께 읽을 수 있게 표시합니다.",
      dossier: "전체 경력 보기",
      download: "영문 PDF 다운로드"
    },
    log: { all: "nimdalog 전체 보기" },
    contact: { x: "X", telegram: "Telegram", linkedin: "LinkedIn" },
    proof: { concept: "Concept visual", proof: "Live / Repository / QA proof", identity: "Identity asset", career: "Career context", document: "Document" },
    provenance: { "repository-count": "Repository count", "career-record": "Career record", "portfolio-claim": "Portfolio claim" },
    project: { back: "Selected work", visit: "외부 표면 열기", source: "출처", captured: "캡처", claim: "이 화면이 말하는 것", boundary: "증거 한계", nextProject: "다음 프로젝트", status: "현재 상태" }
  },
  en: {
    header: { work: "Work", lab: "Lab", about: "About", log: "Log", contact: "Contact" },
    selected: {
      eyebrow: "Selected proof",
      title: "Working evidence comes before the idea.",
      description: "Representative work is ordered by the strength of its inspectable surface: live product, public repository, or QA screen.",
      open: "Case study",
      live: "Live surface"
    },
    practice: {
      eyebrow: "Dual practice",
      title: "Campaign operations and product systems share one working loop.",
      operations: "Growth operations",
      product: "Product systems",
      operationsBody: "Turn market, search, content, KOL, and reporting signals into an executable operating frame.",
      productBody: "Turn recurring research and judgment into readable interfaces, automation, and tools."
    },
    lab: {
      all: "All", live: "Live", repository: "Repository", prototype: "Prototype", concept: "Archived", inProgress: "In progress",
      archive: "View full Lab"
    },
    about: {
      eyebrow: "Operator dossier",
      title: "The operator behind Nimdal: framing the problem and staying through delivery.",
      body: "Tak Chanwoo connects campaign operations, Korean Web3 GTM, research tools, and personal products from Seoul. Public figures are always shown with their evidence boundaries.",
      dossier: "View full career",
      download: "Download English PDF"
    },
    log: { all: "View all nimdalog" },
    contact: { x: "X", telegram: "Telegram", linkedin: "LinkedIn" },
    proof: { concept: "Concept visual", proof: "Live / Repository / QA proof", identity: "Identity asset", career: "Career context", document: "Document" },
    provenance: { "repository-count": "Repository count", "career-record": "Career record", "portfolio-claim": "Portfolio claim" },
    project: { back: "Selected work", visit: "Open external surface", source: "Source", captured: "Captured", claim: "What this screen supports", boundary: "Evidence boundary", nextProject: "Next project", status: "Current status" }
  }
} as const satisfies Record<Locale, unknown>;

export function mediaRoleLabel(locale: Locale, role: ProjectMediaRole) {
  return uiCopy[locale].proof[role];
}
