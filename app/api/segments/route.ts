import { NextResponse } from 'next/server';
import { MOCK_SEGMENT_SUMMARIES } from '@/lib/mock';

/**
 * TODO (hackathon): query guest_profiles, group by segment, compute revenue_opportunity
 * via lib/revenue.ts. For now returns curated mock data so the UI renders.
 */
export async function GET() {
  return NextResponse.json({ summaries: MOCK_SEGMENT_SUMMARIES });
}
