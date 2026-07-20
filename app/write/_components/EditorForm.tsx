"use client";

import { ArrowLeft, FloppyDisk, ImageSquare, Trash, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import type { BlogEditorPostDocument } from "@/lib/blog-editor";
import {
  MAX_BLOG_BODY_IMAGE_BYTES,
  MAX_BLOG_BODY_IMAGES,
  MAX_BLOG_BODY_IMAGES_TOTAL_BYTES,
  MAX_BLOG_BODY_LENGTH
} from "@/lib/blog-editor/validation";

import { deletePostAction, savePostAction, type EditorActionState } from "../actions";
import styles from "../write.module.css";

type EditorFormProps = {
  deleteError?: "conflict" | "failed";
  document: BlogEditorPostDocument;
  expectedHeadOid: string;
  mode: "new" | "edit";
  queued: boolean;
  saved: boolean;
};

type BodyAttachment = {
  id: string;
  file: File;
  previewUrl: string;
  alt: string;
  width: number;
  height: number;
};

type TextSelection = {
  start: number;
  end: number;
};

const initialEditorActionState: EditorActionState = {
  status: "idle",
  message: ""
};

const editorIssueFieldNames: Record<string, string> = {
  "ko.title": "koTitle",
  titleKo: "koTitle",
  bodyKo: "bodyKo",
  bodyImages: "bodyImages",
  attachmentsManifest: "bodyImages"
};

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizedEditorIssueField(field: string | undefined) {
  return field?.replace(/\.\d+$/, "");
}

function imageAltFromFileName(fileName: string, index: number) {
  const readableName = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/[\[\]\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return readableName || `본문 이미지 ${index + 1}`;
}

function markdownSafeAlt(alt: string) {
  return alt.replace(/[\[\]\r\n]/g, " ").replace(/\s+/g, " ").trim();
}

function attachmentMarkdown(attachment: Pick<BodyAttachment, "alt" | "id">) {
  return `![${markdownSafeAlt(attachment.alt)}](attachment:${attachment.id})`;
}

function insertAtSelection(value: string, selection: TextSelection, insertion: string) {
  const position = Math.min(Math.max(selection.end, 0), value.length);
  const before = value.slice(0, position);
  const after = value.slice(position);
  const prefix = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const suffix = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  const inserted = `${prefix}${insertion}${suffix}`;

  return {
    value: `${before}${inserted}${after}`,
    caret: before.length + inserted.length
  };
}

function attachmentAltInBody(body: string, id: string) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`!\\[([^\\]]*)\\]\\(attachment:${escapedId}\\)`));
  return match?.[1];
}

function replaceAttachmentAlt(body: string, id: string, alt: string) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.replace(
    new RegExp(`!\\[[^\\]]*\\]\\(attachment:${escapedId}\\)`),
    `![${markdownSafeAlt(alt)}](attachment:${id})`
  );
}

function removeAttachmentMarkdown(body: string, id: string) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body
    .replace(new RegExp(`(?:\\n{0,2})!\\[[^\\]]*\\]\\(attachment:${escapedId}\\)(?:\\n{0,2})`), "\n\n")
    .replace(/^\n{2,}|\n{2,}$/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

function imageDimensions(previewUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    image.src = previewUrl;
  });
}

function formatMegabytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}MB`;
}

export function EditorForm({
  deleteError,
  document,
  expectedHeadOid,
  mode,
  queued,
  saved
}: EditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<TextSelection>({ start: document.bodyKo.length, end: document.bodyKo.length });
  const previewUrlsRef = useRef(new Set<string>());
  const submittedRevisionRef = useRef(0);
  const [state, formAction, pending] = useActionState(savePostAction, initialEditorActionState);
  const [title, setTitle] = useState(document.ko.title);
  const [body, setBody] = useState(document.bodyKo);
  const [attachments, setAttachments] = useState<BodyAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [readingImages, setReadingImages] = useState(false);
  const [editRevision, setEditRevision] = useState(0);
  const [resultRevision, setResultRevision] = useState<number | null>(null);

  const activeAttachments = useMemo(
    () => attachments.filter((attachment) => body.includes(`attachment:${attachment.id}`)),
    [attachments, body]
  );
  const attachmentsSize = attachments.reduce((total, attachment) => total + attachment.file.size, 0);
  const attachmentsManifest = JSON.stringify(
    activeAttachments.map((attachment) => ({
      id: attachment.id,
      alt: attachmentAltInBody(body, attachment.id) ?? attachment.alt,
      width: attachment.width,
      height: attachment.height
    }))
  );

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (state.status !== "idle") {
      setResultRevision(submittedRevisionRef.current);
    }
  }, [state]);

  const actionResultIsCurrent = resultRevision !== null && resultRevision === editRevision;
  const visibleActionStatus = actionResultIsCurrent ? state.status : "idle";

  useEffect(() => {
    if (
      state.status !== "error" ||
      !state.field ||
      submittedRevisionRef.current !== editRevision
    ) {
      return;
    }

    const field = normalizedEditorIssueField(state.field);
    const controlName = field ? editorIssueFieldNames[field] : undefined;
    const animationFrame = window.requestAnimationFrame(() => {
      const target = controlName === "bodyImages"
        ? fileInputRef.current
        : controlName
          ? formRef.current?.elements.namedItem(controlName)
          : undefined;

      if (target instanceof HTMLElement) {
        target.focus();
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [editRevision, state.field, state.status]);

  const hasEditorIssue = (...fields: string[]) => {
    const field = normalizedEditorIssueField(state.field);
    return visibleActionStatus === "error" && Boolean(field && fields.includes(field));
  };

  function markEdited() {
    setEditRevision((current) => current + 1);
  }

  function rememberSelection() {
    const textarea = bodyRef.current;
    if (!textarea) return;
    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    };
  }

  function focusBodyAt(position: number) {
    window.requestAnimationFrame(() => {
      const textarea = bodyRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(position, position);
      selectionRef.current = { start: position, end: position };
    });
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length === 0) return;

    setAttachmentError("");

    if (attachments.length + files.length > MAX_BLOG_BODY_IMAGES) {
      setAttachmentError(`이미지는 최대 ${MAX_BLOG_BODY_IMAGES}장까지 첨부할 수 있습니다.`);
      return;
    }

    const unsupportedFile = files.find((file) => !acceptedImageTypes.has(file.type));
    if (unsupportedFile) {
      setAttachmentError("JPG, PNG, WebP만 첨부할 수 있습니다.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_BLOG_BODY_IMAGE_BYTES);
    if (oversizedFile) {
      setAttachmentError(`이미지 한 장은 ${formatMegabytes(MAX_BLOG_BODY_IMAGE_BYTES)} 이하여야 합니다.`);
      return;
    }

    const nextTotalBytes = attachmentsSize + files.reduce((total, file) => total + file.size, 0);
    if (nextTotalBytes > MAX_BLOG_BODY_IMAGES_TOTAL_BYTES) {
      setAttachmentError(`첨부 이미지는 합계 ${formatMegabytes(MAX_BLOG_BODY_IMAGES_TOTAL_BYTES)} 이하여야 합니다.`);
      return;
    }

    setReadingImages(true);
    const createdUrls: string[] = [];

    try {
      const nextAttachments = await Promise.all(
        files.map(async (file, index) => {
          const previewUrl = URL.createObjectURL(file);
          createdUrls.push(previewUrl);
          const dimensions = await imageDimensions(previewUrl);

          if (
            dimensions.width < 1 ||
            dimensions.height < 1 ||
            dimensions.width > 20_000 ||
            dimensions.height > 20_000
          ) {
            throw new Error("이미지 크기를 확인해 주세요.");
          }

          return {
            id: window.crypto.randomUUID().replaceAll("-", ""),
            file,
            previewUrl,
            alt: imageAltFromFileName(file.name, attachments.length + index),
            ...dimensions
          };
        })
      );

      createdUrls.forEach((url) => previewUrlsRef.current.add(url));
      setAttachments((current) => [...current, ...nextAttachments]);
      const markdown = nextAttachments.map(attachmentMarkdown).join("\n\n");

      setBody((currentBody) => {
        const inserted = insertAtSelection(currentBody, selectionRef.current, markdown);
        focusBodyAt(inserted.caret);
        return inserted.value;
      });
      markEdited();
    } catch (error) {
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
      setAttachmentError(error instanceof Error ? error.message : "이미지를 읽을 수 없습니다.");
    } finally {
      setReadingImages(false);
    }
  }

  function handleBodyChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextBody = event.currentTarget.value;
    setBody(nextBody);
    markEdited();
    setAttachments((current) =>
      current.map((attachment) => {
        const bodyAlt = attachmentAltInBody(nextBody, attachment.id);
        return bodyAlt !== undefined && bodyAlt !== attachment.alt
          ? { ...attachment, alt: bodyAlt }
          : attachment;
      })
    );
  }

  function handleAltChange(id: string, alt: string) {
    setAttachments((current) =>
      current.map((attachment) => (attachment.id === id ? { ...attachment, alt } : attachment))
    );
    setBody((current) => replaceAttachmentAlt(current, id, alt));
    markEdited();
  }

  function removeAttachment(attachment: BodyAttachment) {
    URL.revokeObjectURL(attachment.previewUrl);
    previewUrlsRef.current.delete(attachment.previewUrl);
    setAttachments((current) => current.filter((item) => item.id !== attachment.id));
    setBody((current) => removeAttachmentMarkdown(current, attachment.id));
    setAttachmentError("");
    markEdited();
    bodyRef.current?.focus();
  }

  function submitWithImages(formData: FormData) {
    submittedRevisionRef.current = editRevision;
    formData.set("attachmentsManifest", attachmentsManifest);
    activeAttachments.forEach((attachment) => {
      formData.append("bodyImages", attachment.file, `${attachment.id}--${attachment.file.name}`);
    });
    formAction(formData);
  }

  const defaultStatus = queued
    ? "반영 대기 중입니다."
    : saved && editRevision === 0
      ? "저장했습니다."
      : "저장하면 반영 대기 목록에 추가됩니다.";

  return (
    <div className={styles.editorWrap}>
      <header className={styles.editorHeader}>
        <div>
          <Link className={styles.backLink} href="/write">
            <ArrowLeft aria-hidden="true" size={17} />
            글 목록
          </Link>
          <div className={styles.editorHeadingMeta}>
            <span className={styles.eyebrow}>{mode === "new" ? "새 글" : "글 수정"}</span>
            {queued ? <span className={styles.queueBadge}>반영 대기</span> : null}
          </div>
          <h1>글쓰기</h1>
        </div>
        {mode === "edit" ? <p>{document.slug}</p> : null}
      </header>

      <form
        ref={formRef}
        action={submitWithImages}
        className={styles.editorForm}
        aria-busy={pending || readingImages}
      >
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="originalSlug" value={mode === "edit" ? document.slug : ""} />
        <input type="hidden" name="slug" value={mode === "edit" ? document.slug : ""} />
        <input type="hidden" name="expectedHeadOid" value={expectedHeadOid} />
        <input type="hidden" name="attachmentsManifest" value={attachmentsManifest} />

        <section className={styles.writingCanvas} aria-label="글 내용">
          <label className={styles.titleField}>
            <span className={styles.fieldLabel}>제목</span>
            <input
              className={styles.titleInput}
              name="koTitle"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                markEdited();
              }}
              placeholder="제목을 입력하세요"
              maxLength={140}
              required
              autoComplete="off"
              autoFocus
              aria-invalid={hasEditorIssue("ko.title", "titleKo")}
            />
          </label>

          <div className={styles.bodyField}>
            <div className={styles.bodyToolbar}>
              <span className={styles.fieldLabel}>본문 · Markdown</span>
              <div className={styles.imageTools}>
                <span className={styles.attachmentCount}>
                  {attachments.length}/{MAX_BLOG_BODY_IMAGES} · {formatMegabytes(attachmentsSize)}
                </span>
                <label
                  className={styles.imageButton}
                  onPointerDown={rememberSelection}
                  onKeyDown={rememberSelection}
                >
                  <ImageSquare aria-hidden="true" size={18} />
                  {readingImages ? "불러오는 중" : "이미지"}
                  <input
                    ref={fileInputRef}
                    className={styles.imageInput}
                    id="body-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={readingImages || pending}
                    onChange={handleImageChange}
                    aria-describedby="body-image-help body-image-error"
                    aria-invalid={Boolean(attachmentError) || hasEditorIssue("bodyImages", "attachmentsManifest")}
                  />
                </label>
              </div>
            </div>

            <p className={styles.imageHelp} id="body-image-help">
              커서 위치에 삽입 · 최대 {MAX_BLOG_BODY_IMAGES}장 · 합계 {formatMegabytes(MAX_BLOG_BODY_IMAGES_TOTAL_BYTES)}
            </p>
            <p className={styles.imageError} id="body-image-error" role="alert">
              {attachmentError}
            </p>

            <label className={styles.srOnly} htmlFor="body-ko">한국어 본문</label>
            <textarea
              ref={bodyRef}
              className={styles.markdown}
              id="body-ko"
              name="bodyKo"
              value={body}
              placeholder="본문을 입력하세요"
              maxLength={MAX_BLOG_BODY_LENGTH}
              required
              spellCheck="true"
              onChange={handleBodyChange}
              onSelect={rememberSelection}
              onClick={rememberSelection}
              onKeyUp={rememberSelection}
              aria-invalid={hasEditorIssue("bodyKo")}
            />
          </div>

          {attachments.length > 0 ? (
            <div className={styles.attachmentSection}>
              <div className={styles.attachmentHeading}>
                <span className={styles.fieldLabel}>첨부 이미지</span>
                <span>{attachments.length}장</span>
              </div>
              <ul className={styles.attachmentList}>
                {attachments.map((attachment) => {
                  const placed = body.includes(`attachment:${attachment.id}`);

                  return (
                    <li className={styles.attachmentItem} key={attachment.id} data-placed={placed}>
                      <Image
                        className={styles.attachmentPreview}
                        src={attachment.previewUrl}
                        alt={attachment.alt || "첨부 이미지 미리보기"}
                        width={96}
                        height={72}
                        unoptimized
                      />
                      <div className={styles.attachmentDetails}>
                        <label>
                          <span className={styles.srOnly}>{attachment.file.name} 이미지 설명</span>
                          <input
                            className={styles.altInput}
                            value={attachment.alt}
                            onChange={(event) => handleAltChange(attachment.id, event.target.value)}
                            placeholder="이미지 설명"
                            maxLength={180}
                            required={placed}
                          />
                        </label>
                        <span className={styles.attachmentMeta}>
                          {placed ? "본문에 삽입됨" : "본문에서 삭제됨"} · {attachment.width}×{attachment.height}
                        </span>
                      </div>
                      <button
                        className={styles.removeImageButton}
                        type="button"
                        onClick={() => removeAttachment(attachment)}
                        aria-label={`${attachment.file.name} 첨부 취소`}
                      >
                        <X aria-hidden="true" size={17} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </section>

        {mode === "edit" ? (
          <section className={styles.dangerZone} aria-label="글 삭제">
            <strong>글 삭제</strong>
            {deleteError ? (
              <p className={styles.deleteError} role="alert">
                {deleteError === "conflict"
                  ? "다른 변경이 먼저 반영됐습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요."
                  : "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."}
              </p>
            ) : null}
            <button
              className={styles.dangerButton}
              type="submit"
              formAction={deletePostAction}
              formNoValidate
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
            data-tone={visibleActionStatus}
            role={visibleActionStatus === "error" ? "alert" : "status"}
            aria-live={visibleActionStatus === "error" ? "assertive" : "polite"}
          >
            {pending
              ? "저장 중입니다."
              : visibleActionStatus !== "idle"
                ? state.message
                : defaultStatus}
          </p>
          <div className={styles.formActions}>
            <Link className={styles.secondaryButton} href="/write">취소</Link>
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={pending || readingImages || visibleActionStatus === "success"}
            >
              <FloppyDisk aria-hidden="true" size={18} />
              {pending
                ? "저장 중"
                : visibleActionStatus === "success"
                  ? "저장 완료"
                  : state.status === "success" || queued
                    ? "다시 저장"
                    : "저장"}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
