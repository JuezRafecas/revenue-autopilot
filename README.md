# Nomi - Guest Autopilot

> A system that autonomously manages the entire relationship between a restaurant and its customers. The right message, at the right time, to the right customer—at every stage of the customer lifecycle and at every touchpoint. Your same restaurant, with automated revenue.

**Live demo:** <https://push-to-prod-amber.vercel.app>

Built for the Kaszek Push-to-Prod Hackathon 2026. The only metric we care about is **new money in the register**. No open rates, no CTRs, no engagement vanity. **Approve, don't configure.**

---

## What it does

Restaurants have thousands of guests who silently stopped coming back. They don't know it. Nomi - Guest Autopilot loads the CDP, classifies every guest, computes the revenue at stake, and proposes the next best action through a single conversational surface — **Nomi**, your AI CMO.

The pipeline is the product:

```
CDP  ──▶  Trigger  ──▶  Audience  ──▶  Workflow  ──▶  Metrics
```

- **CDP** — unified guest identity across reservations, POS, payments, delivery and walk-ins. ~79 attributes per guest, projected from three Woki CSVs into Supabase (`cdp_visits`, `cdp_guest_partners`, `cdp_guest_unified`).
- **Trigger** — events (new visit, reservation), schedules, or manual approval.
- **Audience** — declarative JSON filter on `guest_profiles` (`lib/audience.ts`).
- **Workflow** — DAG of steps: `send_message`, `wait`, `branch`, `end`. WhatsApp first, email fallback.
- **Metrics** — delivery × conversion → **attributed incremental revenue**.

Five built-in campaigns: post-visit thank-you, first→second visit conversion, dormant reactivation, event push, and capacity optimization.

### Nomi — the conversational CMO

Nomi is the single entrypoint at [`/hub`](https://push-to-prod-amber.vercel.app/hub). It runs on the **Vercel AI SDK** with Anthropic Claude, using a tool set that hits real Supabase data (no mocks):

| Tool | What it does |
|---|---|
| `queryCustomers` | Filter the CDP by segment, recency, ticket, channel |
| `getSegmentMetrics` | Headcount, revenue at stake, trend per segment |
| `detectOpportunities` | Surface the top revenue plays for the week |
| `estimateAudienceSize` | Dry-run an audience filter before drafting |
| `listTemplates` | Pull approved message templates |
| `draftCampaign` | Compose a ready-to-approve campaign card |
| `getCampaignResults` | Attribution + delivery stats for shipped campaigns |

The hub UI has two states: **idle** (hero title + opportunity strip with one-click approve) and **engaged** (compact header, collapsed strip, chat takes the room). Both built around the *approve, don't configure* mantra.

---

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript 5.6** · **Tailwind 3.4**
- **Supabase** (Postgres) — schema in `supabase/migrations/`
- **Anthropic Claude** via **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`)
- **framer-motion** · **recharts** · **react-markdown** · **papaparse** · **zod**
- **Vitest** for Red-Green TDD

Hosted on **Vercel** (Fluid Compute, Node 24 LTS).

---

## Quickstart

```bash
git clone <repo>
cd push-to-prod
npm install

cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY

# Apply the schema in the Supabase SQL editor:
#   supabase/migrations/001_initial_schema.sql
#   supabase/migrations/002_campaigns.sql
#   supabase/migrations/003_cdp_raw.sql

# Seed the demo restaurant (La Cabrera) — wipes + reimports the three CSVs,
# computes guest profiles, synthesizes amounts and Argentine names deterministically:
npm run seed

# Start the dev server:
npm run dev
```

Open <http://localhost:3000>. Every page renders with placeholder data even before the seed; the live API calls require the env vars.

### Environment variables

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role (server-only) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key for Nomi and message generation |
| `NEXT_PUBLIC_API_BASE_URL` | optional | Base URL for server components calling internal route handlers. Defaults to the deployment URL on Vercel. |

On Vercel, manage these with `vercel env pull .env.local` (CLI) or via the project dashboard.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Next dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, single run (CI / pre-commit) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run generate-csv` | Regenerate `data/demo-visits.csv` |
| `npm run seed` | Wipe + reimport the Woki CSVs, project profiles, synthesize amounts & names |
| `npm run reset` | Truncate everything and re-seed |

---

## Routes at a glance

### Pages

| Path | Purpose |
|---|---|
| `/` | Marketing landing — hero, pipeline, demo CTA |
| `/hub` | **Nomi**, the conversational CMO |
| `/dashboard` | Health score, segment breakdown, revenue at stake |
| `/upload` | CSV upload + diagnosis kickoff |
| `/audience` | Audience builder (filter preview + estimate) |
| `/campaigns` | Campaign list, draft cards, attribution |
| `/templates` | Approved message templates |
| `/messages` | Outbox + delivery state |
| `/revenue` | Attributed revenue tracker |
| `/settings` · `/integrations` | Restaurant config, channels, opt-ins |

### API

All routes live under `app/api/**`. Highlights:

| Route | Method | Notes |
|---|---|---|
| `/api/agent/chat` | `POST` | Vercel AI SDK streaming endpoint backing Nomi |
| `/api/analyze` | `POST` | Reads visits, runs segmentation, upserts `guest_profiles` |
| `/api/cdp/import` | `POST` | HTTP entry to `reseedFromCsvs` |
| `/api/audience` | `POST` | Estimates an audience size from an `AudienceFilter` |
| `/api/campaigns` | `GET`/`POST` | List, create, persist drafts |
| `/api/templates` | `GET` | Approved templates with placeholders |
| `/api/messages` | `GET` | Outbox + status |
| `/api/generate-message` | `POST` | One-shot Claude completion (legacy entrypoint) |
| `/api/kpis` | `GET` | Headline numbers for the dashboard |
| `/api/revenue` | `GET` | Attributed revenue by campaign |
| `/api/upload` | `POST` | Multipart CSV → DB glue |

Full spec, request/response shapes and implementation status live in [`docs/api.md`](./docs/api.md). It's the source of truth — every PR touching `app/api/**` updates it in the same commit.

---

## Repo map

```
app/                  Next.js App Router pages + API routes
components/
  nomi/               Nomi chat hub (NomiHub, NomiChat, OpportunityStrip, …)
  dashboard/          Health score, segment cards, revenue widgets
  campaigns/          Draft cards, approval flow
  ui/                 Primitives (buttons, hairlines, mono labels)
lib/
  agent/              Nomi tools, system prompt, opportunity detector
  segmentation.ts     classifyGuests, calculateRFM, determineSegment
  revenue.ts          Revenue-at-stake math, segment summaries
  audience.ts         AudienceFilter matcher
  cdp-seed.ts         Single-pass reseed (CSV → cdp_* → guest_profiles)
  templates.ts        Message templates registry
  nomi/sessions.ts    LocalStorage-backed session history
docs/api.md           API spec (source of truth)
supabase/migrations/  001 schema · 002 campaigns · 003 CDP raw
scripts/              seed.ts, reset.ts, generate-csv.ts
tests/                Vitest suites mirroring lib/ and app/api/
```

---

## Demo narrative (60 seconds)

1. **The problem.** "Restaurants have thousands of guests who stopped coming. They don't know it."
2. **The diagnosis.** Upload data → instant verdict → *50% of your base are ghosts*.
3. **The action.** Nomi detects the opportunity → click *Dormant* → personalized messages drafted.
4. **The mantra.** Show a generated message → *Approve, don't configure*.
5. **The proof.** Revenue tracker → *Same restaurant, more money on autopilot*.

---

## Engineering principles

This repo enforces a few non-negotiables — see [`AGENTS.md`](./AGENTS.md) for the full version.

### Red-Green TDD
Based on Simon Willison's [agentic engineering patterns](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/). Every logic change starts with a failing test that fails for the right reason. No "I know it'll work." No commit without `npm test` green.

### Approve, don't configure
No segment builder. No campaign authoring. No drag-and-drop workflow editor. The system *proposes*, the operator *approves*. If a feature looks like a configuration UI, we kill it.

### Verification before "done"
`npm run typecheck` + `npm test` green. For UI work, dev server up, golden path tested in the browser via `agent-browser`. No evidence, no "done."

### English only
All code, comments, UI copy, markdown and commit messages are in English. The only exceptions are proper nouns (restaurant name "La Cabrera", guest names, venue sections).

---

## Design

**Editorial Dark** — FT Weekend × Bloomberg terminal × Stripe. Warm near-black, Fraunces display, Instrument Sans body, JetBrains Mono tabular numerals, hairlines instead of borders, one oxidized-copper accent reserved for segments that are bleeding money.

The Nomi hub uses a Kaszek-tinted variant: Archivo Black display, sage-green status accent, and the same hairline grammar. No glassmorphism, no purple gradients, no generic SaaS aesthetic.

---

## Deploy

```bash
# Push to main → Vercel auto-deploys to https://push-to-prod-amber.vercel.app
git push origin main

# Or trigger a production deployment manually:
vercel --prod

# Sync env vars locally:
vercel env pull .env.local
```

The project runs on **Vercel Fluid Compute** (Node 24 LTS, default 300s function timeout). The Nomi streaming endpoint at `/api/agent/chat` benefits from Fluid's instance reuse — no cold start between back-to-back chat turns.

---

## Further reading

- [`AGENTS.md`](./AGENTS.md) — product, TDD discipline, repo conventions (source of truth)
- [`HACKATHON_PLAN.md`](./HACKATHON_PLAN.md) — hour-by-hour execution plan
- [`docs/api.md`](./docs/api.md) — full API contract, entities, status legend
- [`hackathon-knowledge-base.md`](./hackathon-knowledge-base.md) — domain notes, CDP semantics, segmentation rules
