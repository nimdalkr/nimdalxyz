import { TerminalShell } from "@/components/terminal-shell";
import IntroContent from "@/content/intro.mdx";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="page-glow page-glow-left" aria-hidden="true" />
      <div className="page-glow page-glow-right" aria-hidden="true" />
      <TerminalShell intro={<IntroContent />} />
    </main>
  );
}
