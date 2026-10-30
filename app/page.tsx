import { cookies } from "next/headers";
import { Landing } from "@/components/Landing";
import { HEADLINE_COOKIE, headlineForIndex, parseHeadlineCookie } from "@/lib/headlines";
import { readSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function Page() {
  const market = await readSnapshot();
  const jar = await cookies();
  const index = parseHeadlineCookie(jar.get(HEADLINE_COOKIE)?.value) ?? 0;
  return <Landing market={market} headline={headlineForIndex(index)} />;
}
