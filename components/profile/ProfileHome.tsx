"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ChatCircleDots,
  Check,
  Copy,
  EnvelopeSimple,
  GithubLogo,
  PaperPlaneTilt,
  Plus,
  X,
  XLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import type {
  CareerChapterCopy,
  Locale,
  ProjectDetailCopy,
} from "@/lib/content";
import {
  assistantRefusal,
  isInternalAssistantQuestion,
} from "@/lib/assistant-policy";
import styles from "./ProfileHome.module.css";

type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  status: string;
  tags: string[];
  detail: ProjectDetailCopy;
  image: string;
  imageAlt: string;
  liveUrl?: string;
  repositoryUrl?: string;
  articleUrl?: string;
  referenceUrl?: string;
};
type Career = {
  id: string;
  period: string;
  title: string;
  context: string;
  objective: string;
  role: string;
  result: string;
  system: string;
  limitation: string;
  image: string;
  imageAlt: string;
};
type Props = {
  locale: Locale;
  projects: Project[];
  career: Career[];
  careerArc: Array<CareerChapterCopy & { id: string; period: string }>;
};
type Detail = {
  title: string;
  eyebrow: string;
  image: string;
  imageAlt: string;
  pages: { label: string; text: string }[];
  links?: { label: string; href: string }[];
};
type Message = { role: "user" | "assistant"; text: string };

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

function Dialog({
  title,
  close,
  children,
  chat = false,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  chat?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`${styles.dialog} ${chat ? styles.chatDialog : ""}`}
      onCancel={close}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const r = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          close();
      }}
    >
      <div className={styles.dialogTop}>
        <span>{title}</span>
        <button
          autoFocus
          className={styles.iconButton}
          onClick={close}
          aria-label="Close"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function DetailDialog({
  detail,
  close,
  korean,
}: {
  detail: Detail;
  close: () => void;
  korean: boolean;
}) {
  const [page, setPage] = useState(0);
  return (
    <Dialog title={detail.title} close={close}>
      <div className={styles.detailImage}>
        <Image
          src={detail.image}
          alt={detail.imageAlt}
          fill
          sizes="(max-width: 640px) 90vw, 580px"
        />
      </div>
      <div className={styles.detailBody}>
        <span className={styles.eyebrow}>{detail.eyebrow}</span>
        <div
          className={styles.detailText}
          aria-live="polite"
          aria-atomic="true"
          key={page}
        >
          <h2>{detail.pages[page].label}</h2>
          <p>{detail.pages[page].text}</p>
        </div>
        {detail.links && (
          <div className={styles.detailLinks}>
            {detail.links.map((link) => (
              <ExternalLink key={link.href} href={link.href}>
                {link.label}
                <ArrowUpRight size={16} />
              </ExternalLink>
            ))}
          </div>
        )}
      </div>
      <div className={styles.pagination}>
        <button
          className={styles.iconButton}
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          aria-label={korean ? "이전 내용" : "Previous page"}
        >
          <ArrowLeft size={20} />
        </button>
        <span>
          {String(page + 1).padStart(2, "0")}{" "}
          <span>/ {String(detail.pages.length).padStart(2, "0")}</span>
        </span>
        <button
          className={styles.iconButton}
          onClick={() => setPage(page + 1)}
          disabled={page === detail.pages.length - 1}
          aria-label={korean ? "다음 내용" : "Next page"}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </Dialog>
  );
}

function Assistant({
  locale,
  close,
  messages,
  setMessages,
}: {
  locale: Locale;
  close: () => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}) {
  const korean = locale === "ko";
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  useEffect(
    () => () => {
      controller.current?.abort();
      controller.current = null;
    },
    [],
  );
  useEffect(() => {
    conversation.current?.scrollTo({ top: conversation.current.scrollHeight });
  }, [messages, busy]);
  const suggestions = korean
    ? [
        "님달은 어떤 사람이에요?",
        "2012년부터의 경력을 알려줘요",
        "직접 만든 프로젝트가 궁금해요",
      ]
    : [
        "Who is Nimdal?",
        "Tell me about his career since 2012",
        "What has he built?",
      ];
  async function send(event?: FormEvent, prompt = question) {
    event?.preventDefault();
    const text = prompt.trim();
    if (!text || text.length > 600 || submitting.current) return;
    const next: Message[] = [...messages, { role: "user", text }];
    setMessages(next);
    setQuestion("");
    setError(false);
    if (isInternalAssistantQuestion(text)) {
      setMessages([
        ...next,
        { role: "assistant", text: assistantRefusal(locale) },
      ]);
      return;
    }
    submitting.current = true;
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 22000);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          locale,
          history: messages.slice(-6),
        }),
        signal: abort.signal,
      });
      const data = await response.json();
      if (
        !response.ok ||
        typeof data.answer !== "string" ||
        !data.answer.trim()
      )
        throw new Error("Unavailable");
      setMessages([...next, { role: "assistant", text: data.answer }]);
    } catch {
      if (controller.current === abort) setError(true);
    } finally {
      window.clearTimeout(timeout);
      submitting.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={korean ? "님달에게 궁금한 게 있나요?" : "Ask about Nimdal"}
      close={close}
      chat
    >
      <div
        className={styles.conversation}
        ref={conversation}
        role="log"
        aria-live="polite"
        aria-label={korean ? "대화" : "Conversation"}
      >
        <div className={styles.chatWelcome}>
          <Image
            src="/media/identity-octopus.jpg"
            alt=""
            width={52}
            height={52}
          />
          <h2>
            {korean
              ? "뭐가 궁금하신데예?"
              : "Well, what are you curious about?"}
          </h2>
          <p>
            {korean
              ? "일 이야기든, 직접 만든 것이든. 편하게 물어보이소."
              : "The work, the projects, the person. Go on, ask away."}
          </p>
        </div>
        {messages.length === 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((prompt) => (
              <button key={prompt} onClick={() => void send(undefined, prompt)}>
                {prompt}
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            }
          >
            <span>
              {message.role === "user" ? (korean ? "나" : "You") : "Nimdal AI"}
            </span>
            <p>{message.text}</p>
          </div>
        ))}
        {busy && (
          <p className={styles.thinking} role="status">
            {korean
              ? "잠깐만예, 정리하고 있어요"
              : "One moment, putting it together"}
            <span>...</span>
          </p>
        )}
        {error && (
          <div className={styles.chatError} role="alert">
            <p>
              {korean
                ? "지금은 답변 연결이 어렵네예. 다시 물어보시거나 님달에게 직접 연락해 주이소."
                : "Ah, I couldn't connect just now. Try again, or go straight to Nimdal."}
            </p>
            <p>
              KakaoTalk: trialhero
              <br />
              <ExternalLink href="https://t.me/nimdal">
                Telegram: @nimdal
              </ExternalLink>
              <br />
              <ExternalLink href="https://x.com/0xnimdal">
                X: @0xnimdal
              </ExternalLink>
            </p>
          </div>
        )}
      </div>
      <form className={styles.composer} onSubmit={send}>
        <input
          aria-label={korean ? "질문" : "Your question"}
          placeholder={
            korean ? "님달에 대해 물어보세요" : "Ask something about Nimdal..."
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={600}
          disabled={busy}
        />
        <button
          className={styles.sendButton}
          disabled={!question.trim() || busy}
          aria-label={korean ? "질문 보내기" : "Send question"}
        >
          <ArrowUp size={20} />
        </button>
      </form>
    </Dialog>
  );
}

export function ProfileHome({ locale, projects, career, careerArc }: Props) {
  const korean = locale === "ko";
  const [detail, setDetail] = useState<Detail | null>(null);
  const [allProjects, setAllProjects] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  const featured =
    projects.find((project) => project.slug === "alphaduo") ?? projects[0];
  const remaining = projects.filter((project) => project !== featured);
  const projectOrder = [
    "mylol",
    "maple-union",
    "hyperalphaduo",
    "ethosalpha",
    "kol-listing",
    "tg-finance-search-portal",
    "social-poster-one",
    "discord-bulk-leave",
  ];
  const orderedProjects = [...remaining].sort(
    (a, b) => projectOrder.indexOf(a.slug) - projectOrder.indexOf(b.slug),
  );
  const status = (value: string) =>
    ({
      live: korean ? "공개 중" : "Live",
      prototype: korean ? "프로토타입" : "Prototype",
      "in-progress": korean ? "개발 중" : "In progress",
      archived: korean ? "아카이브" : "Archived",
    })[value] ?? value;
  function openProject(project: Project) {
    const labels = korean
      ? [
          "프로젝트",
          "문제",
          "접근",
          "구현",
          "확인 가능한 것",
          "현재 한계",
          "다음 계획",
        ]
      : [
          "Overview",
          "The problem",
          "The approach",
          "The build",
          "Evidence",
          "Current limits",
          "What's next",
        ];
    setDetail({
      title: project.title,
      eyebrow: project.category,
      image: project.image,
      imageAlt: project.imageAlt,
      pages: [
        project.summary,
        project.detail.problem,
        project.detail.decision,
        project.detail.system,
        project.detail.proof,
        project.detail.limitation,
        project.detail.next,
      ].map((text, i) => ({ label: labels[i], text })),
      links: [
        project.liveUrl && {
          label: korean ? "사이트" : "Visit site",
          href: project.liveUrl,
        },
        project.repositoryUrl && {
          label: "GitHub",
          href: project.repositoryUrl,
        },
        project.articleUrl && { label: "nimdalog", href: project.articleUrl },
        project.referenceUrl && {
          label: korean ? "관련 링크" : "Reference",
          href: project.referenceUrl,
        },
      ].filter((link): link is { label: string; href: string } =>
        Boolean(link),
      ),
    });
  }
  function openCareer(item: Career) {
    const labels = korean
      ? ["프로젝트", "목표", "담당 역할", "실행", "결과", "공개 범위"]
      : [
          "Overview",
          "The goal",
          "My role",
          "Execution",
          "Outcomes",
          "Disclosure",
        ];
    setDetail({
      title: item.title,
      eyebrow: item.period,
      image: item.image,
      imageAlt: item.imageAlt,
      pages: [
        item.context,
        item.objective,
        item.role,
        item.system,
        item.result,
        item.limitation,
      ].map((text, i) => ({ label: labels[i], text })),
    });
  }
  async function copyKakao() {
    try {
      await navigator.clipboard.writeText("trialhero");
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }
  return (
    <main
      id="main-content"
      className={styles.home}
      data-profile-home
      tabIndex={-1}
    >
      <div className={styles.column}>
        <header className={styles.header}>
          <button
            className={styles.avatar}
            aria-label={korean ? "탁찬우 소개" : "About Tak Chanwoo"}
            onClick={() =>
              setDetail({
                title: korean ? "탁찬우 / Nimdal" : "Tak Chanwoo / Nimdal",
                eyebrow: korean ? "창업가 · 빌더" : "Founder / Builder",
                image: "/media/operator-portrait.png",
                imageAlt: "Tak Chanwoo",
                pages: [
                  {
                    label: korean ? "반가워요, 님달이에요." : "Hi, I'm Nimdal.",
                    text: korean
                      ? "2012년부터 사람을 모으고, 사업을 운영하고, 제품을 만들어 왔어요. 지금은 FIVE OVER TWO에서 한국 시장 진출과 그로스 운영, 제품 구축을 연결하고 있어요."
                      : "I've been bringing people together, running businesses, and building products since 2012. Today, I connect Korea market entry, growth operations, and product building at FIVE OVER TWO.",
                  },
                ],
              })
            }
          >
            <Image
              src="/media/identity-octopus.jpg"
              alt="Nimdal's pixel octopus"
              width={76}
              height={76}
              priority
            />
            <span className={styles.avatarHint}>
              <Plus size={13} />
            </span>
          </button>
          <div className={styles.identity}>
            <div className={styles.nameRow}>
              <h1>Nimdal</h1>
              <a
                href="https://x.com/0xnimdal"
                target="_blank"
                rel="noopener noreferrer"
              >
                @0xnimdal
              </a>
            </div>
            <p>
              {korean
                ? "창업가 / 그로스 오퍼레이터 / 빌더"
                : "Founder / Growth operator / Builder"}
            </p>
            <span className={styles.location}>
              <span />
              {korean ? "탁찬우 · 대한민국" : "Tak Chanwoo · South Korea"}
            </span>
          </div>
          <a className={styles.contactButton} href="#contact">
            <EnvelopeSimple size={18} />
            <span>{korean ? "연락하기" : "Contact"}</span>
          </a>
        </header>

        <section className={styles.section} aria-labelledby="featured-title">
          <div className={styles.sectionHeading}>
            <h2 id="featured-title">{korean ? "대표 프로젝트" : "Featured"}</h2>
            <span>
              {korean
                ? "리서치에서 제품으로"
                : "From curiosity to something useful"}
            </span>
          </div>
          <button
            className={styles.featured}
            onClick={() => openProject(featured)}
            aria-label={`${korean ? "프로젝트 열기" : "Explore"} ${featured.title}`}
          >
            <div className={styles.featuredCopy}>
              <div className={styles.featuredTitle}>
                <h3>{featured.title}</h3>
                <span className={styles.circleArrow}>
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <p>{featured.summary}</p>
              <span className={styles.projectStatus}>
                <span data-live={featured.status === "live"} />
                {status(featured.status)}
                <span className={styles.separator}>/</span>
                {featured.category}
              </span>
            </div>
            <div className={styles.featuredImage}>
              <Image
                src={featured.image}
                alt={featured.imageAlt}
                width={1280}
                height={720}
                sizes="(max-width: 760px) 90vw, 640px"
                priority
              />
            </div>
          </button>
          <a href="https://blog.nimdal.xyz/" className={styles.journalLink}>
            <span className={styles.journalMark}>n.</span>
            {korean
              ? "만들고 운영하며 남기는 기록"
              : "Notes from building, trying, and figuring things out."}
            <span>
              nimdalog <ArrowRight size={15} />
            </span>
          </a>
        </section>

        <section className={styles.section} aria-labelledby="projects-title">
          <div className={styles.sectionHeading}>
            <h2 id="projects-title">
              {korean ? "개인 프로젝트" : "Personal projects"}
            </h2>
            <span>
              {String(projects.length).padStart(2, "0")}{" "}
              {korean ? "개의 실험" : "independent builds"}
            </span>
          </div>
          <div className={styles.projectGrid}>
            {(allProjects ? orderedProjects : orderedProjects.slice(0, 4)).map(
              (project, index) => (
                <button
                  className={styles.projectCard}
                  data-tone={index % 4}
                  key={project.slug}
                  onClick={() => openProject(project)}
                  aria-label={`${korean ? "프로젝트 열기" : "Explore"} ${project.title}`}
                >
                  <div className={styles.projectVisual}>
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(max-width: 540px) 90vw, 340px"
                    />
                    <span className={styles.miniArrow}>
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                  <div className={styles.projectCopy}>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <span className={styles.projectStatus}>
                      <span data-live={project.status === "live"} />
                      {status(project.status)}
                    </span>
                  </div>
                </button>
              ),
            )}
          </div>
          <button
            className={styles.moreButton}
            aria-expanded={allProjects}
            onClick={() => setAllProjects(!allProjects)}
          >
            {allProjects
              ? korean
                ? "간단히 보기"
                : "Show less"
              : korean
                ? "모든 프로젝트 보기"
                : "All personal projects"}
            <ArrowDown
              size={16}
              className={allProjects ? styles.upArrow : ""}
            />
          </button>
        </section>

        <section className={styles.section} aria-labelledby="career-title">
          <div className={styles.sectionHeading}>
            <h2 id="career-title">
              {korean ? "커리어 프로젝트" : "Selected career work"}
            </h2>
            <span>
              {korean
                ? "캠페인, 커뮤니티, 시장 진출"
                : "Campaigns, communities & market entry"}
            </span>
          </div>
          <div className={styles.careerList}>
            {career.map((item) => (
              <button
                key={item.id}
                className={styles.careerRow}
                onClick={() => openCareer(item)}
                aria-label={`${korean ? "사례 열기" : "Read case"}: ${item.title}`}
              >
                <div className={styles.careerLogo}>
                  <Image src={item.image} alt="" fill sizes="56px" />
                </div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.period}</p>
                </div>
                <ArrowUpRight size={20} />
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="background-title">
          <div className={styles.sectionHeading}>
            <h2 id="background-title">{korean ? "걸어온 길" : "Background"}</h2>
            <span>
              {korean ? "2012년부터, 계속" : "Since 2012. Still building."}
            </span>
          </div>
          <ol className={styles.timeline}>
            {[...careerArc].reverse().map((chapter, index) => (
              <li key={chapter.id} data-current={index === 0}>
                <span className={styles.timelineDate}>
                  {chapter.period
                    .replaceAll("-", " – ")
                    .replace("NOW", korean ? "현재" : "Now")}
                </span>
                <div>
                  <h3>{chapter.organization}</h3>
                  <span className={styles.timelineRole}>{chapter.role}</span>
                  <p>{chapter.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.section}
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className={styles.sectionHeading}>
            <h2 id="contact-title">
              {korean ? "링크 / 연락처" : "Links / Contact"}
            </h2>
            <span>
              {korean
                ? "좋은 이야기는 여기서부터"
                : "Good things start with a conversation"}
            </span>
          </div>
          <div className={styles.socialLinks}>
            <ExternalLink href="https://x.com/0xnimdal">
              <XLogo size={20} />X<ArrowUpRight size={14} />
            </ExternalLink>
            <ExternalLink href="https://t.me/nimdal">
              <PaperPlaneTilt size={20} />
              Telegram
              <ArrowUpRight size={14} />
            </ExternalLink>
            <ExternalLink href="https://github.com/nimdalkr">
              <GithubLogo size={20} />
              GitHub
              <ArrowUpRight size={14} />
            </ExternalLink>
          </div>
          <div className={styles.contactDetails}>
            <a href="mailto:admin@fiveovertwo.xyz">
              <EnvelopeSimple size={18} />
              admin@fiveovertwo.xyz
            </a>
            <ExternalLink href="https://linkedin.com/in/chanwoo-tak-132b281a4">
              LinkedIn <ArrowUpRight size={15} />
            </ExternalLink>
            <button
              onClick={copyKakao}
              title={korean ? "카카오톡 ID 복사" : "Copy KakaoTalk ID"}
            >
              <ChatCircleDots size={18} />
              KakaoTalk · trialhero
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span className={styles.srOnly} role="status">
                {copied ? (korean ? "복사했어요" : "Copied") : ""}
              </span>
            </button>
          </div>
        </section>
        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Nimdal</span>
          <div>
            <a href="https://blog.nimdal.xyz/">
              nimdalog
              <ArrowUpRight size={13} />
            </a>
            <Link
              href={korean ? "/en" : "/ko"}
              hrefLang={korean ? "en" : "ko"}
              aria-label={korean ? "Switch to English" : "한국어로 전환"}
            >
              {korean ? "English" : "한국어"}
            </Link>
          </div>
        </footer>
      </div>
      <button
        className={styles.askButton}
        onClick={() => setChatOpen(true)}
        aria-haspopup="dialog"
        aria-label={
          korean ? "AI에게 님달에 대해 물어보기" : "Ask an AI about Nimdal"
        }
      >
        <span>{korean ? "님달에게 물어봐요" : "Ask an AI"}</span>
        <Image
          src="/media/identity-octopus.jpg"
          alt=""
          width={38}
          height={38}
        />
      </button>
      {detail && (
        <DetailDialog
          detail={detail}
          close={() => setDetail(null)}
          korean={korean}
        />
      )}
      {chatOpen && (
        <Assistant
          locale={locale}
          close={() => setChatOpen(false)}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </main>
  );
}
