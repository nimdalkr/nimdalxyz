import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextResponse } from "next/server";

import { assistantSystemInstruction } from "@/lib/assistant-corpus";
import { assistantRefusal, isInternalAssistantQuestion } from "@/lib/assistant-policy";
import { isLocale, type Locale } from "@/lib/content";

export const runtime = "nodejs";
export const maxDuration = 20;

type HistoryEntry = {
  role: "user" | "assistant";
  text: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 12;
const requestWindows = new Map<string, { count: number; resetAt: number }>();

function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "local";
}

function exceedsRateLimit(key: string) {
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || current.resetAt <= now) {
    requestWindows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function hasValidOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function sanitizeHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is HistoryEntry => (
      typeof entry === "object"
      && entry !== null
      && (entry.role === "user" || entry.role === "assistant")
      && typeof entry.text === "string"
    ))
    .slice(-6)
    .map((entry) => ({ role: entry.role, text: entry.text.slice(0, 900) }));
}

export async function POST(request: Request) {
  if (!hasValidOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (exceedsRateLimit(requestIp(request))) {
    return NextResponse.json(
      { error: "The assistant is receiving too many questions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }

  let payload: { question?: unknown; locale?: unknown; history?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = typeof payload.question === "string" ? payload.question.trim() : "";
  const locale: Locale = isLocale(payload.locale) ? payload.locale : "en";
  if (!question || question.length > 600) {
    return NextResponse.json({ error: "Question must contain between 1 and 600 characters." }, { status: 400 });
  }

  if (isInternalAssistantQuestion(question)) {
    return NextResponse.json(
      { answer: assistantRefusal(locale), grounded: true, refused: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.replace(/^\uFEFF/, "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "AI assistant is not configured.", code: "AI_NOT_CONFIGURED" }, { status: 503 });
  }

  const history = sanitizeHistory(payload.history);
  const conversation = history.length > 0
    ? `Recent conversation:\n${history.map((entry) => `${entry.role.toUpperCase()}: ${entry.text}`).join("\n")}\n\nCurrent question:\n${question}`
    : question;
  const model = process.env.GEMINI_PORTFOLIO_MODEL?.replace(/^\uFEFF/, "").trim() || "gemini-3.6-flash";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: conversation,
      config: {
        systemInstruction: assistantSystemInstruction(locale),
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 900,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        httpOptions: { timeout: 15_000 }
      }
    });
    const answer = response.text?.trim();
    if (!answer) throw new Error("The assistant returned an empty response.");

    return NextResponse.json(
      { answer, grounded: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Portfolio assistant request failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "The assistant could not answer right now. Please try a suggested question." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
