# The Heritage at Gibbons Park Estates

Private investor illustration for Lot 1, Logan, Utah. This app is separate from the RE/MAX Peaks agent microsite at the repository root. It has its own dependencies, its own production build, and it must be deployed as its own Vercel project. Do not point the agent-microsite project at this directory.

## Local setup

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run verify   # default returns, sensitivity, unfunded draws, and losses
npm run lint
npm run build
npm start
```

Node.js 20.9 or newer. This app uses Next.js 16, React 19, and Tailwind CSS 4.

## How to change figures

Underwriting inputs live in `lib/assumptions.ts`:

- lot equity, construction budget, closing costs, commission rate (5% of the sale price)
- draw count and profit share
- default sale price, duration, and annual rate
- slider ranges
- the public lot link

Do not hardcode a new total in a component. `lib/formulas.ts` holds the identities, and `lib/calculate.ts` applies them. The base-case budget, the hero, the summary, the draw schedule, the calculator, and both charts all read that model.

Interest is simple, on drawn funds only:

```text
interest = principal × annual rate × outstanding months / 12
outstanding months = duration − draw index (0–4)
```

A draw is funded only when the duration reaches that draw’s month. Otherwise its principal for interest is zero. Project cost still includes the full construction budget, so a shorter hold is not treated as a cheaper house. The calculator’s shortest duration is 5 months, which funds all five draws. `npm run verify` also checks a 4-month case.

Profit = sale − lot − construction − interest − commission − closing. Commission is 5% of the sale price. At the $1,400,000 target it is $70,000.

Break-even sale price = (lot + construction + interest + closing) / 0.95, rounded to the nearest dollar. At the base case the fixed costs are $1,122,500 and the break-even sale is $1,181,579. Do not put 5% of the selected sale price into those fixed costs.

If profit is positive, Peaks and the lot investor each receive half. Cash-on-cash is investor profit divided by lot capital. It is not an annualized IRR. If profit is negative, the loss is not split 50/50. Capital return and proceeds are not modeled on a loss.

After any figure change, run `npm run verify` and update the expectations in `scripts/verify-returns.ts` if the base case itself changed.

## How to replace images

The hero and gallery use `public/heritage-exterior.webp`. Replace that file with the official rendering and keep the name, or change the `src` in `components/Hero.tsx` and `components/PhotoGallery.tsx` together. Do not swap in a different house.

Floor plans in the gallery are the owner’s sheets in `public/`:

- `heritage-plan-c.webp` is the main level
- `heritage-plan-b.webp` is the upper level
- `heritage-plan-a.webp` is the basement

Show those files as drawn. Do not redraw them. The basement is finished, and the dollar model does not change because of that. The basement sheet still prints UNEXCAVATED and GARAGE OPTIONAL on hatched areas. Do not describe those hatched areas as finished living space.

`public/gibbons-park-plat.pdf` is the Gibbons Park Estates final plat. Lot facts in `lib/content.ts` (`LOT_FACTS`) may repeat only what that plat prints on Lot 1. If a size, dimension, or orientation is not clearly Lot 1, leave it as not yet verified. Do not assign another lot’s data to Lot 1, and do not copy marketing-site lot facts from memory.

## How to configure the form

The inquiry form is always visible. It posts to `app/api/inquiry/route.ts`, which forwards JSON to `INQUIRY_ENDPOINT`.

If `INQUIRY_ENDPOINT` is unset, the submit button stays disabled and the page says “Submission is not configured.” Nothing is sent. Do not add a fake success state.

The payload is `{ name, email, phone, message, consent, source }`. Phone may be null. Consent must be true.

There is no Peaks phone number, email, or street address on this site. Do not invent one.

## How to deploy

Create a Vercel project for this app only:

- Root directory: `apps/heritage-gibbons-park`
- Framework: Next.js
- Do not change the existing agent-microsite project, which builds the repository root

Production of this project does not replace the agent microsite. Keep deployment protection on (Vercel Authentication). This site also sends `noindex, nofollow` in metadata, `app/robots.ts`, and an `X-Robots-Tag` header. There is no client-side password.

Pushing the repository’s production branch deploys this project only when that Vercel project’s production branch matches. Preview deployments are the right place to review a branch.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `INQUIRY_ENDPOINT` | Server only, all environments you want live | URL that receives inquiry JSON. Leave unset to keep submit disabled. |

Copy `.env.example` to `.env.local` for local development. Never commit a real endpoint URL. Changing the variable requires a new deployment so the disabled state matches the server.

## How to update disclosures

Both required disclosures live as verbatim strings in `lib/disclosures.ts`. `ProjectBudget` places them beside the financial model. `RiskDisclosure` and `Footer` render the same strings. Do not paraphrase them. The hero uses only `projectionsSentence` from that file.
