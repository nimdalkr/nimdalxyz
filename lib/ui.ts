import type { Locale, ProjectMediaRole } from "@/lib/content";

export const uiCopy = {
  ko: {
    header: { work: "대표 작업", lab: "프로젝트", about: "소개", log: "글", contact: "연락" },
    selected: {
      eyebrow: "대표 작업",
      title: "완성해 공개한 작업부터 보여드립니다.",
      description: "실제 서비스, 공개 저장소, QA 화면 등 직접 확인할 수 있는 자료를 기준으로 대표 작업을 골랐습니다.",
      open: "자세히 보기",
      live: "사이트 보기"
    },
    practice: {
      eyebrow: "일하는 방식",
      title: "캠페인과 제품 모두 문제를 먼저 정의하고 직접 실행합니다.",
      operations: "캠페인 운영",
      product: "제품 제작",
      operationsBody: "시장 조사, 검색 운영, 콘텐츠 제작, KOL 협업, 리포팅을 담당자와 일정이 분명한 계획으로 정리합니다.",
      productBody: "반복해서 찾고 비교하던 일을 한눈에 볼 수 있는 화면과 자동화 도구로 만듭니다."
    },
    lab: {
      all: "전체", live: "운영 중", repository: "공개 저장소", prototype: "프로토타입", concept: "보관", inProgress: "제작 중",
      archive: "프로젝트 전체 보기",
      filterLabel: "프로젝트 상태"
    },
    about: {
      eyebrow: "소개",
      title: "Nimdal을 만들고 운영하는 탁찬우입니다.",
      body: "서울에서 일합니다. 캠페인과 웹3 프로젝트의 한국 시장 진출(GTM)을 맡고, 리서치 도구와 개인 제품을 직접 만듭니다. 경력 수치는 출처와 확인 범위를 함께 적었습니다.",
      dossier: "경력 자세히 보기",
      download: "영문 포트폴리오 PDF"
    },
    log: { all: "글 전체 보기" },
    contact: { x: "X", telegram: "Telegram", linkedin: "LinkedIn" },
    proof: { concept: "콘셉트 이미지", proof: "실제 서비스 · 저장소 · QA", identity: "프로필 이미지", career: "경력 참고 자료", document: "문서" },
    provenance: { "repository-count": "저장소 기준", "career-record": "경력 기록", "portfolio-claim": "포트폴리오 기재" },
    project: { back: "대표 작업으로 돌아가기", visit: "관련 링크", source: "자료 출처", captured: "캡처 날짜", claim: "이 자료로 확인되는 것", boundary: "이 자료만으로 알 수 없는 것", nextProject: "다음 프로젝트", status: "진행 상태" }
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
      archive: "View full Lab",
      filterLabel: "Project status filter"
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
