import Image from "next/image";
import type { ReactNode } from "react";

import { profileContent } from "@/data/profile";

type TerminalShellProps = {
  intro: ReactNode;
};

const systemNav = [
  { id: "identity", label: "identity", code: "01" },
  { id: "briefing", label: "briefing", code: "02" },
  { id: "network", label: "network", code: "03" },
  { id: "console", label: "console", code: "04" }
];

const focusItems = [
  "Growth strategy and GTM execution",
  "Web2 / Web3 localization and onboarding",
  "Community operations and KOL coordination",
  "AI-assisted MVP and workflow build"
];

const systemSignals = [
  { label: "base", value: "Seoul, Korea" },
  { label: "mode", value: "Operator / Builder" },
  { label: "reach", value: "10+ years" }
];

const commandHistory = [
  "$ boot --profile nimdal",
  "$ sync --channels portfolio blog github x telegram",
  "$ deploy --focus growth community ai-workflows"
];

export function TerminalShell({ intro }: TerminalShellProps) {
  return (
    <section className="system-shell">
      <header className="system-header">
        <div className="system-branding">
          <p className="system-kicker">ZUI.C // SYS.PORTFOLIO</p>
          <h1 className="system-heading">NIMDAL PORTFOLIO SYSTEM</h1>
        </div>
        <div className="system-statusbar" aria-label="System status">
          <span className="status-chip">active</span>
          <span className="status-chip">public routes 08</span>
          <span className="status-chip">tz asia/seoul</span>
        </div>
      </header>

      <div className="system-layout">
        <aside className="system-sidebar">
          <div className="sidebar-block">
            <p className="sidebar-label">nav.index</p>
            <nav className="system-nav" aria-label="Section navigation">
              {systemNav.map((item) => (
                <a key={item.id} className="nav-link" href={`#${item.id}`}>
                  <span className="nav-code">{item.code}</span>
                  <span className="nav-text">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          <div className="sidebar-block sidebar-terminal">
            <p className="sidebar-label">session.signal</p>
            <div className="signal-list">
              {systemSignals.map((signal) => (
                <div key={signal.label} className="signal-row">
                  <span className="signal-key">{signal.label}</span>
                  <span className="signal-value">{signal.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="system-main">
          <section id="identity" className="panel panel-hero">
            <div className="panel-toolbar">
              <span className="toolbar-dot" />
              <span className="toolbar-dot" />
              <span className="toolbar-dot" />
              <p className="panel-path">/sys/identity</p>
            </div>

            <div className="hero-grid">
              <div className="hero-avatar">
                {profileContent.avatarSrc ? (
                  <Image
                    src={profileContent.avatarSrc}
                    alt={`${profileContent.nameEn} profile photo`}
                    className="avatar-image"
                    width={132}
                    height={132}
                    priority
                  />
                ) : (
                  <span aria-hidden="true">{profileContent.avatarFallback}</span>
                )}
              </div>

              <div className="hero-copy">
                <p className="hero-command">$ whoami --full</p>
                <p className="ascii-name">[{profileContent.nameEn}] // {profileContent.nameKo}</p>
                <p className="hero-role">{profileContent.role}</p>
                <p className="hero-location">{profileContent.location}</p>
              </div>

              <div className="hero-metrics">
                <div className="metric-card">
                  <span className="metric-label">status</span>
                  <strong className="metric-value">online</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-label">focus</span>
                  <strong className="metric-value">GTM</strong>
                </div>
                <div className="metric-card">
                  <span className="metric-label">surface</span>
                  <strong className="metric-value">portfolio</strong>
                </div>
              </div>
            </div>
          </section>

          <section id="briefing" className="panel panel-briefing">
            <div className="panel-heading-row">
              <div>
                <p className="panel-label">{profileContent.introCommand}</p>
                <h2 className="panel-title">Operator briefing</h2>
              </div>
              <span className="panel-badge">read-only</span>
            </div>

            <div className="briefing-grid">
              <div className="briefing-copy">{intro}</div>
              <div className="briefing-stack">
                <p className="stack-label">active.modules</p>
                <ul className="focus-list">
                  {focusItems.map((item) => (
                    <li key={item} className="focus-item">
                      <span className="focus-bullet" aria-hidden="true">
                        +
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="network" className="panel panel-network">
            <div className="panel-heading-row">
              <div>
                <p className="panel-label">{profileContent.linksCommand}</p>
                <h2 className="panel-title">Network registry</h2>
              </div>
              <span className="panel-badge">8 endpoints</span>
            </div>

            <div className="link-registry" role="table" aria-label="Profile links">
              <div className="registry-head" role="row">
                <span role="columnheader">node</span>
                <span role="columnheader">address</span>
                <span role="columnheader">access</span>
              </div>
              {profileContent.links.map((link) => (
                <div key={link.id} className="registry-row" role="row">
                  <span className="registry-key" role="cell">
                    {link.label}
                  </span>
                  <a
                    href={link.href}
                    className="registry-link"
                    role="cell"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                  >
                    {link.displayText}
                  </a>
                  <span className="registry-state" role="cell">
                    open
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section id="console" className="panel panel-console">
            <div className="panel-heading-row">
              <div>
                <p className="panel-label">cmd://dispatch</p>
                <h2 className="panel-title">Execution console</h2>
              </div>
              <span className="panel-badge">simulated</span>
            </div>

            <div className="console-shell" aria-label="Command history">
              {commandHistory.map((line) => (
                <p key={line} className="console-line">
                  {line}
                </p>
              ))}
              <label className="console-input-row">
                <span className="console-prompt" aria-hidden="true">
                  &gt;
                </span>
                <input
                  id="cmd-input"
                  className="console-input"
                  defaultValue="open profile --target public"
                  aria-label="Command input preview"
                  readOnly
                />
              </label>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
