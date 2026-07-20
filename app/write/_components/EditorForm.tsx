"use client";

import { ArrowLeft, FloppyDisk, Trash, UploadSimple } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import type { BlogEditorPostDocument } from "@/lib/blog-editor";
import {
  MAX_BLOG_BODY_LENGTH,
  MAX_BLOG_COVER_BYTES
} from "@/lib/blog-editor/validation";

import {
  deletePostAction,
  savePostAction,
  type EditorActionState
} from "../actions";
import styles from "../write.module.css";

type EditorFormProps = {
  document: BlogEditorPostDocument;
  expectedHeadOid: string;
  mode: "new" | "edit";
  saved: boolean;
};

type LocaleKey = "ko" | "en";

const initialEditorActionState: EditorActionState = {
  status: "idle",
  message: ""
};

const editorIssueFieldNames: Record<string, string> = {
  slug: "slug",
  publishedAt: "publishedAt",
  updatedAt: "updatedAt",
  coverImage: "coverImage",
  cover: "cover",
  coverWidth: "coverWidth",
  coverHeight: "coverHeight",
  "ko.title": "koTitle",
  "ko.description": "koDescription",
  "ko.category": "koCategory",
  "ko.readingTime": "koReadingTime",
  "ko.tags": "koTags",
  "en.title": "enTitle",
  "en.description": "enDescription",
  "en.category": "enCategory",
  "en.readingTime": "enReadingTime",
  "en.tags": "enTags",
  tags: "koTags",
  bodyKo: "bodyKo",
  bodyEn: "bodyEn"
};

function normalizedEditorIssueField(field: string | undefined) {
  return field?.replace(/\.\d+$/, "");
}

export function EditorForm({ document, expectedHeadOid, mode, saved }: EditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeLocale, setActiveLocale] = useState<LocaleKey>("ko");
  const [state, formAction, pending] = useActionState(savePostAction, initialEditorActionState);
  const [preview, setPreview] = useState(document.cover);
  const [coverWidth, setCoverWidth] = useState(String(document.coverWidth));
  const [coverHeight, setCoverHeight] = useState(String(document.coverHeight));

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (state.status !== "error" || !state.field) {
      return;
    }

    const field = normalizedEditorIssueField(state.field);
    if (!field) {
      return;
    }

    if (field.startsWith("en.") || field === "bodyEn") {
      setActiveLocale("en");
    } else if (field.startsWith("ko.") || field === "bodyKo" || field === "tags") {
      setActiveLocale("ko");
    }

    const animationFrame = window.requestAnimationFrame(() => {
      const controlName = editorIssueFieldNames[field];
      const target = controlName
        ? formRef.current?.elements.namedItem(controlName)
        : undefined;

      if (target instanceof HTMLElement) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [state.field, state.status]);

  const hasEditorIssue = (...fields: string[]) => {
    const field = normalizedEditorIssueField(state.field);
    return state.status === "error" && Boolean(field && fields.includes(field));
  };

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity("");
    const file = event.currentTarget.files?.[0];

    if (!file) {
      setPreview(document.cover);
      return;
    }

    if (file.size > MAX_BLOG_COVER_BYTES) {
      event.currentTarget.value = "";
      event.currentTarget.setCustomValidity("대표 이미지는 2MB 이하로 올려 주세요.");
      event.currentTarget.reportValidity();
      setPreview(document.cover);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      setCoverWidth(String(image.naturalWidth));
      setCoverHeight(String(image.naturalHeight));
    };
    image.src = objectUrl;
    setPreview(objectUrl);
  }

  return (
    <div className={styles.editorWrap}>
      <header className={styles.editorHeader}>
        <div>
          <Link className={styles.backLink} href="/write">
            <ArrowLeft aria-hidden="true" size={17} />
            글 목록
          </Link>
          <span className={styles.eyebrow}>{mode === "new" ? "NEW POST" : "EDIT POST"}</span>
          <h1>{mode === "new" ? "새 글" : document.ko.title}</h1>
        </div>
        <p>{mode === "new" ? "한국어와 영어를 한 번에 작성합니다." : document.slug}</p>
      </header>

      <form ref={formRef} action={formAction} className={styles.editorForm} noValidate>
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="originalSlug" value={mode === "edit" ? document.slug : ""} />
        <input type="hidden" name="expectedHeadOid" value={expectedHeadOid} />
        <input type="hidden" name="status" value="published" />

        <section className={styles.formSection}>
          <span className={styles.sectionIndex}>01 / 기본 정보</span>
          <div className={styles.formGrid}>
            <label className={styles.fieldWide}>
              <span className={styles.fieldLabel}>URL SLUG</span>
              <input
                className={styles.input}
                name="slug"
                defaultValue={document.slug}
                readOnly={mode === "edit"}
                required
                maxLength={120}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                autoComplete="off"
                aria-invalid={hasEditorIssue("slug")}
              />
              <span className={styles.fieldHelp}>영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.</span>
            </label>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>상태</span>
              <span className={styles.staticValue}>공개</span>
              <span className={styles.fieldHelp}>저장하면 새 배포 후 공개됩니다.</span>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>발행일</span>
              <input className={styles.input} type="date" name="publishedAt" defaultValue={document.publishedAt} required aria-invalid={hasEditorIssue("publishedAt")} />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>수정일</span>
              <input className={styles.input} type="date" name="updatedAt" defaultValue={document.updatedAt} required aria-invalid={hasEditorIssue("updatedAt")} />
            </label>
          </div>
        </section>

        <section className={styles.formSection}>
          <span className={styles.sectionIndex}>02 / 대표 이미지</span>
          <div className={styles.coverPreview}>
            <Image
              className={styles.coverPreviewImage}
              src={preview}
              alt="대표 이미지 미리보기"
              width={document.coverWidth}
              height={document.coverHeight}
              unoptimized={preview.startsWith("blob:")}
            />
            <div className={styles.formGrid}>
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>이미지 교체</span>
                <span className={styles.fieldHelp}>
                  JPEG, PNG, WebP, GIF · 최대 {MAX_BLOG_COVER_BYTES / 1024 / 1024}MB
                </span>
                <span className={styles.fileInput}>
                  <UploadSimple aria-hidden="true" size={18} />
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleCoverChange}
                    aria-invalid={hasEditorIssue("coverImage")}
                  />
                </span>
              </label>
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>현재 이미지 경로</span>
                <input className={styles.input} name="cover" defaultValue={document.cover} required aria-invalid={hasEditorIssue("cover")} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>너비 (px)</span>
                <input className={styles.input} type="number" name="coverWidth" min="1" max="20000" value={coverWidth} onChange={(event) => setCoverWidth(event.target.value)} required aria-invalid={hasEditorIssue("coverWidth")} />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>높이 (px)</span>
                <input className={styles.input} type="number" name="coverHeight" min="1" max="20000" value={coverHeight} onChange={(event) => setCoverHeight(event.target.value)} required aria-invalid={hasEditorIssue("coverHeight")} />
              </label>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <span className={styles.sectionIndex}>03 / 메타데이터</span>
          <div>
            <div className={styles.localeTabs} role="group" aria-label="언어 선택">
              <button
                className={styles.localeTab}
                type="button"
                id="metadata-tab-ko"
                aria-controls="metadata-panel-ko"
                aria-pressed={activeLocale === "ko"}
                onClick={() => setActiveLocale("ko")}
              >
                한국어
              </button>
              <button
                className={styles.localeTab}
                type="button"
                id="metadata-tab-en"
                aria-controls="metadata-panel-en"
                aria-pressed={activeLocale === "en"}
                onClick={() => setActiveLocale("en")}
              >
                English
              </button>
            </div>

            {(["ko", "en"] as const).map((locale) => {
              const content = document[locale];
              const prefix = locale === "ko" ? "ko" : "en";
              return (
                <div
                  className={styles.localePanel}
                  role="region"
                  id={`metadata-panel-${locale}`}
                  aria-labelledby={`metadata-tab-${locale}`}
                  hidden={activeLocale !== locale}
                  key={locale}
                >
                  <div className={styles.localeFields}>
                    <label className={styles.fieldWide}>
                      <span className={styles.fieldLabel}>제목</span>
                      <input className={styles.input} name={`${prefix}Title`} defaultValue={content.title} maxLength={140} required={document.status === "published"} aria-invalid={hasEditorIssue(`${locale}.title`)} />
                    </label>
                    <label className={styles.fieldWide}>
                      <span className={styles.fieldLabel}>요약</span>
                      <textarea className={styles.textarea} name={`${prefix}Description`} defaultValue={content.description} maxLength={320} aria-invalid={hasEditorIssue(`${locale}.description`)} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>카테고리</span>
                      <input className={styles.input} name={`${prefix}Category`} defaultValue={content.category} maxLength={80} aria-invalid={hasEditorIssue(`${locale}.category`)} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>읽는 시간</span>
                      <input className={styles.input} name={`${prefix}ReadingTime`} defaultValue={content.readingTime} maxLength={40} aria-invalid={hasEditorIssue(`${locale}.readingTime`)} />
                    </label>
                    <label className={styles.fieldWide}>
                      <span className={styles.fieldLabel}>태그</span>
                      <input className={styles.input} name={`${prefix}Tags`} defaultValue={content.tags.join(", ")} aria-invalid={hasEditorIssue(`${locale}.tags`, "tags")} />
                      <span className={styles.fieldHelp}>쉼표로 구분하고 두 언어의 태그 수를 맞춰 주세요.</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.formSection}>
          <span className={styles.sectionIndex}>04 / 본문</span>
          <div>
            <div className={styles.localeTabs} role="group" aria-label="본문 언어 선택">
              <button
                className={styles.localeTab}
                type="button"
                id="body-tab-ko"
                aria-controls="body-panel-ko"
                aria-pressed={activeLocale === "ko"}
                onClick={() => setActiveLocale("ko")}
              >
                한국어 본문
              </button>
              <button
                className={styles.localeTab}
                type="button"
                id="body-tab-en"
                aria-controls="body-panel-en"
                aria-pressed={activeLocale === "en"}
                onClick={() => setActiveLocale("en")}
              >
                English body
              </button>
            </div>
            <div
              className={styles.localePanel}
              role="region"
              id="body-panel-ko"
              aria-labelledby="body-tab-ko"
              hidden={activeLocale !== "ko"}
            >
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>MARKDOWN · 한국어</span>
                <textarea className={styles.markdown} name="bodyKo" defaultValue={document.bodyKo} maxLength={MAX_BLOG_BODY_LENGTH} spellCheck="true" aria-invalid={hasEditorIssue("bodyKo")} />
                <span className={styles.fieldHelp}>최대 {MAX_BLOG_BODY_LENGTH.toLocaleString("ko-KR")}자</span>
              </label>
            </div>
            <div
              className={styles.localePanel}
              role="region"
              id="body-panel-en"
              aria-labelledby="body-tab-en"
              hidden={activeLocale !== "en"}
            >
              <label className={styles.fieldWide}>
                <span className={styles.fieldLabel}>MARKDOWN · ENGLISH</span>
                <textarea className={styles.markdown} name="bodyEn" defaultValue={document.bodyEn} maxLength={MAX_BLOG_BODY_LENGTH} spellCheck="true" aria-invalid={hasEditorIssue("bodyEn")} />
                <span className={styles.fieldHelp}>Up to {MAX_BLOG_BODY_LENGTH.toLocaleString("en-US")} characters</span>
              </label>
            </div>
          </div>
        </section>

        {mode === "edit" ? (
          <section className={styles.dangerZone}>
            <div>
              <strong>글 삭제</strong>
              <p>삭제하면 Git 기록을 되돌리기 전까지 공개 목록에서 사라집니다.</p>
            </div>
            <button
              className={styles.dangerButton}
              type="submit"
              formAction={deletePostAction}
              onClick={(event) => {
                if (!window.confirm("이 글을 삭제할까요?")) event.preventDefault();
              }}
            >
              <Trash aria-hidden="true" size={17} />
              삭제
            </button>
          </section>
        ) : null}

        <footer className={styles.formFooter}>
          <p
            className={styles.formStatus}
            data-tone={state.status}
            role={state.status === "error" ? "alert" : "status"}
            aria-live={state.status === "error" ? "assertive" : "polite"}
          >
            {state.status !== "idle"
              ? state.message
              : saved
                ? "저장했습니다."
                : "변경 내용은 저장 전까지 공개되지 않습니다."}
          </p>
          <div className={styles.formActions}>
            <Link className={styles.secondaryButton} href="/write">취소</Link>
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={pending || state.status === "success"}
            >
              <FloppyDisk aria-hidden="true" size={18} />
              {pending ? "저장 중" : state.status === "success" ? "저장 완료" : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
