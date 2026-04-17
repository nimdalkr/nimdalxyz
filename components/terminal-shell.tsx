import Image from "next/image";
import type { ReactNode } from "react";

import { profileContent } from "@/data/profile";

type TerminalShellProps = {
  intro: ReactNode;
};

const moduleLinks = [
  { id: "home", label: "01._HOME" },
  { id: "status", label: "02._STATUS" },
  { id: "links", label: "03._LINKS" },
  { id: "contact", label: "04._CONTACT" }
];

const runtimeInfo = [
  { label: "SYS.NAME", value: "NMDL_OS v1.0.0" },
  { label: "SYS.AUTH", value: "GUEST_ACCESS_GRANTED", accent: true },
  { label: "SYS.NODE", value: "nimdal.ooo" }
];

const runtimeMeta = [
  { label: "UPTIME", value: "2163d 17:15" },
  { label: "TERMINAL", value: "TTY0" },
  { label: "STATUS", value: "200", accent: true }
];

const focusRows = [
  { key: "LOCATION", value: "SEOUL -- KOREA" },
  { key: "FOCUS", value: "Growth / GTM / Community / AI Workflow Build" },
  { key: "CONTACT", value: "0xnimdal@gmail.com" }
];

const summaryLines = [
  "Growth marketer, GTM operator, and community builder working from Seoul.",
  "10+ years spanning startup building, marketing operations, localization, KOL, and Web3 onboarding.",
  "Currently building AI-assisted workflows and product-shaped growth systems."
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
        </section>

        <section id="status" className="terminal-block">
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
        </section>

        <section id="links" className="terminal-block">
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
            <span>Use the modules below or open one of the public endpoints.</span>
          </div>

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

        <section id="contact" className="terminal-block terminal-copy-block">
          <p className="prompt-line">$ cat /etc/nimdal</p>
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
            {moduleLinks.map((item, index) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`module-link${index === 0 ? " is-active" : ""}`}
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
