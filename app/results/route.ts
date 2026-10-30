import { handleHeadlineResults } from "@/lib/headline-tally";
import { tallyStoreFromEnv } from "@/lib/headline-tally-store";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleHeadlineResults({
    store: tallyStoreFromEnv(),
  });
}
