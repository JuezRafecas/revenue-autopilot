# Revenue Journal

Diagnóstico autónomo y recuperación de revenue para restaurantes. Boilerplate para el Kaszek Dev Hackathon 2026.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 3.4
- Supabase (Postgres)
- Anthropic Claude API (`@anthropic-ai/sdk`)
- framer-motion · papaparse · recharts

## Quickstart

```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase URL, anon key, service role key, Anthropic API key

# Create the schema in Supabase (SQL editor):
#   supabase/migrations/001_initial_schema.sql

# Generate (or regenerate) the demo CSV:
npm run generate-csv

# Load it into Supabase:
npm run seed

# Start dev server:
npm run dev
```

Open http://localhost:3000.

Every page renders with curated placeholder data even before you seed — the design works without env vars, the real API calls require them.

## What's already built

- Full UI (landing, dashboard, segments, guest profile, actions, revenue, upload) in the **Editorial Dark / Revenue Journal** design system
- Typography: Fraunces display · Instrument Sans body · JetBrains Mono numerals (all via `next/font/google`)
- All primitives, dashboard components, action panels, guest views
- API routes: `/api/upload` (real CSV → DB glue), `/api/generate-message` (real Claude call), others return plausible mock data
- Demo CSV generator: 613 guests, 3060 visits, distribution matches story
- Supabase migration + seed/reset scripts

## What's intentionally left for the hackathon

- `lib/segmentation.ts` — `classifyGuests`, `calculateRFM`, `determineSegment`
- `lib/revenue.ts` — `calculateRevenueOpportunity`, `buildSegmentSummaries`, `totalRevenueAtStake`
- `/api/analyze` — orchestration that reads visits, runs segmentation, upserts profiles
- `/api/segments` and `/api/guests` — currently return mocks, wire them to real data
- Dashboard and segment pages — currently read from `lib/mock.ts`, wire them to the APIs

See [`HACKATHON_PLAN.md`](./HACKATHON_PLAN.md) for the hour-by-hour execution plan.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Next dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run generate-csv` | Regenerate `data/demo-visits.csv` |
| `npm run seed` | Insert restaurant + guests + visits into Supabase |
| `npm run reset` | Truncate all tables and re-seed |

## Design direction

Editorial Dark — FT Weekend × Bloomberg terminal × Stripe. Warm near-black, Fraunces display, tabular JetBrains Mono numerals, hairlines not borders, one oxidized-copper accent for the segments that are bleeding money. No glassmorphism, no purple gradients, no generic SaaS.

The goal: doesn't look like a hackathon prototype.
