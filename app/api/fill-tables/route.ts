import { NextResponse } from 'next/server';
import { MOCK_GUESTS } from '@/lib/mock';

/**
 * TODO (hackathon): query guest_profiles matching the given day/shift by
 * preferred_day_of_week and preferred_shift, rank by conversion probability,
 * return the top N candidates.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { day?: string; shift?: string };
  // Placeholder: return a handful of plausible matches
  const matches = MOCK_GUESTS
    .filter((g) => g.segment === 'active' || g.segment === 'at_risk')
    .slice(0, 8)
    .map((g) => ({ ...g, match_day: body.day, match_shift: body.shift }));
  return NextResponse.json({ matches });
}
