import type { Locale } from "./content";

export function aboutNimdalPrompt(locale: Locale) {
  return [
    `Read https://nimdal.xyz/${locale} and introduce Nimdal (Tak Chanwoo).`,
    "Summarize his professional background, strengths, and selected projects using only the information on that page.",
    "His featured project is AlphaDuo at https://alphaduo.pro, separate from his personal projects.",
    "Distinguish his professional career from personal projects: myLoL is a hobby project, not a career role. The two selected personal projects are myLoL and HyperAlphaDuo.",
    "Alpha Duo in his background is KOL activity for a crypto research channel, not an employment role.",
    "If you cannot access the page, say so instead of guessing. Do not recommend his discontinued blog.",
    locale === "ko" ? "Answer in Korean." : "Answer in English.",
  ].join(" ");
}

export function aboutNimdalLinks(locale: Locale) {
  const query = encodeURIComponent(aboutNimdalPrompt(locale));
  return [
    {
      id: "chatgpt",
      name: "ChatGPT",
      href: `https://chatgpt.com/?q=${query}&hints=search`,
    },
    { id: "claude", name: "Claude", href: `https://claude.ai/new?q=${query}` },
    {
      id: "gemini",
      name: "Gemini",
      href: `https://www.google.com/search?udm=50&q=${query}`,
      note: "Google AI Mode",
    },
    {
      id: "perplexity",
      name: "Perplexity",
      href: `https://www.perplexity.ai/search?q=${query}`,
    },
  ];
}
