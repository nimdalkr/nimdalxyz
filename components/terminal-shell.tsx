import Image from "next/image";
import type { ReactNode } from "react";

import { profileContent } from "@/data/profile";

type TerminalShellProps = {
  intro: ReactNode;
};

const moduleLinks = [
  { id: "home", label: "01._HOME" },
  { id: "work", label: "02._WORK" },
  { id: "about", label: "03._ABOUT" },
  { id: "resume", label: "04._RESUME" }
];

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

export function TerminalShell({ intro }: TerminalShellProps) {
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
                  width={70}
                  height={70}
                  priority
                />
              ) : (
                <span aria-hidden="true">{profileContent.avatarFallback}</span>
              )}
            </div>

            <div className="identity-copy">
              <p className="identity-name">
                {profileContent.nameEn} <span className="identity-name-ko">({profileContent.nameKo})</span>
              </p>
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
        </section>

        <section id="work" className="terminal-block">
          <p className="prompt-line">$ ls -la /projects/</p>
          <p className="helper-copy">
            {profileContent.projects.length} entries -- click filename to open the related public endpoint when available
          </p>

          <div className="project-table" role="table" aria-label="Project list">
            <div className="project-head" role="row">
              <span role="columnheader">NAME</span>
              <span role="columnheader">SIZE</span>
              <span role="columnheader">MODIFIED</span>
              <span role="columnheader">DESCRIPTION</span>
            </div>
            {profileContent.projects.map((project) => {
              const mappedLink = profileContent.links.find((link) => link.label === project.name.toLowerCase());

              return (
                <div key={project.name} className="project-row" role="row">
                  {mappedLink ? (
                    <a
                      href={mappedLink.href}
                      className="project-name project-name-link"
                      target={mappedLink.external ? "_blank" : undefined}
                      rel={mappedLink.external ? "noreferrer" : undefined}
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
              );
            })}
          </div>
        </section>

        <section id="about" className="terminal-block">
          <p className="prompt-line">$ cat about.md</p>
          <div className="terminal-copy rich-copy">
            {profileContent.aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="about-signoff">0xnimdal@gmail.com</p>
          </div>
        </section>

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

        <section className="terminal-block">
          <p className="prompt-line">$ ls ~/links</p>
          <div className="link-cloud">
            {profileContent.links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="endpoint-link"
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
              >
                <span className="endpoint-name">{link.label}</span>
                <span className="endpoint-value">{link.displayText}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="terminal-block terminal-copy-block">
          <p className="prompt-line">$ {profileContent.introCommand}</p>
          <div className="terminal-copy rich-copy">{intro}</div>
        </section>
      </div>

      <footer className="terminal-footer">
        <label className="command-row">
          <span className="command-prompt">zui@portfolio:~$</span>
          <input
            id="cmd-input"
            className="command-input"
            defaultValue="type a command (try: help)"
            aria-label="Command input preview"
            readOnly
          />
        </label>

        <div className="module-row">
          <span className="module-prefix">root@zui/nav &gt; SELECT MODULE [up/down + enter or click]</span>
          <nav className="module-nav" aria-label="Bottom module navigation">
            {moduleLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="module-link"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </section>
  );
}
