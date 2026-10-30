# RE/MAX Peaks — Cache Valley QR page

Mobile-first landing page for the Logan Main Street QR code. Visitors choose a free CMA or a buyer payment tool. Cache County asking prices for single-family homes and townhomes refresh from the UtahRealEstate API.

Design: [Figma file](https://www.figma.com/design/oSYnpLYpXNMqbIMmsutnzX)

```bash
npm install
npm test
npm run dev
```

Copy `.env.example` to `.env.local` and set `UTAH_MLS_TOKEN` and `FOLLOW_UP_BOSS_API_KEY` on the server. Do not put those values in the browser or in git. The daily market route is `/api/cron/market`. On Vercel, set `CRON_SECRET` and, so the snapshot survives deploys, `BLOB_READ_WRITE_TOKEN`. Until the MLS token is set, the page shows the checked-in starter snapshot with no invented prices.
