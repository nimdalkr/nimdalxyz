import { TerminalShell } from "@/components/terminal-shell";
import IntroContent from "@/content/intro.mdx";

const SERVER_BOOTED_AT = new Date("2026-04-14T01:00:00+09:00").getTime();

export default function Home() {
  return (
    <main className="page-shell">
      <div className="page-glow page-glow-left" aria-hidden="true" />
      <div className="page-glow page-glow-right" aria-hidden="true" />
      <TerminalShell intro={<IntroContent />} bootedAt={SERVER_BOOTED_AT} />
    </main>
  );
}
