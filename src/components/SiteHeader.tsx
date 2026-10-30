import Link from "next/link";

const LOGO =
  "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/690bc1a96917d2dcb3a5be7a.png";

export function SiteHeader({ agentName }: { agentName?: string }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <nav className="header-nav hide-mobile" aria-label="Primary left">
          <Link href="https://www.remaxpeaks.com/">Home</Link>
          <Link href="https://www.remaxpeaks.com/agent-list/">Our Team</Link>
          <Link href="https://www.remaxpeaks.com/search/">Search</Link>
        </nav>
        <Link
          className="header-logo"
          href="https://www.remaxpeaks.com/"
          aria-label="RE/MAX Peaks home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="RE/MAX Peaks" />
        </Link>
        <nav className="header-nav header-nav-right" aria-label="Primary right">
          {agentName ? (
            <span className="agent-chip hide-mobile">{agentName}</span>
          ) : null}
          <Link className="btn btn-red" href="#contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
