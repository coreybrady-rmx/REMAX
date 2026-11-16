import { handleMarketCron } from "@/lib/market-cron";

// Vercel cron schedules are UTC and do not follow Mountain daylight saving time.
// 13:00 UTC is 6:00 AM Mountain Standard Time and 7:00 AM Mountain Daylight Time.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleMarketCron(request);
}
