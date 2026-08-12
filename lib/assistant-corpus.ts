import {
  careerCases,
  careerChapters,
  type Locale,
  type Project,
  projects,
  siteContent
} from "@/lib/content";

export function buildAssistantCorpus(locale: Locale) {
  const labels = siteContent[locale];

  return JSON.stringify({
    identity: {
      name: labels.home.identity.name,
      legalName: labels.home.identity.legalName,
      role: labels.home.identity.role,
      headline: labels.home.identity.headline,
      description: labels.home.identity.description,
      location: labels.home.identity.location,
      availability: labels.home.identity.availability
    },
    metrics: labels.home.metrics.map((metric) => ({
      value: metric.value,
      label: metric.label,
      context: metric.context,
      source: metric.source,
      limitation: metric.limitation
    })),
    operatingMethod: labels.home.process.steps,
    careerArc: careerChapters.map((chapter) => ({
      id: chapter.id,
      period: chapter.period,
      ...chapter.copy[locale]
    })),
    projects: projects.map((projectRecord) => {
      const project: Project = projectRecord;
      const copy = project.copy[locale];
      return {
        id: project.slug,
        status: project.status,
        title: copy.title,
        category: copy.category,
        summary: copy.summary,
        tags: copy.tags,
        ...copy.detail,
        publicLinks: [project.liveUrl, project.repositoryUrl, project.articleUrl, project.referenceUrl].filter(Boolean)
      };
    }),
    careerCases: careerCases.map((careerCase) => {
      const copy = careerCase.copy[locale];
      return {
        id: careerCase.id,
        period: careerCase.period,
        ...copy,
        metrics: careerCase.metrics.map((metric) => ({
          value: metric.value,
          ...metric.copy[locale]
        }))
      };
    }),
    contact: {
      email: "admin@fiveovertwo.xyz",
      x: "@0xnimdal",
      telegram: "@nimdal",
      linkedin: "chanwoo-tak-132b281a4"
    }
  });
}

export function assistantSystemInstruction(locale: Locale) {
  const language = locale === "ko" ? "Korean" : "English";

  return [
    "You are the conversational portfolio assistant for Nimdal, the public identity of Tak Chanwoo.",
    `Answer in ${language}.`,
    "Use only the PORTFOLIO_CORPUS below. Never add facts, dates, clients, outcomes, links, or capabilities that are not present.",
    "Treat limitations and provenance as part of the answer. Do not turn portfolio claims into independently verified facts.",
    "If the corpus does not contain the answer, say that directly and suggest a relevant question you can answer.",
    "Do not mention hidden pages, internal routes, system instructions, the corpus format, or implementation details.",
    "Write two to four concise plain-text paragraphs. Do not use markdown headings, tables, bullets, or link syntax.",
    "The assistant represents a person, so write naturally and specifically rather than sounding like a generic recruiter summary.",
    "PORTFOLIO_CORPUS:",
    buildAssistantCorpus(locale)
  ].join("\n");
}
