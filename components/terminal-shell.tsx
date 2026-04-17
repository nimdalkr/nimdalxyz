"use client";

import Image from "next/image";
import { useState } from "react";
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

type CommandOutput = {
  heading?: string;
  rows?: Array<{ key: string; description: string }>;
  lines?: string[];
};

const runtimeInfo = [
  { label: "SYS.NAME", value: "NMDL_OS v1.0.0" },
  { label: "SYS.AUTH", value: "GUEST_ACCESS_GRANTED", accent: true },
  { label: "SYS.NODE", value: "nimdal.ooo" }
];

const runtimeMeta = [
  { label: "UPTIME", value: "2163d 17:22" },
  { label: "TERMINAL", value: "TTY0" },
  { label: "STATUS", value: "200", accent: true }
];

const summaryLines = [
  "Growth marketer, GTM operator, and community builder working from Seoul.",
  "10+ years spanning startup building, marketing operations, localization, KOL, and Web3 onboarding.",
  "Currently building AI-assisted workflows and product-shaped growth systems."
];

const focusRows = [
  { key: "LOCATION", value: "SEOUL -- KOREA" },
  { key: "FOCUS", value: "Growth / GTM / Community / AI Workflow Build" },
  { key: "CONTACT", value: "0xnimdal@gmail.com" }
];

const availableCommands = [
  { key: "help", description: "// show available commands" },
  { key: "home", description: "// go home" },
  { key: "work", description: "// project list" },
  { key: "about", description: "// about page" },
  { key: "resume", description: "// resume page" },
  { key: "portfolio", description: "// open portfolio" },
  { key: "blog", description: "// open blog" },
  { key: "github", description: "// open github" },
  { key: "linkedin", description: "// open linkedin" },
  { key: "x", description: "// open x" },
  { key: "telegram", description: "// open telegram" },
  { key: "channel", description: "// open channel" },
  { key: "email", description: "// copy email" },
  { key: "nimdalcraft", description: "// project file 01" },
  { key: "octascout", description: "// project file 02" },
  { key: "mylol", description: "// project file 03" },
  { key: "daltacks", description: "// project file 04" },
  { key: "ethosalpha", description: "// project file 05" },
  { key: "clear", description: "// clear response" },
  { key: "?", description: "// alias for help" }
];

export function TerminalShell({ intro }: TerminalShellProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>("home");
  const [commandValue, setCommandValue] = useState("");
  const [commandOutput, setCommandOutput] = useState<CommandOutput | null>(null);

  const activeIndex = moduleLinks.findIndex((moduleLink) => moduleLink.id === activeModule);

  const moveModule = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + moduleLinks.length) % moduleLinks.length;
    setActiveModule(moduleLinks[nextIndex].id);
  };

  const setOutput = (output: CommandOutput | null) => {
    setCommandOutput(output);
  };

  const openHref = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const executeCommand = async (rawValue: string) => {
    const normalized = rawValue.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    const linkMatch = profileContent.links.find((link) => link.label === normalized);
    const projectMatch = profileContent.projects.find((project) => project.name.toLowerCase() === normalized);

    if (normalized === "help" || normalized === "?") {
      setOutput({
        heading: "available commands:",
        rows: availableCommands
      });
      return;
    }

    if (normalized === "clear") {
      setOutput(null);
      return;
    }

    if (normalized === "home" || normalized === "work" || normalized === "about" || normalized === "resume") {
      setActiveModule(normalized);
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

    if (projectMatch?.href) {
      setActiveModule("work");
      openHref(projectMatch.href);
      setOutput({
        lines: [`opening project -> ${projectMatch.name}`]
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
              <span className={`runtime-value${item.accent ? " is-accent" : ""}`}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="runtime-grid runtime-grid-right">
          {runtimeMeta.map((item) => (
            <div key={item.label} className="runtime-row runtime-row-right">
              <span className="runtime-label">{item.label}</span>
              <span className={`runtime-value${item.accent ? " is-accent" : ""}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="terminal-body">
        {activeModule === "home" && (
          <section id="home" className="terminal-block">
            <pre className="ascii-name" aria-label="ASCII logo">
{` _   _ ___ __  __ ____    _    _
| \\ | |_ _|  \\/  |  _ \\  / \\  | |
|  \\| || || |\\/| | | | |/ _ \\ | |
| |\\  || || |  | | |_| / ___ \\| |___
|_| \\_|___|_|  |_|____/_/   \\_\\_____|`}
            </pre>

            <p className="prompt-line">$ whoami</p>

            <div className="identity-shell">
              <div className="identity-photo">
                {profileContent.avatarSrc ? (
                  <Image
                    src={profileContent.avatarSrc}
                    alt={`${profileContent.nameEn} profile photo`}
                    className="avatar-image"
                    width={54}
                    height={54}
                    priority
                  />
                ) : (
                  <span aria-hidden="true">{profileContent.avatarFallback}</span>
                )}
              </div>

              <div className="identity-copy">
                {summaryLines.map((line) => (
                  <p key={line} className="terminal-copy">
                    {line}
                  </p>
                ))}
              </div>
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
              <span className="signal-dot" aria-hidden="true" />
              BLOG IS LIVE -- OPEN LOG
            </a>

            <div className="tip-row">
              <span>TIP:</span>
              <span>Use the command line or the module bar below to inspect work, about, and resume output.</span>
            </div>
          </section>
        )}

        {activeModule === "work" && (
          <section id="work" className="terminal-block">
            <p className="prompt-line">$ ls -la /projects/</p>
            <p className="helper-copy">
              {profileContent.projects.length} entries -- click filename to open the related public endpoint
            </p>

            <div className="project-table" role="table" aria-label="Project list">
              <div className="project-head" role="row">
                <span role="columnheader">NAME</span>
                <span role="columnheader">SIZE</span>
                <span role="columnheader">MODIFIED</span>
                <span role="columnheader">DESCRIPTION</span>
              </div>
              {profileContent.projects.map((project) => (
                <div key={project.name} className="project-row" role="row">
                  {project.href ? (
                    <a
                      href={project.href}
                      className="project-name project-name-link"
                      target="_blank"
                      rel="noreferrer"
                      role="cell"
                    >
                      {project.name}
                    </a>
                  ) : (
                    <span className="project-name" role="cell">
                      {project.name}
                    </span>
                  )}
                  <span role="cell">{project.size}</span>
                  <span role="cell">{project.modified}</span>
                  <span className="project-description" role="cell">
                    {project.description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeModule === "about" && (
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

        {activeModule === "resume" && (
          <section id="resume" className="terminal-block">
            <p className="prompt-line">$ cat resume.txt</p>
            <div className="resume-shell">
              {profileContent.resumeSections.map((section) => (
                <div key={section.title} className="resume-section">
                  <p className="resume-title">// {section.title}</p>
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
          />
        </form>

        {commandOutput && (
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
        )}

        <div className="module-row">
          <span className="module-prefix">root@zui/nav &gt; SELECT MODULE [up/down + enter or click]</span>
          <nav className="module-nav" aria-label="Bottom module navigation">
            {moduleLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`module-link${activeModule === item.id ? " is-active" : ""}`}
                onClick={() => setActiveModule(item.id)}
              >
                {activeModule === item.id ? `> ${item.label}` : item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="module-controls">
          <button type="button" className="control-link" onClick={() => moveModule(-1)}>
            prev
          </button>
          <button type="button" className="control-link" onClick={() => moveModule(1)}>
            next
          </button>
        </div>
      </footer>
    </section>
  );
}
