import type { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { brandName } from "@/lib/brand";
import { publicPath } from "@/lib/public-path";
import type { SessionPayload } from "@/lib/session";

const links = [
  ["Plans", "/plans"],
  ["Opportunities", "/opportunities"],
  ["Completed", "/completed"],
  ["Returns", "/returns"],
  ["Process", "/process"],
  ["Contact", "/contact"],
];

export function SiteHeader({ session }: { session: SessionPayload | null }) {
  return (
    <header className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="shrink-0">
          <img
            src={publicPath("/brand/logo-light.png")}
            alt={`${brandName}, powered by Acadia Homes`}
            className="h-24 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">
              {label}
            </Link>
          ))}
          {session?.role === "admin" ? (
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          ) : null}
          {session ? (
            <form action={signOut}>
              <button className="nav-link" type="submit">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="nav-link">
              Investor login
            </Link>
          )}
        </nav>
        <Link
          href="/opportunities"
          className="hidden rounded-full bg-brand px-4 py-2 text-sm font-bold tracking-wide text-white uppercase hover:bg-brand-dark md:inline-flex"
        >
          View projects
        </Link>
      </div>
      <details className="border-t border-white/10 lg:hidden">
        <summary className="cursor-pointer px-5 py-3 text-sm font-bold tracking-wide uppercase">Menu</summary>
        <nav className="flex flex-col gap-3 px-5 pb-5" aria-label="Mobile">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="nav-link">
              {label}
            </Link>
          ))}
          {session?.role === "admin" ? (
            <Link href="/admin" className="nav-link">
              Admin
            </Link>
          ) : null}
          {session ? (
            <form action={signOut}>
              <button className="nav-link text-left" type="submit">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="nav-link">
              Investor login
            </Link>
          )}
        </nav>
      </details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[auto_1fr]">
        <img
          src={publicPath("/brand/logo-light.png")}
          alt={`${brandName}, powered by Acadia Homes`}
          className="h-20 w-auto"
        />
        <div className="max-w-2xl text-sm leading-6 text-white/75">
          <p>
            {brandName} Investor Portal is a draft review site. It is not an offer to sell securities, a
            solicitation, or a commitment to any return. Estimated resale prices are developer estimates, not
            appraisals or guaranteed sale prices.
          </p>
          <p className="mt-3">
            Office address printed on peakshomebuilders.com: 255 S Main St Suite 120, Logan, UT 84321. Acadia Homes
            floor plans are catalog references. The marketing site remains at{" "}
            <a className="text-white underline" href="https://peakshomebuilders.com/">
              peakshomebuilders.com
            </a>
            .
          </p>
          <p className="mt-3">Draft first. Send or publish only after I say yes.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-sm font-bold tracking-[0.18em] text-brand uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight md:text-5xl">{title}</h1>
        {children ? <div className="mt-5 max-w-3xl text-lg leading-8 text-ink/80">{children}</div> : null}
      </div>
    </section>
  );
}

export function DraftNotice() {
  return (
    <p className="border border-ink/10 bg-paper px-4 py-3 text-sm leading-6 text-ink/80">
      Local draft storage is a SQLite file on this machine. It is not the production database, and it will not persist
      on Vercel until a hosted database is approved. Blank money fields stay blank.
    </p>
  );
}
