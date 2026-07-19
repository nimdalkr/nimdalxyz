import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page" id="main-content">
      <p className="section-kicker">404 / LOST SIGNAL</p>
      <h1>Nothing surfaced here.</h1>
      <p>The route may have moved deeper into the archive.</p>
      <Link className="text-link" href="/ko">Return to Nimdal</Link>
    </main>
  );
}
