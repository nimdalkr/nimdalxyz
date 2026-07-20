import type { BlogReadingTimes } from "@/lib/blog-automation/types";

export const KOREAN_READING_CHARACTERS_PER_MINUTE = 500;
export const ENGLISH_READING_WORDS_PER_MINUTE = 200;

function textForReadingTime(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#~|=-]+/g, " ");
}

export function calculateBlogReadingTime(markdown: string, locale: "ko" | "en") {
  const readable = textForReadingTime(markdown);

  if (locale === "ko") {
    const characterCount = readable.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
    const minutes = Math.max(1, Math.ceil(characterCount / KOREAN_READING_CHARACTERS_PER_MINUTE));
    return `${minutes}분`;
  }

  const wordCount =
    readable.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const minutes = Math.max(1, Math.ceil(wordCount / ENGLISH_READING_WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

export function calculateBlogReadingTimes(bodyKo: string, bodyEn: string): BlogReadingTimes {
  return {
    ko: calculateBlogReadingTime(bodyKo, "ko"),
    en: calculateBlogReadingTime(bodyEn, "en")
  };
}
