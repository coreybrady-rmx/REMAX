import { selectFollowUpBossApiKey } from "@/lib/leads";
import { submitLead } from "@/lib/submit-lead";
import { tallyStoreFromEnv } from "@/lib/headline-tally-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return submitLead(request, {
    apiKey: selectFollowUpBossApiKey({
      FOLLOW_UP_BOSS_API_KEY: process.env.FOLLOW_UP_BOSS_API_KEY,
      FollowUpBoss: process.env.FollowUpBoss,
    }),
    store: tallyStoreFromEnv(),
  });
}
