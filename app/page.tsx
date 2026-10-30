import { Landing } from "@/components/Landing";
import { readSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function Page() {
  const market = await readSnapshot();
  return <Landing market={market} />;
}
