# RE/MAX Peaks — Agent Microsite System

High-converting individual agent microsites connected to [remaxpeaks.com](https://www.remaxpeaks.com/).

## Phase 1 (this branch)

- **Figma:** [REMAX Peaks Agent Microsite System](https://www.figma.com/design/SCUj6tpspigAdtTNjYk6qM)
- **Pilot:** Corey Brady at `/corey-brady/`
- Supporting routes: `/corey-brady/home-value/`, `/corey-brady/neighborhoods/[slug]/`

## Stack

- Next.js 15 (App Router) + Tailwind CSS 4
- Peaks brand tokens (black / red / white, Cabin + Inter)
- Live MLS featured listings via proxy to `remaxpeaks.com/api/search-listings`
- Lead capture API → GoHighLevel webhook (`GHL_WEBHOOK_URL`)
- Google Analytics events for CTAs and form submits

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000/corey-brady/](http://localhost:3000/corey-brady/).

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GA_ID` | GA4 property (defaults to Peaks) |
| `GHL_WEBHOOK_URL` | GoHighLevel inbound webhook for leads |

Leads include `assignedTo` / `ghlAssignee` set to the agent (Corey Brady on the pilot).

## Production notes

Office stats on the pilot are labeled as brokerage production and should be replaced with current transaction-ledger figures before public marketing claims.

See [docs/phase-2-agent-rollout.md](docs/phase-2-agent-rollout.md) for the template used to scale to ~30 agents.
