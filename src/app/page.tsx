import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-hub">
      <div>
        <p className="eyebrow" style={{ justifyContent: "center" }}>
          RE/MAX Peaks
        </p>
        <h1>Agent Microsite System</h1>
        <p>
          Phase 1 pilot: Corey Brady&apos;s high-converting agent landing
          experience, connected to RE/MAX Peaks search and lead capture.
        </p>
        <div className="hero-ctas" style={{ justifyContent: "center" }}>
          <Link className="btn btn-red" href="/corey-brady/">
            View Corey&apos;s Pilot
          </Link>
          <a className="btn btn-ghost" href="https://www.remaxpeaks.com/">
            Brokerage Site
          </a>
        </div>
      </div>
    </main>
  );
}
