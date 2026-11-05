import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { brandName } from "@/lib/brand";
import { currentSession } from "@/lib/current";
import "@fontsource/cabin/latin-400.css";
import "@fontsource/cabin/latin-500.css";
import "@fontsource/cabin/latin-600.css";
import "@fontsource/cabin/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${brandName} Investor Portal`,
    template: `%s · ${brandName}`,
  },
  description: `Investor portal for ${brandName} spec home projects and the Acadia Homes floor plan collection.`,
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await currentSession();
  return (
    <html lang="en">
      <body className="antialiased">
        <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3" href="#content">
          Skip to content
        </a>
        <SiteHeader session={session} />
        <main id="content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
