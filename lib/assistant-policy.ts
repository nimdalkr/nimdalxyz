import type { Locale } from "@/lib/content";

const INTERNAL_QUESTION_PATTERNS = [
  /\b(?:gemini|chatgpt|claude|openai|anthropic|google ai|vertex ai)\b/i,
  /\b(?:which|what|who)\b.{0,32}\b(?:api|model|provider|llm|sdk)\b/i,
  /\b(?:api|model|provider|llm|sdk)\b.{0,32}\b(?:power|use|run|behind|underlying|built|call|connect)\b/i,
  /\b(?:api key|system prompt|developer prompt|environment variable|env var|implementation details?|tech(?:nology)? stack|under the hood)\b/i,
  /(?:제미나이|지피티|챗지피티|클로드|앤트로픽|오픈ai|구글 ai|버셀|베르셀)/i,
  /(?:어떤|무슨|어느)\s*(?:ai|모델|llm|api|서비스|제공자|기술|스택)/i,
  /(?:api\s*키|시스템\s*프롬프트|개발자\s*프롬프트|내부\s*구현|기술\s*스택|환경\s*변수|환경변수|모델명|사용\s*모델|모델\s*제공자)/i
];

export function isInternalAssistantQuestion(question: string) {
  const normalized = question.trim();
  return normalized.length > 0 && INTERNAL_QUESTION_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function assistantRefusal(locale: Locale) {
  return locale === "ko"
    ? "내부 구현 정보는 공개하지 않아요. Nimdal의 공개 포트폴리오와 작업 기록에 대해서는 답할 수 있어요."
    : "I don’t share internal implementation details. I can answer questions about Nimdal’s public portfolio and work.";
}
