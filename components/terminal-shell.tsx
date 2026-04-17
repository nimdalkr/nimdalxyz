"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { profileContent } from "@/data/profile";

type TerminalShellProps = {
  intro: ReactNode;
};

const moduleLinks = [
  { id: "home", label: "01._HOME" },
  { id: "work", label: "02._WORK" },
  { id: "about", label: "03._ABOUT" },
  { id: "resume", label: "04._RESUME" }
] as const;

type ModuleId = (typeof moduleLinks)[number]["id"];

const BOOTED_AT = new Date("2020-05-16T00:00:00+09:00").getTime();

function formatUptime(now: number) {
  const elapsedMs = Math.max(0, now - BOOTED_AT);
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

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

const summaryLines = [
  "Growth marketer and GTM operator working from Seoul.",
  "10+ years spanning startup building, marketing operations, localization, KOL, and Web3 onboarding.",
  "Currently building AI-assisted workflows and product-shaped growth systems."
];

const focusRows = [
  { key: "LOCATION", value: "SEOUL -- KOREA" },
  { key: "FOCUS", value: "Growth / GTM / AI Workflow Build" },
  { key: "CONTACT", value: "0xnimdal@gmail.com" }
];

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
  ]
} as const;

export function TerminalShell({ intro }: TerminalShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>("home");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [commandValue, setCommandValue] = useState("");
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(null);
  const [uptime, setUptime] = useState(() => formatUptime(Date.now()));
  const [bootLineCount, setBootLineCount] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);

  const activeIndex = moduleLinks.findIndex((moduleLink) => moduleLink.id === activeModule);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime(formatUptime(Date.now()));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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

  const executeCommand = async (rawValue: string) => {
    if (!bootComplete) {
      return;
    }

    const normalized = rawValue.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    const linkMatch = profileContent.links.find((link) => link.label === normalized);
    const projectMatch = profileContent.projects.find((project) => project.name.toLowerCase() === normalized);

    if (normalized === "help" || normalized === "?") {
      setOutput({
        heading: "available commands:",
        lines: [
          "help core      // home work about resume",
          "help links     // blog portfolio github linkedin x telegram channel email",
          "help projects  // nimdalcraft mylol daltacks ethosalpha nomorenaver",
          "clear          // clear response"
        ]
      });
      return;
    }

    if (normalized === "help core") {
      setOutput({
        heading: "core commands:",
        rows: [...helpGroups.core]
      });
      return;
    }

    if (normalized === "help links") {
      setOutput({
        heading: "link commands:",
        rows: [...helpGroups.links]
      });
      return;
    }

    if (normalized === "help projects") {
      setOutput({
        heading: "project commands:",
        rows: [...helpGroups.projects]
      });
      return;
    }

    if (normalized === "clear") {
      setOutput(null);
      return;
    }

    if (normalized === "home" || normalized === "work" || normalized === "about" || normalized === "resume") {
      handleModuleSelect(normalized);
      setOutput({
        lines: [`switching module -> ${normalized}`]
      });
      return;
    }

    if (normalized === "email") {
      try {
        await navigator.clipboard.writeText("0xnimdal@gmail.com");
        setOutput({
          lines: ["email copied -> 0xnimdal@gmail.com"]
        });
      } catch {
        setOutput({
          lines: ["copy failed -> 0xnimdal@gmail.com"]
        });
      }
      return;
    }

    if (linkMatch) {
      openHref(linkMatch.href);
      setOutput({
        lines: [`opening endpoint -> ${linkMatch.displayText}`]
      });
      return;
    }

    if (projectMatch) {
      setActiveModule("work");
      setExpandedProject(projectMatch.name);
      setOutput({
        lines: [`expanded file -> ${projectMatch.name}`, "use [OPEN] to launch the public endpoint"]
      });
      return;
    }

    setOutput({
      lines: [`command not found -> ${normalized}`, "type 'help' to inspect available commands"]
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await executeCommand(commandValue);
    setCommandValue("");
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
              <p key={`${line.prefix}-${index}`} className="boot-line">
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

        {bootComplete && activeModule === "home" && (
          <section id="home" className="terminal-block">
            <div className="ascii-logo" aria-label="ASCII logo">
              <pre className="ascii-name ascii-name-shadow" aria-hidden="true">
                {asciiLogo}
              </pre>
              <pre className="ascii-name ascii-name-face">{asciiLogo}</pre>
            </div>

            <p className="prompt-line">$ whoami</p>
            <div className="terminal-copy">
              {summaryLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <p className="prompt-line">$ cat status.txt</p>
            <div className="status-table" role="table" aria-label="Profile status table">
              {focusRows.map((row) => (
                <div key={row.key} className="status-row" role="row">
                  <span className="status-key" role="cell">
                    {row.key}
                  </span>
                  <span className="status-value" role="cell">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <a
              className="signal-badge"
              href="https://blog.nimdal.xyz"
              target="_blank"
              rel="noreferrer"
            >
              <span className="signal-dot" aria-hidden="true">
                ●
              </span>
              BLOG IS LIVE -- OPEN LOG
            </a>

            <div className="tip-row">
              <span>TIP:</span>
              <span>Type `work`, `about`, `resume`, or `help`.</span>
            </div>
          </section>
        )}

        {bootComplete && activeModule === "work" && (
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
                          <a
                            href={project.href}
                            className="open-button"
                            target="_blank"
                            rel="noreferrer"
                          >
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
        )}

        {bootComplete && activeModule === "about" && (
          <section id="about" className="terminal-block">
            <p className="prompt-line">$ cat about.md</p>
            <div className="terminal-copy rich-copy">
              {profileContent.aboutParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="about-signoff">0xnimdal@gmail.com</p>
            </div>
          </section>
        )}

        {bootComplete && activeModule === "resume" && (
          <section id="resume" className="terminal-block">
            <p className="prompt-line">$ cat resume.txt</p>
            <div className="resume-shell">
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
        )}
      </div>

      <footer className="terminal-footer">
        <form className="command-row" onSubmit={handleSubmit}>
          <span className="command-prompt">nimdal.xyz:~$</span>
          <input
            id="cmd-input"
            className="command-input"
            value={commandValue}
            onChange={(event) => setCommandValue(event.target.value)}
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
