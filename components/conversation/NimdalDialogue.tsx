"use client";

import {
  ArrowRight,
  ArrowSquareOut,
  ArrowUp,
  Briefcase,
  ChatCircleDots,
  Code,
  Compass,
  EnvelopeSimple,
  List,
  Plus,
  UserCircle,
  X
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type { Locale } from "@/lib/content";
import { assistantRefusal, isInternalAssistantQuestion } from "@/lib/assistant-policy";

import {
  CareerTimelineChart,
  CommunityGrowthChart,
  type CareerArcItem
} from "./PortfolioCharts";
import styles from "./NimdalDialogue.module.css";

type VisualTheme = "chatgpt" | "claude";
type TopicId = "intro" | "career" | "projects" | "web3" | "method" | "contact";
type DetailTopicId = Exclude<TopicId, "contact">;

type ProjectPreview = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  tags: string[];
  detail: {
    problem: string;
    decision: string;
    system: string;
    proof: string;
    limitation: string;
    next: string;
  };
  image: string;
  imageAlt: string;
  media: Array<{
    src: string;
    alt: string;
    source: string;
    claim: string;
    limitation: string;
    capturedAt: string;
  }>;
  liveUrl?: string;
  repositoryUrl?: string;
  articleUrl?: string;
  referenceUrl?: string;
};

type CareerPreview = {
  id: string;
  period: string;
  title: string;
  context: string;
  channels: string[];
  objective: string;
  role: string;
  result: string;
  constraint: string;
  system: string;
  proof: string;
  limitation: string;
  image: string;
  imageAlt: string;
  metrics: Array<{
    value: string;
    label: string;
    context: string;
    source: string;
    limitation: string;
  }>;
};

type Prompt = {
  id: TopicId;
  label: string;
  hint: string;
};

type Answer = {
  title: string;
  paragraphs: string[];
  source: string;
};

type AssistantTarget =
  | { kind: "topic"; id: TopicId }
  | { kind: "detail"; id: DetailTopicId }
  | { kind: "project"; slug: string }
  | { kind: "career"; id: string }
  | { kind: "ai"; text: string; model: string }
  | { kind: "unknown" };

type DialogueCopy = {
  nav: {
    newChat: string;
    menuOpen: string;
    menuClose: string;
    mobileMenu: string;
    language: string;
  };
  shell: {
    assistant: string;
    model: string;
    status: string;
    aiOnline: string;
    localIndex: string;
    topics: string;
    greeting: string;
    intro: string;
    placeholder: string;
    send: string;
    thinking: string;
    followUps: string;
    disclaimer: string;
    userLabel: string;
    assistantLabel: string;
    unknownTitle: string;
    unknownBody: string;
    inChat: string;
    themeLabel: string;
    chatgptTheme: string;
    claudeTheme: string;
    aiAnswerTitle: string;
  };
  prompts: Prompt[];
  answers: Record<TopicId, Answer>;
  metrics: Array<[string, string]>;
  method: Array<[string, string, string]>;
  web3Signals: Array<[string, string]>;
  detail: {
    projectsTitle: string;
    projectsBody: string;
    careerTitle: string;
    careerBody: string;
    careerCasesTitle: string;
    careerCasesBody: string;
    web3Title: string;
    web3Body: string;
    introTitle: string;
    introBody: string;
    methodTitle: string;
    methodBody: string;
    projectQuestion: (title: string) => string;
    careerQuestion: (title: string) => string;
    labels: Record<"problem" | "decision" | "system" | "proof" | "limitation" | "next" | "objective" | "role" | "result" | "constraint", string>;
    links: string;
    live: string;
    repository: string;
    article: string;
    reference: string;
  };
};

interface NimdalDialogueProps {
  locale: Locale;
  projects: ProjectPreview[];
  career: CareerPreview[];
  careerArc: CareerArcItem[];
  initialTheme: VisualTheme;
  aiEnabled: boolean;
}

type ChatMessage =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; target: AssistantTarget };

const topicIcons = {
  intro: UserCircle,
  career: Briefcase,
  projects: Code,
  web3: Compass,
  method: ChatCircleDots,
  contact: EnvelopeSimple
} as const;

const copy: Record<Locale, DialogueCopy> = {
  ko: {
    nav: {
      newChat: "새 대화",
      menuOpen: "메뉴 열기",
      menuClose: "메뉴 닫기",
      mobileMenu: "모바일 메뉴",
      language: "EN"
    },
    shell: {
      assistant: "Nimdal",
      model: "Portfolio assistant",
      status: "공개된 기록에서 답변해요",
      aiOnline: "Public portfolio grounded",
      localIndex: "Public portfolio records",
      topics: "Nimdal에게 물어보기",
      greeting: "Nimdal에 대해 무엇이 궁금한가요?",
      intro: "탁찬우의 2012년 이후 경력, Korea GTM, 직접 만든 제품과 일하는 방식을 대화하듯 확인할 수 있어요.",
      placeholder: "Nimdal에 대해 자유롭게 물어보세요",
      send: "질문 보내기",
      thinking: "기록을 읽고 있어요",
      followUps: "이어서 물어보기",
      disclaimer: "질문은 공개 포트폴리오 기록을 바탕으로 처리돼요. 민감한 정보는 입력하지 마세요. 답변은 공개된 기록으로 제한돼요.",
      userLabel: "나",
      assistantLabel: "Nimdal의 답변",
      unknownTitle: "그 내용은 공개된 포트폴리오 기록에서 찾지 못했어요.",
      unknownBody: "경력, 개인 프로젝트, Korea GTM, 업무 방식과 연락 방법에 대해서는 답할 수 있어요. 아래 질문 중 하나로 대화를 이어가 보세요.",
      inChat: "대화에서 더 보기",
      themeLabel: "대화 화면 테마",
      chatgptTheme: "ChatGPT",
      claudeTheme: "Claude",
      aiAnswerTitle: "공개 기록을 바탕으로 답하면"
    },
    prompts: [
      { id: "intro", label: "Nimdal은 누구인가요?", hint: "정체성과 지금 하는 일" },
      { id: "career", label: "어떤 경력을 쌓았나요?", hint: "2012년부터 이어진 커리어" },
      { id: "projects", label: "직접 만든 제품을 보여주세요", hint: "리서치 도구, 자동화, 게임" },
      { id: "web3", label: "Web3와 Korea GTM 경험은?", hint: "커뮤니티와 시장 진입" },
      { id: "method", label: "어떻게 일하나요?", hint: "문제에서 출시까지" },
      { id: "contact", label: "함께 일하려면?", hint: "연락 채널과 협업" }
    ],
    answers: {
      intro: {
        title: "Nimdal은 탁찬우의 퍼블릭 아이덴티티예요.",
        paragraphs: [
          "2012년부터 마케팅과 사업 운영을 해왔고, 지금은 시장의 복잡한 신호를 리서치 도구, 자동화, 실제 제품으로 바꾸고 있어요.",
          "전략을 문서에서 끝내지 않고 팀이 반복해서 사용할 수 있는 운영 구조까지 만드는 것이 핵심이에요. 현재 FIVE OVER TWO를 공동 창업해 운영하고 있어요."
        ],
        source: "소개를 더 자세히 보여주세요"
      },
      career: {
        title: "하나의 경력 안에서 여러 실행 시스템을 만들었어요.",
        paragraphs: [
          "CSR 플랫폼 창업에서 출발해 에이전시 운영, Web3 커뮤니티와 한국 GTM, 제품 운영을 거쳐 현재의 벤처까지 이어졌어요.",
          "산업은 달라졌지만 사람을 연결하고 실행 구조를 만들며 결과를 다음 의사결정에 축적하는 방식은 계속 이어져 왔어요."
        ],
        source: "2012년부터의 전체 커리어를 보여주세요"
      },
      projects: {
        title: "리서치 도구, 자동화, 게임을 직접 만들었어요.",
        paragraphs: [
          "아이디어를 소개하는 데서 멈추지 않고 실제로 작동하거나 검증할 수 있는 제품과 프로토타입을 만들어요. 먼저 대표 세 가지를 보여드릴게요."
        ],
        source: "모든 개인 프로젝트를 보여주세요"
      },
      web3: {
        title: "글로벌 프로젝트가 한국 시장에서 움직이게 만들었어요.",
        paragraphs: [
          "071Labs에서 한국 활성 커뮤니티를 약 200명에서 3,000명 이상으로 성장시켰고 Korea Blockchain Week 2025 공식 사이드 이벤트를 공동 주최했어요.",
          "NEVADA에서는 SEO, KOL 앰배서더, 현지화, GA4와 UTM 대시보드를 하나의 한국 마케팅 운영 체계로 설계했어요."
        ],
        source: "Korea GTM 관련 경력 사례를 보여주세요"
      },
      method: {
        title: "문제를 읽고, 구조를 만들고, 출시한 뒤 학습을 남겨요.",
        paragraphs: [
          "먼저 시장, 사용자, 검색 의도에서 실제 마찰을 찾고 채널과 담당자, 지표가 연결된 실행 구조로 바꿔요.",
          "그다음 직접 만들거나 팀을 조율해 출시하고, 반응을 다음 제품과 캠페인에 다시 쓸 수 있는 데이터와 문서로 남겨요."
        ],
        source: "업무 방식을 더 자세히 보여주세요"
      },
      contact: {
        title: "흥미로운 문제라면 함께 이야기하고 싶어요.",
        paragraphs: [
          "만들고 있는 제품, 진입하려는 시장, 지금 막힌 지점을 알려주세요. 맥락을 확인한 뒤 탁찬우가 직접 답할게요."
        ],
        source: "연락하기"
      }
    },
    metrics: [
      ["14 yrs", "2012년부터 이어진 운영 경력"],
      ["200+", "공공·상업 프로젝트"],
      ["3,000+", "크리에이터 네트워크"],
      ["15x", "활성 커뮤니티 성장"]
    ],
    method: [
      ["01", "DECODE", "시장과 사용자의 진짜 마찰을 찾아요."],
      ["02", "FRAME", "역할, 채널, 지표를 실행 구조로 묶어요."],
      ["03", "SHIP", "직접 만들고 조율해 실제로 출시해요."],
      ["04", "COMPOUND", "반응을 다음 판단에 쓸 기록으로 남겨요."]
    ],
    web3Signals: [
      ["200 → 3,000+", "활성 한국 커뮤니티"],
      ["KBW 2025", "공식 사이드 이벤트 공동 주최"],
      ["SEO + KOL", "한국 시장 진입 운영 체계"]
    ],
    detail: {
      projectsTitle: "개인 프로젝트 아카이브를 대화 안에 불러왔어요.",
      projectsBody: "아래 아홉 개 프로젝트 중 하나를 선택하면 문제, 결정, 시스템, 증거와 한계까지 이 대화에서 이어서 설명해 드릴게요.",
      careerTitle: "2012년부터 현재까지 이어진 커리어 전체를 정리했어요.",
      careerBody: "창업, 비영리 커뮤니티, 에이전시, Korea GTM과 제품 운영이 겹치며 진화한 흐름을 먼저 보여드려요.",
      careerCasesTitle: "대표 실행 사례와 공개 근거",
      careerCasesBody: "아래 사례는 전체 경력 중 역할, 운영 방식과 결과를 더 구체적으로 확인할 수 있는 기록이에요.",
      web3Title: "Korea GTM과 Web3에 직접 연결된 사례예요.",
      web3Body: "커뮤니티 성장과 한국 시장 진입 체계를 각각 선택해 세부 실행과 근거를 확인할 수 있어요.",
      introTitle: "소개를 숫자와 역할까지 확장하면 이렇습니다.",
      introBody: "탁찬우는 마케팅, 사업 운영, 커뮤니티, 제품 구축을 별개 직무로 보지 않고 하나의 실행 체계로 연결해 왔어요.",
      methodTitle: "업무 방식은 네 단계의 반복 루프로 작동해요.",
      methodBody: "조사와 전략만 제안하는 것이 아니라 직접 구현과 배포까지 연결하고, 다음 판단에 쓸 수 있는 기록을 남기는 방식이에요.",
      projectQuestion: (title) => `${title} 프로젝트를 자세히 보여주세요`,
      careerQuestion: (title) => `${title} 경력 사례를 자세히 보여주세요`,
      labels: {
        problem: "문제",
        decision: "핵심 결정",
        system: "구현 시스템",
        proof: "공개 근거",
        limitation: "확인 한계",
        next: "다음 단계",
        objective: "목표",
        role: "담당 역할",
        result: "결과",
        constraint: "제약"
      },
      links: "외부에서 확인하기",
      live: "라이브 제품",
      repository: "GitHub 저장소",
      article: "개발 기록",
      reference: "참고 자료"
    }
  },
  en: {
    nav: {
      newChat: "New chat",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      mobileMenu: "Mobile navigation",
      language: "KO"
    },
    shell: {
      assistant: "Nimdal",
      model: "Portfolio assistant",
      status: "Answers from the public record",
      aiOnline: "Public portfolio grounded",
      localIndex: "Public portfolio records",
      topics: "Ask Nimdal",
      greeting: "What would you like to know about Nimdal?",
      intro: "Ask about Tak Chanwoo's career since 2012, Korea GTM, products he built, and how he works.",
      placeholder: "Ask anything about Nimdal",
      send: "Send question",
      thinking: "Reading the record",
      followUps: "Continue the conversation",
      disclaimer: "Questions are answered from public portfolio records. Do not enter sensitive information. Answers stay within the published portfolio.",
      userLabel: "You",
      assistantLabel: "Nimdal's answer",
      unknownTitle: "I could not find that in the public portfolio record.",
      unknownBody: "I can answer questions about Nimdal's career, personal projects, Korea GTM experience, operating method, and contact details. Continue with one of the questions below.",
      inChat: "Continue in chat",
      themeLabel: "Conversation theme",
      chatgptTheme: "ChatGPT",
      claudeTheme: "Claude",
      aiAnswerTitle: "Based on the public record"
    },
    prompts: [
      { id: "intro", label: "Who is Nimdal?", hint: "Identity and current work" },
      { id: "career", label: "What has he done?", hint: "A career operating since 2012" },
      { id: "projects", label: "Show me what he built", hint: "Research, automation, and games" },
      { id: "web3", label: "What is his Korea GTM experience?", hint: "Communities and market entry" },
      { id: "method", label: "How does he work?", hint: "From problem to release" },
      { id: "contact", label: "How can we work together?", hint: "Contact and collaboration" }
    ],
    answers: {
      intro: {
        title: "Nimdal is the public identity of Tak Chanwoo.",
        paragraphs: [
          "He has operated marketing and businesses since 2012 and now turns complex market signals into research tools, automation, and working products.",
          "The core is taking strategy beyond a document into an operating structure a team can repeatedly use. He is currently co-founding and operating FIVE OVER TWO."
        ],
        source: "Show me the fuller profile"
      },
      career: {
        title: "One career, several operating systems.",
        paragraphs: [
          "The arc runs from a CSR platform and agency ownership to Web3 communities, Korean GTM, product operations, and a new venture.",
          "The industries changed, but the method kept compounding: connect people, structure execution, and preserve outcomes for the next decision."
        ],
        source: "Show the complete career arc since 2012"
      },
      projects: {
        title: "Research tools, automation, and games built firsthand.",
        paragraphs: [
          "The work goes beyond presenting ideas. These are three representative products and prototypes from a larger archive."
        ],
        source: "Show every personal project"
      },
      web3: {
        title: "Made global projects move in the Korean market.",
        paragraphs: [
          "At 071Labs, he grew an active Korean community from roughly 200 to more than 3,000 and co-hosted an official Korea Blockchain Week 2025 side event.",
          "For NEVADA, he designed one operating system across SEO, KOL ambassadors, localization, and GA4 and UTM reporting."
        ],
        source: "Show the relevant Korea GTM cases"
      },
      method: {
        title: "Read the problem, frame the system, ship, then preserve the learning.",
        paragraphs: [
          "First, find the real friction in the market, user behavior, and search intent. Then connect channels, owners, and metrics in one executable structure.",
          "Build or coordinate the launch, read the response, and leave behind data and documentation the next product or campaign can reuse."
        ],
        source: "Show the operating method in detail"
      },
      contact: {
        title: "Interesting problems are worth a conversation.",
        paragraphs: [
          "Send the product, the market you want to enter, and the point where progress is blocked. Tak will reply after the context is clear."
        ],
        source: "Get in touch"
      }
    },
    metrics: [
      ["14 yrs", "Operating since 2012"],
      ["200+", "Public and commercial projects"],
      ["3,000+", "Creator network"],
      ["15x", "Active community growth"]
    ],
    method: [
      ["01", "DECODE", "Find the real market and user friction."],
      ["02", "FRAME", "Connect roles, channels, and metrics."],
      ["03", "SHIP", "Build, coordinate, and release the work."],
      ["04", "COMPOUND", "Preserve the response for the next decision."]
    ],
    web3Signals: [
      ["200 → 3,000+", "Active Korean community"],
      ["KBW 2025", "Official side event co-host"],
      ["SEO + KOL", "Korean market-entry system"]
    ],
    detail: {
      projectsTitle: "The complete personal-project archive is now in the conversation.",
      projectsBody: "Choose any of the nine projects to continue with its problem, decision, system, evidence, limitations, and next step without leaving this page.",
      careerTitle: "The complete career arc, from 2012 to the present.",
      careerBody: "The chronology shows how founder, nonprofit-community, agency, Korea GTM, and product roles evolved and sometimes overlapped.",
      careerCasesTitle: "Representative execution cases and public evidence",
      careerCasesBody: "These selected records provide a closer look at ownership, operating systems, outcomes, evidence, and limitations within the broader career.",
      web3Title: "The cases directly connected to Web3 and Korea GTM.",
      web3Body: "Open either community growth or Korean market entry to inspect the execution and evidence in this conversation.",
      introTitle: "The fuller profile connects roles with recorded signals.",
      introBody: "Tak treats marketing, business operations, community, and product building as parts of one execution system rather than separate job descriptions.",
      methodTitle: "The operating method is a four-stage learning loop.",
      methodBody: "It joins research and strategy to direct implementation and release, then preserves the result for the next decision.",
      projectQuestion: (title) => `Tell me more about the ${title} project`,
      careerQuestion: (title) => `Show me the ${title} career case`,
      labels: {
        problem: "Problem",
        decision: "Core decision",
        system: "Operating system",
        proof: "Public evidence",
        limitation: "Limitation",
        next: "Next step",
        objective: "Objective",
        role: "Ownership",
        result: "Outcome",
        constraint: "Constraint"
      },
      links: "Inspect externally",
      live: "Live product",
      repository: "GitHub repository",
      article: "Build log",
      reference: "Reference"
    }
  }
};

const keywordMap: Record<TopicId, readonly string[]> = {
  intro: ["누구", "소개", "님달", "탁찬우", "who", "about", "nimdal", "chanwoo"],
  career: ["경력", "커리어", "회사", "이력", "경험", "career", "experience", "history", "done"],
  projects: ["프로젝트", "제품", "만든", "개발", "빌드", "project", "product", "built", "build", "code"],
  web3: ["웹3", "코인", "크립토", "한국", "마케팅", "071", "네바다", "gtm", "커뮤니티", "web3", "crypto", "korea", "marketing", "community", "nevada"],
  method: ["방식", "일하", "프로세스", "철학", "강점", "method", "work", "process", "approach", "strength"],
  contact: ["연락", "협업", "채용", "이메일", "contact", "hire", "email", "together", "work with"]
};

function resolveTopic(value: string): TopicId | null {
  const normalized = value.toLocaleLowerCase();
  let best: { id: TopicId; score: number } | null = null;

  for (const [id, keywords] of Object.entries(keywordMap) as [TopicId, readonly string[]][]) {
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? keyword.length : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }

  return best?.id ?? null;
}

function topicForTarget(target: AssistantTarget): TopicId | null {
  if (target.kind === "topic" || target.kind === "detail") return target.id;
  if (target.kind === "project") return "projects";
  if (target.kind === "career") return "career";
  return null;
}

function ProjectCards({
  projects,
  locale,
  onAsk,
  limit
}: {
  projects: ProjectPreview[];
  locale: Locale;
  onAsk: (target: AssistantTarget, question: string) => void;
  limit?: number;
}) {
  const text = copy[locale];
  return (
    <div className={styles.projectEvidence}>
      {projects.slice(0, limit).map((project) => (
        <button
          type="button"
          key={project.slug}
          className={styles.projectCard}
          onClick={() => onAsk({ kind: "project", slug: project.slug }, text.detail.projectQuestion(project.title))}
        >
          <figure>
            <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 700px) 86vw, 250px" />
          </figure>
          <span><small>{project.category}</small><strong>{project.title}</strong></span>
          <ArrowRight size={18} aria-hidden />
        </button>
      ))}
    </div>
  );
}

function CareerCards({
  cases,
  locale,
  onAsk
}: {
  cases: CareerPreview[];
  locale: Locale;
  onAsk: (target: AssistantTarget, question: string) => void;
}) {
  const text = copy[locale];
  return (
    <div className={styles.careerEvidence}>
      {cases.map((careerCase) => (
        <button
          type="button"
          key={careerCase.id}
          className={styles.careerCard}
          onClick={() => onAsk({ kind: "career", id: careerCase.id }, text.detail.careerQuestion(careerCase.title))}
        >
          <span className={styles.careerCardImage}>
            <Image src={careerCase.image} alt={careerCase.imageAlt} fill sizes="84px" />
          </span>
          <span><small>{careerCase.period}</small><strong>{careerCase.title}</strong><em>{careerCase.context}</em></span>
          <ArrowRight size={18} aria-hidden />
        </button>
      ))}
    </div>
  );
}

function ProjectDetail({ project, locale }: { project: ProjectPreview; locale: Locale }) {
  const text = copy[locale];
  const detailRows = ["problem", "decision", "system", "proof", "limitation", "next"] as const;
  const links = [
    [project.liveUrl, text.detail.live],
    [project.repositoryUrl, text.detail.repository],
    [project.articleUrl, text.detail.article],
    [project.referenceUrl, text.detail.reference]
  ].filter((entry): entry is [string, string] => Boolean(entry[0]));

  return (
    <>
      <div className={styles.detailHero}>
        <figure><Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 700px) 88vw, 660px" /></figure>
        <div>
          <span>{project.category} · {project.status}</span>
          <h2>{project.title}</h2>
          <p>{project.summary}</p>
          <div className={styles.tagRow}>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </div>
      <dl className={styles.detailFacts}>
        {detailRows.map((key) => (
          <div key={key} className={key === "limitation" ? styles.limitFact : undefined}>
            <dt>{text.detail.labels[key]}</dt>
            <dd>{project.detail[key]}</dd>
          </div>
        ))}
      </dl>
      {project.media.length > 1 ? (
        <div className={styles.mediaEvidence}>
          {project.media.slice(1).map((media) => (
            <figure key={media.src}>
              <span><Image src={media.src} alt={media.alt} fill sizes="(max-width: 700px) 88vw, 330px" /></span>
              <figcaption><strong>{media.claim}</strong><small>{media.source} · {media.capturedAt}</small></figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      {links.length > 0 ? (
        <div className={styles.externalEvidence}>
          <span>{text.detail.links}</span>
          {links.map(([href, label]) => <a key={href} href={href} target="_blank" rel="noreferrer">{label}<ArrowSquareOut aria-hidden /></a>)}
        </div>
      ) : null}
    </>
  );
}

function CareerDetail({ careerCase, locale }: { careerCase: CareerPreview; locale: Locale }) {
  const text = copy[locale];
  const rows = ["objective", "role", "system", "result", "constraint", "proof", "limitation"] as const;
  return (
    <>
      <div className={styles.careerDetailHero}>
        <figure><Image src={careerCase.image} alt={careerCase.imageAlt} fill sizes="120px" /></figure>
        <div><span>{careerCase.period}</span><h2>{careerCase.title}</h2><p>{careerCase.context}</p></div>
      </div>
      <div className={styles.tagRow}>{careerCase.channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
      {careerCase.metrics.length > 0 ? (
        <div className={styles.caseMetrics}>
          {careerCase.metrics.map((metric) => <div key={`${metric.value}-${metric.label}`}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.limitation}</small></div>)}
        </div>
      ) : null}
      <dl className={styles.detailFacts}>
        {rows.map((key) => (
          <div key={key} className={key === "limitation" ? styles.limitFact : undefined}>
            <dt>{text.detail.labels[key]}</dt>
            <dd>{careerCase[key]}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function AssistantAnswer({
  locale,
  target,
  projects,
  career,
  careerArc,
  onAsk
}: {
  locale: Locale;
  target: AssistantTarget;
  projects: ProjectPreview[];
  career: CareerPreview[];
  careerArc: CareerArcItem[];
  onAsk: (target: AssistantTarget, question: string) => void;
}) {
  const text = copy[locale];

  if (target.kind === "ai") {
    return (
      <>
        <h2>{text.shell.aiAnswerTitle}</h2>
        {target.text.split(/\n{2,}/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className={styles.aiProvenance}><i aria-hidden /><span>{target.model}</span><small>PORTFOLIO CORPUS ONLY</small></div>
      </>
    );
  }

  if (target.kind === "project") {
    const project = projects.find((item) => item.slug === target.slug);
    return project ? <ProjectDetail project={project} locale={locale} /> : null;
  }

  if (target.kind === "career") {
    const careerCase = career.find((item) => item.id === target.id);
    return careerCase ? <CareerDetail careerCase={careerCase} locale={locale} /> : null;
  }

  if (target.kind === "unknown") {
    return (
      <>
        <h2>{text.shell.unknownTitle}</h2>
        <p>{text.shell.unknownBody}</p>
        <figure className={styles.identityEvidence}>
          <Image src="/media/identity-octopus.jpg" alt="Nimdal pixel octopus NFT" width={156} height={156} />
          <figcaption><span>NIMDAL_IDENTITY.JPG</span><small>PUBLIC PROFILE / VERIFIED SCOPE</small></figcaption>
        </figure>
      </>
    );
  }

  if (target.kind === "detail") {
    if (target.id === "projects") {
      return <><h2>{text.detail.projectsTitle}</h2><p>{text.detail.projectsBody}</p><ProjectCards projects={projects} locale={locale} onAsk={onAsk} /></>;
    }
    if (target.id === "career") {
      return (
        <>
          <h2>{text.detail.careerTitle}</h2><p>{text.detail.careerBody}</p>
          <CareerTimelineChart items={careerArc} locale={locale} />
          <div className={styles.careerCaseIntro}>
            <h3>{text.detail.careerCasesTitle}</h3>
            <p>{text.detail.careerCasesBody}</p>
          </div>
          <CareerCards cases={career} locale={locale} onAsk={onAsk} />
        </>
      );
    }
    if (target.id === "web3") {
      const relevantCases = career.filter((item) => item.id === "community-kol-campaigns" || item.id === "nevada-korea-marketing-lead");
      return <><h2>{text.detail.web3Title}</h2><p>{text.detail.web3Body}</p><CommunityGrowthChart locale={locale} /><CareerCards cases={relevantCases} locale={locale} onAsk={onAsk} /></>;
    }
    if (target.id === "intro") {
      return (
        <>
          <h2>{text.detail.introTitle}</h2><p>{text.detail.introBody}</p>
          <figure className={styles.profileEvidence}>
            <div className={styles.profilePhoto}><Image src="/media/operator-portrait.png" alt={locale === "ko" ? "탁찬우 프로필 사진" : "Portrait of Tak Chanwoo"} fill sizes="(max-width: 700px) 88vw, 290px" loading="eager" /></div>
            <figcaption><span>TAK CHANWOO / NIMDAL</span><strong>Founder · Growth Operator · Product Builder</strong><div className={styles.metricGrid}>{text.metrics.map(([value, label]) => <div key={value}><b>{value}</b><small>{label}</small></div>)}</div></figcaption>
          </figure>
        </>
      );
    }
    return <><h2>{text.detail.methodTitle}</h2><p>{text.detail.methodBody}</p><ol className={styles.methodEvidence}>{text.method.map(([number, title, body]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{body}</p></li>)}</ol></>;
  }

  const topic = target.id;
  const answer = text.answers[topic];
  return (
    <>
      <h2>{answer.title}</h2>
      {answer.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      {topic === "intro" ? (
        <figure className={styles.profileEvidence}>
          <div className={styles.profilePhoto}><Image src="/media/operator-portrait.png" alt={locale === "ko" ? "탁찬우 프로필 사진" : "Portrait of Tak Chanwoo"} fill sizes="(max-width: 700px) 88vw, 290px" loading="eager" /></div>
          <figcaption><span>TAK CHANWOO / NIMDAL</span><strong>Founder · Growth Operator · Product Builder</strong><div className={styles.metricGrid}>{text.metrics.map(([value, label]) => <div key={value}><b>{value}</b><small>{label}</small></div>)}</div></figcaption>
        </figure>
      ) : null}

      {topic === "career" ? (
        <CareerTimelineChart items={careerArc} locale={locale} />
      ) : null}

      {topic === "projects" ? <ProjectCards projects={projects} locale={locale} onAsk={onAsk} limit={3} /> : null}

      {topic === "web3" ? <><dl className={styles.signalEvidence}>{text.web3Signals.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}</dl><CommunityGrowthChart locale={locale} /></> : null}

      {topic === "method" ? <ol className={styles.methodEvidence}>{text.method.map(([number, title, body]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{body}</p></li>)}</ol> : null}

      {topic === "contact" ? (
        <div className={styles.contactEvidence}>
          <a href="mailto:admin@fiveovertwo.xyz">admin@fiveovertwo.xyz<ArrowSquareOut aria-hidden /></a>
          <a href="https://x.com/0xnimdal" target="_blank" rel="noreferrer">X / @0xnimdal<ArrowSquareOut aria-hidden /></a>
          <a href="https://t.me/nimdal" target="_blank" rel="noreferrer">Telegram / @nimdal<ArrowSquareOut aria-hidden /></a>
          <a href="https://linkedin.com/in/chanwoo-tak-132b281a4" target="_blank" rel="noreferrer">LinkedIn<ArrowSquareOut aria-hidden /></a>
        </div>
      ) : null}

      {topic !== "contact" ? (
        <div className={styles.sourceLine}>
          <span>{text.shell.inChat}</span>
          <button type="button" onClick={() => onAsk({ kind: "detail", id: topic }, answer.source)}>{answer.source}<ArrowRight aria-hidden /></button>
        </div>
      ) : null}
    </>
  );
}

export function NimdalDialogue({ locale, projects, career, careerArc, initialTheme, aiEnabled }: NimdalDialogueProps) {
  const text = copy[locale];
  const reducedMotion = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const requestIdRef = useRef(0);
  const hashInitializedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [theme, setTheme] = useState<VisualTheme>(initialTheme);

  const oppositeLocale = locale === "ko" ? "en" : "ko";
  const isEmpty = messages.length === 0 && !thinking;
  const nextId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  useEffect(() => {
    document.cookie = `nimdal-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.style.colorScheme = "light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "claude" ? "#f7f5ef" : "#ffffff");
  }, [theme]);

  useEffect(() => {
    if (hashInitializedRef.current) return;
    hashInitializedRef.current = true;
    const hash = window.location.hash.replace("#ask-", "") as TopicId;
    if (!(hash in keywordMap)) return;
    const prompt = text.prompts.find((item) => item.id === hash);
    if (!prompt) return;
    messageIdRef.current = 2;
    setMessages([
      { id: 1, role: "user", text: prompt.label },
      { id: 2, role: "assistant", target: { kind: "topic", id: hash } }
    ]);
    setActiveTopic(hash);
  }, [text.prompts]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    requestIdRef.current += 1;
  }, []);

  useEffect(() => {
    if (isEmpty) return;
    scrollAnchorRef.current?.scrollIntoView({ block: "end", behavior: reducedMotion ? "auto" : "smooth" });
  }, [isEmpty, messages, reducedMotion, thinking]);

  const visibleFollowUps = useMemo(
    () => text.prompts.filter((prompt) => prompt.id !== activeTopic),
    [activeTopic, text.prompts]
  );

  const prepareQuestion = (target: AssistantTarget, question: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages((current) => [...current, { id: nextId(), role: "user", text: question }]);
    setThinking(true);
    setActiveTopic(topicForTarget(target));
    setMenuOpen(false);
    setShowAllPrompts(false);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const topic = topicForTarget(target);
    window.history.replaceState(null, "", topic ? `${window.location.pathname}#ask-${topic}` : window.location.pathname);
  };

  const ask = (target: AssistantTarget, question: string) => {
    if (thinking) return;
    prepareQuestion(target, question);
    const finish = () => {
      setMessages((current) => [...current, { id: nextId(), role: "assistant", target }]);
      setThinking(false);
    };
    timerRef.current = setTimeout(finish, reducedMotion ? 0 : 560);
  };

  const askWithAI = async (question: string) => {
    const resolvedTopic = resolveTopic(question);
    if (!aiEnabled) {
      ask(resolvedTopic ? { kind: "topic", id: resolvedTopic } : { kind: "unknown" }, question);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const history = messages.flatMap((message) => {
      if (message.role === "user") return [{ role: "user", text: message.text }];
      if (message.target.kind === "ai") return [{ role: "assistant", text: message.target.text }];
      return [];
    });
    prepareQuestion(resolvedTopic ? { kind: "topic", id: resolvedTopic } : { kind: "unknown" }, question);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, question, history })
      });
      if (!response.ok) throw new Error("Assistant request failed");
      const payload = await response.json() as { answer?: string };
      if (!payload.answer) throw new Error("Assistant returned no answer");
      if (requestIdRef.current !== requestId) return;
      setMessages((current) => [...current, {
        id: nextId(),
        role: "assistant",
        target: { kind: "ai", text: payload.answer as string, model: "Nimdal" }
      }]);
    } catch {
      if (requestIdRef.current !== requestId) return;
      setMessages((current) => [...current, {
        id: nextId(),
        role: "assistant",
        target: resolvedTopic ? { kind: "topic", id: resolvedTopic } : { kind: "unknown" }
      }]);
    } finally {
      if (requestIdRef.current === requestId) setThinking(false);
    }
  };

  const resetConversation = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    requestIdRef.current += 1;
    setMessages([]);
    setActiveTopic(null);
    setThinking(false);
    setInput("");
    setMenuOpen(false);
    setShowAllPrompts(false);
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    if (isInternalAssistantQuestion(question)) {
      prepareQuestion({ kind: "unknown" }, question);
      setMessages((current) => [...current, {
        id: nextId(),
        role: "assistant",
        target: { kind: "ai", text: assistantRefusal(locale), model: "Nimdal" }
      }]);
      setThinking(false);
      return;
    }
    void askWithAI(question);
  };

  const onInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 132)}px`;
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const chooseTheme = (nextTheme: VisualTheme) => {
    setTheme(nextTheme);
    setShowAllPrompts(false);
  };

  const renderComposer = (placement: "hero" | "dock") => (
    <div
      className={`${styles.composerDock} ${placement === "hero" ? styles.heroComposer : ""}`}
      data-testid="prompt-dock"
      data-placement={placement}
    >
      <form className={styles.composer} onSubmit={submit}>
        {placement === "hero" ? (
          <button
            className={styles.promptMenuButton}
            type="button"
            aria-expanded={showAllPrompts}
            aria-controls="starter-prompts"
            aria-label={showAllPrompts
              ? locale === "ko" ? "추천 질문 접기" : "Hide prompt suggestions"
              : locale === "ko" ? "추천 질문 펼치기" : "Show prompt suggestions"}
            title={showAllPrompts
              ? locale === "ko" ? "추천 질문 접기" : "Hide prompt suggestions"
              : locale === "ko" ? "추천 질문 펼치기" : "Show prompt suggestions"}
            onClick={() => setShowAllPrompts((expanded) => !expanded)}
          >
            <Plus size={20} aria-hidden />
          </button>
        ) : null}
        <textarea
          ref={textareaRef}
          value={input}
          rows={1}
          maxLength={600}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          placeholder={text.shell.placeholder}
          aria-label={text.shell.placeholder}
          disabled={thinking}
        />
        <div className={styles.composerMeta} aria-hidden>
          <span>{locale === "ko" ? "공개 포트폴리오 문맥" : "Public portfolio context"}</span>
          <small>NIMDAL · PORTFOLIO</small>
        </div>
        <button className={styles.sendButton} type="submit" disabled={!input.trim() || thinking} aria-label={text.shell.send} title={text.shell.send}>
          <ArrowUp size={19} weight="bold" aria-hidden />
        </button>
      </form>
      <p>{locale === "ko"
        ? "질문은 공개 포트폴리오 기록을 바탕으로 처리돼요. 민감한 정보는 입력하지 마세요. 답변은 공개된 기록으로 제한돼요."
        : text.shell.disclaimer}</p>
    </div>
  );

  return (
    <div className={`${styles.experience} relative min-h-svh overflow-hidden`} data-dialogue-home data-testid="dialogue-home" data-theme={theme} data-empty={isEmpty ? "true" : "false"} data-ai-enabled={aiEnabled ? "true" : "false"}>
      <aside className={`${styles.sidebar} fixed inset-y-0 left-0 flex flex-col`} aria-label={locale === "ko" ? "Nimdal 대화 탐색" : "Nimdal conversation navigation"}>
        <Link className={styles.brand} href={`/${locale}`} aria-label={locale === "ko" ? "Nimdal 홈" : "Nimdal home"}>
          <Image src="/media/identity-octopus.jpg" alt="" width={38} height={38} priority />
          <span><strong>Nimdal</strong><small>{theme === "chatgpt" ? "PORTFOLIO AI" : "KNOWLEDGE SPACE"}</small></span>
        </Link>

        <button className={styles.newChat} type="button" onClick={resetConversation}><Plus size={18} aria-hidden />{text.nav.newChat}</button>

        <nav className={styles.topicNav} aria-label={text.shell.topics}>
          <p>{text.shell.topics}</p>
          {text.prompts.map((prompt) => {
            const Icon = topicIcons[prompt.id];
            return (
              <a key={prompt.id} href={`#ask-${prompt.id}`} aria-current={activeTopic === prompt.id ? "page" : undefined} onClick={(event) => { event.preventDefault(); ask({ kind: "topic", id: prompt.id }, prompt.label); }}>
                <Icon size={17} aria-hidden /><span>{prompt.label}</span>
              </a>
            );
          })}
        </nav>

        <div className={styles.sidebarProfile}>
          <Image src="/media/operator-portrait.png" alt="" width={42} height={42} />
          <span><strong>Tak Chanwoo</strong><small>Seoul, KR</small></span><i aria-hidden />
        </div>
      </aside>

      <div className={`${styles.themeSwitch} inline-flex items-center`} role="group" aria-label={text.shell.themeLabel}>
        <button type="button" data-testid="theme-chatgpt" aria-pressed={theme === "chatgpt"} onClick={() => chooseTheme("chatgpt")}><span>{text.shell.chatgptTheme}</span><small>CHAT</small></button>
        <button type="button" data-testid="theme-claude" aria-pressed={theme === "claude"} onClick={() => chooseTheme("claude")}><span>{text.shell.claudeTheme}</span><small>ARTIFACT</small></button>
      </div>

      <header className={`${styles.topbar} fixed top-0 right-0`}>
        <button className={styles.menuButton} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="nimdal-mobile-menu" aria-label={menuOpen ? text.nav.menuClose : text.nav.menuOpen}>
          {menuOpen ? <X size={21} aria-hidden /> : <List size={21} aria-hidden />}
        </button>
        <div className={styles.modelLabel}>
          <Image src="/media/identity-octopus.jpg" alt="" width={30} height={30} />
          <span>
            <strong>{theme === "chatgpt" ? text.shell.assistant : `${text.shell.assistant} desk`}</strong>
            <small>{theme === "chatgpt"
              ? (locale === "ko" ? "공개 포트폴리오 기록" : "Public portfolio records")
              : (locale === "ko" ? "기록 · 근거 · 아티팩트" : "RECORDS · EVIDENCE · ARTIFACTS")}</small>
          </span>
        </div>
        <div className={styles.topbarActions}>
          <button className={styles.mobileNewChat} type="button" onClick={resetConversation} aria-label={text.nav.newChat} title={text.nav.newChat}><Plus size={19} aria-hidden /></button>
          <nav aria-label={locale === "ko" ? "언어 선택" : "Language selection"}><Link href={`/${oppositeLocale}`} hrefLang={oppositeLocale}>{text.nav.language}</Link></nav>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button className={styles.mobileBackdrop} type="button" aria-label={text.nav.menuClose} onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div id="nimdal-mobile-menu" className={styles.mobilePanel} initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: reducedMotion ? 0 : 0.28 }}>
              <div className={styles.mobilePanelHead}><Image src="/media/identity-octopus.jpg" alt="" width={42} height={42} /><span><strong>Nimdal</strong><small>{text.shell.model}</small></span></div>
              <button className={styles.newChat} type="button" onClick={resetConversation}><Plus size={18} aria-hidden />{text.nav.newChat}</button>
              <nav aria-label={text.nav.mobileMenu}>
                {text.prompts.map((prompt) => <a key={prompt.id} href={`#ask-${prompt.id}`} onClick={(event) => { event.preventDefault(); ask({ kind: "topic", id: prompt.id }, prompt.label); }}>{prompt.label}<ArrowRight aria-hidden /></a>)}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <main id="main-content" className={styles.chatMain}>
        <div className={styles.threadViewport} data-testid="dialogue-answer" aria-live="polite" aria-busy={thinking}>
          <div className={styles.thread} data-testid="evidence-visual">
            {isEmpty ? (
              <motion.section className={styles.emptyState} initial={false} animate={{ opacity: 1 }}>
                <div className={styles.emptyAvatar} aria-hidden><Image src="/media/identity-octopus.jpg" alt="" width={76} height={76} priority /></div>
                <p className={styles.statusLine}><i aria-hidden />{text.shell.status}</p>
                <h1>
                  {theme === "claude"
                    ? locale === "ko"
                      ? "Nimdal에 대해 물어보세요."
                      : "Ask me about Nimdal."
                    : text.shell.greeting}
                </h1>
                <p>{text.shell.intro}</p>
                {renderComposer("hero")}
                <div id="starter-prompts" className={styles.starterGrid} data-expanded={showAllPrompts ? "true" : "false"}>
                  {text.prompts.map((prompt) => {
                    const Icon = topicIcons[prompt.id];
                    return <button key={prompt.id} type="button" disabled={thinking} onClick={() => ask({ kind: "topic", id: prompt.id }, prompt.label)}><Icon size={20} aria-hidden /><span><strong>{prompt.label}</strong><small>{prompt.hint}</small></span><ArrowRight size={17} aria-hidden /></button>;
                  })}
                </div>
              </motion.section>
            ) : (
              <section className={styles.transcript} aria-label={locale === "ko" ? "대화 기록" : "Conversation history"}>
                <AnimatePresence initial={false}>
                  {messages.map((message) => message.role === "user" ? (
                    <motion.article key={message.id} className={`${styles.message} ${styles.userMessage}`} aria-label={text.shell.userLabel} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.26 }}><div>{message.text}</div></motion.article>
                  ) : (
                    <motion.article key={message.id} className={`${styles.message} ${styles.assistantMessage}`} aria-label={text.shell.assistantLabel} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.36 }}>
                      <Image className={styles.messageAvatar} src="/media/identity-octopus.jpg" alt="" width={36} height={36} />
                      <div className={styles.messageBody}><div className={styles.messageMeta}><strong>Nimdal</strong><span>{text.shell.model}</span></div><AssistantAnswer locale={locale} target={message.target} projects={projects} career={career} careerArc={careerArc} onAsk={ask} /></div>
                    </motion.article>
                  ))}
                </AnimatePresence>

                {thinking ? <article className={`${styles.message} ${styles.assistantMessage}`} role="status"><Image className={styles.messageAvatar} src="/media/identity-octopus.jpg" alt="" width={36} height={36} /><div className={styles.thinkingBubble}><span>{text.shell.thinking}</span><i /><i /><i /></div></article> : null}

                {!thinking && messages.at(-1)?.role === "assistant" ? (
                  <div className={styles.followUps}><span>{text.shell.followUps}</span><div>{visibleFollowUps.map((prompt) => <button key={prompt.id} type="button" onClick={() => ask({ kind: "topic", id: prompt.id }, prompt.label)}>{prompt.label}</button>)}</div></div>
                ) : null}
              </section>
            )}
            <div ref={scrollAnchorRef} className={styles.scrollAnchor} />
          </div>
        </div>

        {!isEmpty ? renderComposer("dock") : null}
      </main>
    </div>
  );
}
