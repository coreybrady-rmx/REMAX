# Phase 2 — Agent Microsite Rollout Template

After Corey Brady’s pilot is approved, clone this content pack pattern for each agent.

## Per-agent content pack

Create `src/data/agents/<slug>.ts` implementing `AgentProfile`:

| Field | Notes |
|-------|-------|
| `slug` | URL path, e.g. `travis-allred` |
| `name` / `firstName` / `title` | Display identity |
| `phone` / `email` / `photo` | Contact + headshot |
| `heroImage` | Full-bleed Cache Valley / lifestyle image |
| `marketLine` | Areas served |
| `headline` / `shortPitch` / `bio` | Conversion copy (short) |
| `statsMode` | `agent` or `office` |
| `statsLabel` / `statsPeriod` / `stats` | Dated, consistent numbers |
| `specialties` | 3–5 chips |
| `testimonials` | Named + location |
| `neighborhoods` | Start with 4–6 |
| `ghlAssignee` | Exact GHL user/name for routing |

## Stats rules

- Use **agent** stats only when personal production is strong and dated.
- Otherwise use **office** ledger stats with explicit “RE/MAX Peaks · Cache Valley” labeling.
- Prefer three big numbers. Never mix conflicting figures on one page.

## Build checklist per agent

1. Add data file + register in `src/data/agents/index` (or mirror Corey route folder).
2. Create routes: `/<slug>/`, `/<slug>/home-value/`, `/<slug>/neighborhoods/[area]/`.
3. Confirm GHL webhook receives `assignedTo` / `ghlAssignee`.
4. Update `/agent-list/` card on brokerage site to deep-link the microsite.
5. QA mobile sticky bar (Call / Text / Home Value) and GA events.

## Shared systems (do not fork)

- Peaks design tokens in `globals.css`
- `SearchWidget` → `remaxpeaks.com/search/`
- `/api/leads` → `GHL_WEBHOOK_URL`
- `/api/search-listings` proxy
- Figma: [REMAX Peaks Agent Microsite System](https://www.figma.com/design/SCUj6tpspigAdtTNjYk6qM)

## Suggested rollout order

1. Corey (pilot) — done
2. Travis Allred
3. Top producers with personal stats ready
4. Newer agents on office-stats mode
