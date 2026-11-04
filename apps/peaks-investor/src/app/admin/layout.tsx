import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DraftNotice } from "@/components/SiteChrome";
import { currentSession } from "@/lib/current";

const links = [
  ["Overview", "/admin"],
  ["Estimates", "/admin/estimates"],
  ["Projects", "/admin/projects"],
  ["Plans", "/admin/plans"],
  ["Inquiries", "/admin/inquiries"],
  ["Access", "/admin/access"],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await currentSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin");
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <DraftNotice />
        <nav className="flex flex-wrap gap-4 text-sm font-bold" aria-label="Admin">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-link">
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
