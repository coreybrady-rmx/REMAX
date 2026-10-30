# RE/MAX Peaks — Cache Valley QR page

Mobile-first landing page for the RE/MAX Peaks Logan office QR code at [www.remaxpeaks.com/your-next-move](https://www.remaxpeaks.com/your-next-move). Each new scan gets the next headline, in order, and that visitor keeps it. Visitors then choose a free CMA or a buyer payment tool, and can search active Cache Valley homes. The inventory snapshot refreshes from the UtahRealEstate API every morning at 6:00 AM Mountain Daylight Time (12:00 UTC). After November 1, 2026, that same UTC schedule is 5:00 AM Mountain Standard Time.

Design: [Figma file](https://www.figma.com/design/oSYnpLYpXNMqbIMmsutnzX)

```bash
npm install
npm test
npm run dev
```

Copy `.env.example` to `.env.local` and set `UTAH_MLS_TOKEN` and `FOLLOW_UP_BOSS_API_KEY` on the server. Do not put those values in the browser or in git. The daily market route is `/api/cron/market`. On Vercel, set `CRON_SECRET` and `BLOB_READ_WRITE_TOKEN`. The blob token keeps the market snapshot, the headline counter, and the headline submission tally across deploys. Until the MLS token is set, the page shows the checked-in starter snapshot with no invented prices. Home search uses the same MLS token on the server.

A completed form records the headline already stored in the `cv_headline` cookie. Counts for each headline are at `/your-next-move/results?key=` using `CRON_SECRET`. That page is not linked from the landing page. If `CRON_SECRET` is unset, the counts page is not found.
