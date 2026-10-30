import Link from "next/link";

const LOGO =
  "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/690bc1a96917d2dcb3a5be7a.png";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="RE/MAX Peaks" />
        <p>
          Each office independently owned and operated. Equal Housing
          Opportunity.
        </p>
      </div>
      <div className="footer-links">
        <Link href="https://www.remaxpeaks.com/">RE/MAX Peaks</Link>
        <Link href="https://www.remaxpeaks.com/agent-list/">Our Team</Link>
        <Link href="https://www.remaxpeaks.com/search/">Property Search</Link>
        <Link href="https://www.remaxpeaks.com/privacy-policy/">
          Privacy Policy
        </Link>
      </div>
      <p className="credit">
        © {new Date().getFullYear()} RE/MAX Peaks. All rights reserved.
      </p>
    </footer>
  );
}
