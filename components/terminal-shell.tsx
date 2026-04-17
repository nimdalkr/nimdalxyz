"use client";

import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";

import { profileContent } from "@/data/profile";

type TerminalShellProps = {
  intro: ReactNode;
  bootedAt: number;
};

const moduleLinks = [
  { id: "home", label: "01._HOME" },
  { id: "work", label: "02._WORK" },
  { id: "about", label: "03._ABOUT" },
  { id: "resume", label: "04._RESUME" }
] as const;

type ModuleId = (typeof moduleLinks)[number]["id"];

type CommandOutput = {
  heading?: string;
  rows?: Array<{ key: string; description: string }>;
  lines?: string[];
};

type BootLine = {
  prefix?: string;
  target?: string;
  status?: string;
  tone?: "accent" | "orange" | "dim";
  suffix?: string;
};

function formatUptime(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatUtcOffset(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getWeekNumber(date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));

  return Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getSharedPrefix(values: string[]) {
  if (!values.length) {
    return "";
  }

  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix) && prefix) {
      prefix = prefix.slice(0, -1);
    }
  }

  return prefix;
}

const runtimeInfo = [
  { label: "SYS.NAME", value: "NIMDAL_OS v1.0.0" },
  { label: "SYS.AUTH", value: "GUEST_ACCESS_GRANTED", tone: "accent" as const },
  { label: "SYS.NODE", value: "nimdal.xyz" }
];

const runtimeInfoRight = [
  { label: "UPTIME", value: "dynamic" },
  { label: "TERMINAL", value: "TTY0" },
  { label: "STATUS", value: "200", tone: "orange" as const }
];

const whoamiLines = [
  "nimdal (chanwoo tak | 1992.11.20)",
  "> role: growth_marketer",
  "> stack: web2_marketing -> web3 marketer / ai / automation / fake_dev",
  "> mode: building_in_public",
  "",
  "> current_focus:",
  "- GTM for early-stage products",
  "- AI workflow automation",
  "- crypto-native growth loops"
].join("\n");

const bootLines: BootLine[] = [
  { prefix: "NIMDAL_OS v1.0.0", suffix: " -- booting" },
  { prefix: "Loading", target: " growth.systems.pkg", status: "[OK]", tone: "accent" },
  { prefix: "Loading", target: " localization.ops.pkg", status: "[OK]", tone: "accent" },
  { prefix: "Loading", target: " web3.channels.pkg", status: "[OK]", tone: "accent" },
  { prefix: "Loading", target: " ai.workflow.pkg", status: "[OK]", tone: "accent" },
  { prefix: "Mounting", target: " /projects/nomorenaver", status: "[LIVE]", tone: "accent" },
  { prefix: "Mounting", target: " /projects/daltacks", status: "[LIVE]", tone: "accent" },
  { prefix: "Mounting", target: " /projects/ethosalpha", status: "[WIP]", tone: "orange" },
  { prefix: "Checking", target: " market.signal.status", status: "[TRUE]", tone: "accent" },
  { prefix: "READY." }
];

const asciiLogo = ` _   _ ___ __  __ ____    _    _
| \\ | |_ _|  \\/  |  _ \\  / \\  | |
|  \\| || || |\\/| | | | |/ _ \\ | |
| |\\  || || |  | | |_| / ___ \\| |___
|_| \\_|___|_|  |_|____/_/   \\_\\_____|`;

const helpGroups = {
  core: [
    { key: "home", description: "// go home" },
    { key: "work", description: "// project list" },
    { key: "about", description: "// about page" },
    { key: "resume", description: "// resume page" }
  ],
  links: [
    { key: "blog", description: "// open blog" },
    { key: "portfolio", description: "// open portfolio" },
    { key: "github", description: "// open github" },
    { key: "linkedin", description: "// open linkedin" },
    { key: "x", description: "// open x" },
    { key: "telegram", description: "// open telegram" },
    { key: "channel", description: "// open channel" },
    { key: "email", description: "// copy email" }
  ],
  projects: [
    { key: "nimdalcraft", description: "// web2 ai product system" },
    { key: "mylol", description: "// web2 lck sim game" },
    { key: "daltacks", description: "// web3 stacks monorepo" },
    { key: "ethosalpha", description: "// web3 analytics dashboard" },
    { key: "nomorenaver", description: "// web2 naver keyword tool" }
  ],
  system: [
    { key: "status", description: "// current operating mode" },
    { key: "contact", description: "// contact endpoints" },
    { key: "stack", description: "// active stack" },
    { key: "date", description: "// local datetime snapshot" },
    { key: "today", description: "// local time + location" },
    { key: "timezone", description: "// browser timezone" },
    { key: "whereami", description: "// timezone + optional coords" },
    { key: "reset", description: "// replay boot sequence" }
  ]
} as const;

const aliasMap: Record<string, string> = {
  gh: "github",
  tg: "telegram",
  cv: "resume"
};

const commandCatalog = [
  "help",
  "help core",
  "help links",
  "help projects",
  "help system",
  "home",
  "work",
  "about",
  "resume",
  "status",
  "contact",
  "stack",
  "date",
  "today",
  "today --full",
  "timezone",
  "whereami",
  "pwd",
  "uname",
  "whoami",
  "clear",
  "reset",
  "ls",
  "ls projects",
  "ls /projects",
  "ls /projects/",
  "ls links",
  "ls ~/links",
  "cat status.txt",
  "cat about.md",
  "cat resume.txt",
  "open blog",
  "open portfolio",
  "open github",
  "open linkedin",
  "open x",
  "open telegram",
  "open channel",
  "open nimdalcraft",
  "open mylol",
  "open daltacks",
  "open ethosalpha",
  "open nomorenaver",
  ...helpGroups.links.map((item) => item.key),
  ...helpGroups.projects.map((item) => item.key)
];

export function TerminalShell({ intro, bootedAt }: TerminalShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>("home");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [commandValue, setCommandValue] = useState("");
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [uptime, setUptime] = useState(() => formatUptime(Date.now() - bootedAt));
  const [bootLineCount, setBootLineCount] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);

  const activeIndex = moduleLinks.findIndex((moduleLink) => moduleLink.id === activeModule);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime(formatUptime(Date.now() - bootedAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [bootedAt]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setBootLineCount(bootLines.length);
      setBootComplete(true);
      return;
    }

    const lineTimer = window.setInterval(() => {
      setBootLineCount((current) => {
        if (current >= bootLines.length) {
          window.clearInterval(lineTimer);
          window.setTimeout(() => {
            setBootComplete(true);
          }, 220);
          return current;
        }

        return current + 1;
      });
    }, 120);

    return () => window.clearInterval(lineTimer);
  }, []);

  const moveModule = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + moduleLinks.length) % moduleLinks.length;
    setActiveModule(moduleLinks[nextIndex].id);
    setExpandedProject(null);
  };

  const setOutput = (output: CommandOutput | null) => {
    setCommandOutput(output);
  };

  const restartBootSequence = () => {
    setActiveModule("home");
    setExpandedProject(null);
    setCommandOutput(null);
    setCommandValue("");
    setHistoryIndex(null);
    setBootLineCount(0);
    setBootComplete(false);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setBootLineCount(bootLines.length);
      setBootComplete(true);
      return;
    }

    let lineTimer = 0;
    lineTimer = window.setInterval(() => {
      setBootLineCount((current) => {
        if (current >= bootLines.length) {
          window.clearInterval(lineTimer);
          window.setTimeout(() => {
            setBootComplete(true);
          }, 220);
          return current;
        }

        return current + 1;
      });
    }, 120);
  };

  const openHref = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleModuleSelect = (moduleId: ModuleId) => {
    setActiveModule(moduleId);
    if (moduleId !== "work") {
      setExpandedProject(null);
    }
  };

  const handleProjectToggle = (projectName: string) => {
    setExpandedProject((current) => (current === projectName ? null : projectName));
  };

  const getNowSnapshot = (full = false) => {
    const now = new Date();
    const locale = navigator.language || "en-US";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const lines = [
      `time   -> ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium" }).format(now)}`,
      `zone   -> ${timeZone}`,
      `offset -> ${formatUtcOffset(now)}`
    ];

    if (!full) {
      return lines;
    }

    return [
      ...lines,
      `locale -> ${locale}`,
      `day    -> ${getDayOfYear(now)} / week ${getWeekNumber(now)}`
    ];
  };

  const getLocationSnapshot = async () => {
    const locale = navigator.language || "en-US";
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    if (!("geolocation" in navigator)) {
      return [
        "where  -> unavailable",
        `zone   -> ${timeZone}`,
        `locale -> ${locale}`
      ];
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: 300000
        });
      });

      return [
        `where  -> ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        `zone   -> ${timeZone}`,
        `locale -> ${locale}`
      ];
    } catch {
      return [
        "where  -> permission_denied_or_unavailable",
        `zone   -> ${timeZone}`,
        `locale -> ${locale}`
      ];
    }
  };

  const handleAutocomplete = () => {
    const current = commandValue.trim().toLowerCase();
    if (!current) {
      return;
    }

    const matches = commandCatalog.filter((command) => command.startsWith(current));
    if (!matches.length) {
      return;
    }

    if (matches.length === 1) {
      setCommandValue(matches[0]);
      return;
    }

    const sharedPrefix = getSharedPrefix(matches);
    if (sharedPrefix.length > current.length) {
      setCommandValue(sharedPrefix);
    }

    setOutput({
      heading: "matches:",
      lines: matches.slice(0, 6)
    });
  };

  const executeCommand = async (rawValue: string) => {
    if (!bootComplete) {
      return;
    }

    const normalized = rawValue.trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized) {
      return;
    }

    const normalizedCommand = aliasMap[normalized] ?? normalized;
    const [command, ...rest] = normalizedCommand.split(" ");
    const argument = rest.join(" ");
    const linkMatch = profileContent.links.find((link) => link.label === normalizedCommand || link.label === argument);
    const projectMatch = profileContent.projects.find(
      (project) => project.name.toLowerCase() === normalizedCommand || project.name.toLowerCase() === argument
    );

    if (normalizedCommand === "help" || normalizedCommand === "?") {
      setOutput({
        heading: "available commands:",
        lines: [
          "help core     // home work about resume",
          "help links    // blog portfolio github + socials",
          "help projects // work index commands",
          "help system   // status date today whereami reset"
        ]
      });
      return;
    }

    if (normalizedCommand === "help core") {
      setOutput({ heading: "core commands:", rows: [...helpGroups.core] });
      return;
    }

    if (normalizedCommand === "help links") {
      setOutput({ heading: "link commands:", rows: [...helpGroups.links] });
      return;
    }

    if (normalizedCommand === "help projects") {
      setOutput({ heading: "project commands:", rows: [...helpGroups.projects] });
      return;
    }

    if (normalizedCommand === "help system") {
      setOutput({ heading: "system commands:", rows: [...helpGroups.system] });
      return;
    }

    if (normalizedCommand === "clear") {
      setOutput(null);
      return;
    }

    if (normalizedCommand === "reset") {
      restartBootSequence();
      return;
    }

    if (normalizedCommand === "home" || normalizedCommand === "work" || normalizedCommand === "about" || normalizedCommand === "resume") {
      handleModuleSelect(normalizedCommand);
      setOutput({ lines: [`switching module -> ${normalizedCommand}`] });
      return;
    }

    if (normalizedCommand === "pwd") {
      setOutput({ lines: ["/nimdal"] });
      return;
    }

    if (normalizedCommand === "uname") {
      setOutput({ lines: ["NIMDAL_OS v1.0.0 / tty0 / nimdal.xyz"] });
      return;
    }

    if (normalizedCommand === "whoami") {
      handleModuleSelect("home");
      setOutput({ lines: ["rendering whoami -> module home"] });
      return;
    }

    if (normalizedCommand === "status") {
      setOutput({
        lines: [
          "role   -> growth_marketer",
          "mode   -> building_in_public",
          "focus  -> gtm / ai automation / crypto-native loops",
          `uptime -> ${uptime}`
        ]
      });
      return;
    }

    if (normalizedCommand === "contact") {
      setOutput({
        heading: "contact endpoints:",
        rows: profileContent.links.map((link) => ({
          key: link.label,
          description: `// ${link.displayText}`
        }))
      });
      return;
    }

    if (normalizedCommand === "stack") {
      setOutput({
        lines: [
          "web2_marketing",
          "web3_marketer",
          "ai_workflows",
          "automation / fake_dev"
        ]
      });
      return;
    }

    if (normalizedCommand === "date") {
      setOutput({ lines: getNowSnapshot(false) });
      return;
    }

    if (normalizedCommand === "today") {
      const locationLines = await getLocationSnapshot();
      setOutput({ lines: [...getNowSnapshot(false), locationLines[0]] });
      return;
    }

    if (normalizedCommand === "today --full") {
      const locationLines = await getLocationSnapshot();
      setOutput({ lines: [...getNowSnapshot(true), locationLines[0]] });
      return;
    }

    if (normalizedCommand === "timezone") {
      setOutput({
        lines: [
          `zone   -> ${Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}`,
          `offset -> ${formatUtcOffset(new Date())}`
        ]
      });
      return;
    }

    if (normalizedCommand === "whereami") {
      setOutput({ lines: await getLocationSnapshot() });
      return;
    }

    if (normalizedCommand === "ls" || normalizedCommand === "ls projects" || normalizedCommand === "ls /projects" || normalizedCommand === "ls /projects/") {
      setOutput({
        heading: "projects:",
        rows: profileContent.projects.map((project) => ({
          key: project.name,
          description: `// ${project.type}`
        }))
      });
      return;
    }

    if (normalizedCommand === "ls links" || normalizedCommand === "ls ~/links") {
      setOutput({
        heading: "links:",
        rows: profileContent.links.map((link) => ({
          key: link.label,
          description: `// ${link.displayText}`
        }))
      });
      return;
    }

    if (normalizedCommand === "cat status.txt") {
      setOutput({
        lines: [
          "role -> growth_marketer",
          "mode -> building_in_public",
          "focus -> gtm / ai automation / crypto-native loops",
          "mail -> 0xnimdal@gmail.com"
        ]
      });
      return;
    }

    if (normalizedCommand === "cat about.md") {
      handleModuleSelect("about");
      setOutput({ lines: ["rendering about.md -> module about"] });
      return;
    }

    if (normalizedCommand === "cat resume.txt") {
      handleModuleSelect("resume");
      setOutput({ lines: ["rendering resume.txt -> module resume"] });
      return;
    }

    if (normalizedCommand === "email") {
      try {
        await navigator.clipboard.writeText("0xnimdal@gmail.com");
        setOutput({ lines: ["email copied -> 0xnimdal@gmail.com"] });
      } catch {
        setOutput({ lines: ["copy failed -> 0xnimdal@gmail.com"] });
      }
      return;
    }

    if ((command === "open" && linkMatch) || (command !== "open" && linkMatch && normalizedCommand === linkMatch.label)) {
      openHref(linkMatch.href);
      setOutput({ lines: [`opening endpoint -> ${linkMatch.displayText}`] });
      return;
    }

    if ((command === "open" && projectMatch) || (command !== "open" && projectMatch && normalizedCommand === projectMatch.name.toLowerCase())) {
      setActiveModule("work");
      setExpandedProject(projectMatch.name);
      if (command === "open" && projectMatch.href) {
        openHref(projectMatch.href);
        setOutput({ lines: [`opening project -> ${projectMatch.name}`] });
      } else {
        setOutput({ lines: [`expanded file -> ${projectMatch.name}`, "use [OPEN] to launch the public endpoint"] });
      }
      return;
    }

    setOutput({
      lines: [`command not found -> ${normalizedCommand}`, "type 'help' to inspect available commands"]
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitted = commandValue.trim();
    if (!submitted) {
      return;
    }

    setCommandHistory((current) => [...current, submitted]);
    setHistoryIndex(null);
    await executeCommand(submitted);
    setCommandValue("");
  };

  const handleCommandKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!bootComplete) {
      return;
    }

    if (event.key === "ArrowUp") {
      if (!commandHistory.length) {
        return;
      }

      event.preventDefault();
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(nextIndex);
      setCommandValue(commandHistory[nextIndex]);
      return;
    }

    if (event.key === "ArrowDown") {
      if (!commandHistory.length || historyIndex === null) {
        return;
      }

      event.preventDefault();
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(null);
        setCommandValue("");
        return;
      }

      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setCommandValue(commandHistory[nextIndex]);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      handleAutocomplete();
    }
  };

  return (
    <section className="terminal-screen">
      <header className="runtime-strip" aria-label="System runtime information">
        <div className="runtime-grid">
          {runtimeInfo.map((item) => (
            <div key={item.label} className="runtime-row">
              <span className="runtime-label">{item.label}</span>
              <span className={`runtime-value${item.tone ? ` is-${item.tone}` : ""}`}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="runtime-grid runtime-grid-right">
          {runtimeInfoRight.map((item) => (
            <div key={item.label} className="runtime-row runtime-row-right">
              <span className="runtime-label">{item.label}</span>
              <span className={`runtime-value${item.tone ? ` is-${item.tone}` : ""}`}>
                {item.label === "UPTIME" ? uptime : item.value}
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="terminal-body">
        {!bootComplete ? (
          <section className="terminal-block boot-sequence" aria-label="System boot sequence">
            {bootLines.slice(0, bootLineCount).map((line, index) => (
              <p key={`${line.prefix ?? "boot"}-${index}`} className="boot-line">
                {line.prefix ? <span className="boot-prefix">{line.prefix}</span> : null}
                {line.target ? <span className="boot-target">{line.target}</span> : null}
                {line.status ? (
                  <span className={`boot-status${line.tone ? ` is-${line.tone}` : ""}`}>{line.status}</span>
                ) : null}
                {line.suffix ? <span className="boot-suffix">{line.suffix}</span> : null}
              </p>
            ))}
          </section>
        ) : null}

        {bootComplete && activeModule === "home" ? (
          <section id="home" className="terminal-block">
            <div className="ascii-logo" aria-label="ASCII logo">
              <pre className="ascii-name ascii-name-shadow" aria-hidden="true">
                {asciiLogo}
              </pre>
              <pre className="ascii-name ascii-name-face">{asciiLogo}</pre>
            </div>

            <p className="prompt-line">$ whoami</p>
            <pre className="terminal-manifest">{whoamiLines}</pre>

            <a className="signal-badge" href="https://blog.nimdal.xyz" target="_blank" rel="noreferrer">
              <span className="signal-dot" aria-hidden="true">
                *
              </span>
              BLOG IS LIVE -- OPEN LOG
            </a>

            <div className="tip-row">
              <span>TIP:</span>
              <span>Try `help system`, `today`, `whereami`, `ls projects`, or `reset`.</span>
            </div>
          </section>
        ) : null}

        {bootComplete && activeModule === "work" ? (
          <section id="work" className="terminal-block">
            <p className="prompt-line">$ ls -la /projects/</p>
            <p className="helper-copy">
              {profileContent.projects.length} entries -- click filename to expand -- click [OPEN] to read the public endpoint
            </p>

            <div className="project-table" role="table" aria-label="Project list">
              <div className="project-head" role="row">
                <span role="columnheader">NAME</span>
                <span role="columnheader">TYPE</span>
                <span role="columnheader">MODIFIED</span>
                <span role="columnheader">DESCRIPTION</span>
              </div>

              {profileContent.projects.map((project) => {
                const isExpanded = expandedProject === project.name;

                return (
                  <div key={project.name} className="project-entry">
                    <div className="project-row" role="row">
                      <button
                        type="button"
                        className="project-name-trigger"
                        onClick={() => handleProjectToggle(project.name)}
                        aria-expanded={isExpanded}
                      >
                        {project.name}
                      </button>
                      <span role="cell">{project.type}</span>
                      <span role="cell">{project.modified}</span>
                      <span className="project-description" role="cell">
                        {project.description}
                      </span>
                    </div>

                    {isExpanded ? (
                      <div className="project-meta" role="row">
                        <p className="project-meta-copy">{project.description}</p>
                        {project.href ? (
                          <a href={project.href} className="open-button" target="_blank" rel="noreferrer">
                            OPEN
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {bootComplete && activeModule === "about" ? (
          <section id="about" className="terminal-block">
            <p className="prompt-line">$ cat about.md</p>
            <div className="scroll-panel">
              <pre className="terminal-manifest">{profileContent.aboutParagraphs.join("\n")}</pre>
            </div>
          </section>
        ) : null}

        {bootComplete && activeModule === "resume" ? (
          <section id="resume" className="terminal-block">
            <p className="prompt-line">$ cat resume.txt</p>
            <div className="resume-shell scroll-panel">
              {profileContent.resumeSections.map((section) => (
                <div key={section.title} className="resume-section">
                  <p className="resume-title">// {section.title.toLowerCase()}</p>
                  <div className="resume-lines">
                    {section.lines.map((line) => (
                      <p key={line} className="resume-line">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <footer className="terminal-footer">
        <form className="command-row" onSubmit={handleSubmit}>
          <span className="command-prompt">nimdal.xyz:~$</span>
          <input
            id="cmd-input"
            className="command-input"
            value={commandValue}
            onChange={(event) => setCommandValue(event.target.value)}
            onKeyDown={handleCommandKeyDown}
            placeholder="type a command (try: help)"
            aria-label="Command input"
            autoComplete="off"
            spellCheck={false}
            disabled={!bootComplete}
          />
        </form>

        {commandOutput ? (
          <div className="command-output" aria-live="polite">
            {commandOutput.heading ? <p className="command-output-heading">{commandOutput.heading}</p> : null}
            {commandOutput.rows ? (
              <div className="command-list">
                {commandOutput.rows.map((row) => (
                  <div key={row.key} className="command-list-row">
                    <span className="command-list-key">{row.key}</span>
                    <span className="command-list-desc">{row.description}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {commandOutput.lines ? (
              <div className="command-lines">
                {commandOutput.lines.map((line) => (
                  <p key={line} className="command-line">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="module-row">
          <span className="module-prefix">root@nimdal/nav &gt; SELECT MODULE [up/down + enter or click]</span>
          <nav className="module-nav" aria-label="Bottom module navigation">
            {moduleLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`module-link${activeModule === item.id ? " is-active" : ""}`}
                onClick={() => handleModuleSelect(item.id)}
                disabled={!bootComplete}
              >
                {activeModule === item.id ? `> ${item.label}` : item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="module-controls">
          <button type="button" className="control-link" onClick={() => moveModule(-1)} disabled={!bootComplete}>
            prev
          </button>
          <button type="button" className="control-link" onClick={() => moveModule(1)} disabled={!bootComplete}>
            next
          </button>
        </div>
      </footer>
    </section>
  );
}
