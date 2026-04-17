import Image from "next/image";
import type { ReactNode } from "react";

import { profileContent } from "@/data/profile";

import { ThemeToggle } from "./theme-toggle";

type TerminalShellProps = {
  intro: ReactNode;
};

export function TerminalShell({ intro }: TerminalShellProps) {
  return (
    <section className="terminal-shell terminal-entrance">
      <header className="terminal-header">
        <div className="traffic-lights" aria-hidden="true">
          <span className="traffic-light bg-[#ff5f57]" />
          <span className="traffic-light bg-[#febc2e]" />
          <span className="traffic-light bg-[#28c840]" />
        </div>
        <p className="terminal-title">{profileContent.terminalTitle}</p>
        <ThemeToggle />
      </header>

      <div className="terminal-body">
        <div className="command-block section-delay-1">
          <p className="prompt-line">$ whoami</p>
          <div className="identity-row">
            <div className="avatar-shell">
              {profileContent.avatarSrc ? (
                <Image
                  src={profileContent.avatarSrc}
                  alt={`${profileContent.nameEn} profile photo`}
                  className="avatar-image"
                  width={58}
                  height={58}
                  priority
                />
              ) : (
                <span aria-hidden="true">{profileContent.avatarFallback}</span>
              )}
            </div>
            <div className="identity-copy">
              <div className="identity-name-row">
                <h1 className="identity-name">{profileContent.nameEn}</h1>
                <p className="identity-name-ko">({profileContent.nameKo})</p>
              </div>
              <p className="identity-meta">
                <span>{profileContent.role}</span>
                <span className="meta-dot" aria-hidden="true">
                  &middot;
                </span>
                <span>{profileContent.location}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="command-block section-delay-2">
          <p className="prompt-line">$ {profileContent.introCommand}</p>
          <div className="intro-copy">{intro}</div>
        </div>

        <div className="command-block section-delay-3">
          <p className="prompt-line">$ {profileContent.linksCommand}</p>
          <ul className="link-tree" aria-label="External links">
            {profileContent.links.map((link, index) => {
              const branch = index === profileContent.links.length - 1 ? "`--" : "|--";

              return (
                <li key={link.id} className="tree-row">
                  <span className="tree-branch" aria-hidden="true">
                    {branch}
                  </span>
                  <span className="tree-label">{link.label}</span>
                  <span className="tree-arrow" aria-hidden="true">
                    -&gt;
                  </span>
                  <a
                    href={link.href}
                    className="tree-link"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                  >
                    {link.displayText}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="prompt-footer section-delay-4" aria-hidden="true">
          <span className="prompt-line">$</span>
          <span className="cursor-block" />
        </div>
      </div>

      <footer className="terminal-footer">
        <p>UTF-8</p>
        <p>Asia/Seoul</p>
        <p>terminal portfolio</p>
      </footer>
    </section>
  );
}
