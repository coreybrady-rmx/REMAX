# Peaks Home Builders Investor Portal

Draft first. Send or publish only after I say yes.

This is a separate Next.js app for the Peaks Home Builders investor portal. It does not replace the RE/MAX Peaks agent microsite at the repository root, and it does not replace https://peakshomebuilders.com/.

## What is public

- Six Acadia Homes floor plans: Alpine, Balsa, Heritage, Juniper, Sage, and Sumac. Areas are catalog references.
- Empty current-opportunity and completed-project states until a record is marked public and approved.
- A blank returns worksheet. It does not contain a Peaks projection.
- Information requests are stored in the local database. They are not emailed.

A plan price appears only when an estimate is public and approved, and it is labeled Developer Estimated Resale Price. Otherwise the page says “Pricing estimate pending.” Drawings stay off the public site until the same approval is set. Missing money is left blank. It is not stored as zero.

The Heritage Linden Lane prospectus is seeded as a private, unapproved working scenario so the calculator can be reviewed. It is not a completed project, a guaranteed price, or a public opportunity.

## Local draft storage

`data/portal.db` is a SQLite file created by Node’s built-in `node:sqlite`. It is local draft storage. On Vercel the same file is created under `/tmp` so the pages can render, and it can reset. Production still needs an approved hosted Postgres database and private file storage. The admin banner says this on every admin screen.

Uploaded files live in `data/uploads` and are served only after the visibility and approval checks.

## Run it

```bash
cd apps/peaks-investor
cp .env.example .env.local
npm install
npm test
npm run dev
```

The dev server uses port 3210. Change `ADMIN_PASSWORD` before anyone else uses the machine. The login page does not display that password.

## Environment

- `AUTH_SECRET` — signs the `phb_session` cookie.
- `ADMIN_EMAIL` — local administrator, default `corey@peaks.local`.
- `ADMIN_PASSWORD` — created on first database start. Changing it later does not reset an existing user.

## Vercel checklist, not a deployment

Do not create a Vercel project or run a deploy until publishing is approved.

1. Create a new project whose root directory is `apps/peaks-investor`. Do not point it at the repository root.
2. Leave the existing RE/MAX Peaks microsite project unchanged.
3. Provision hosted Postgres and replace the SQLite draft store before any public use.
4. Put uploaded files in private storage. Do not commit `data/uploads`.
5. Set `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the new project only.
6. Keep `robots` noindex until the site is approved to be found.
7. Confirm the Heritage working scenario is still private, drawings are still unapproved, and no inquiry email or webhook has been added.
8. Draft first. Send or publish only after I say yes.
