import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { Segment, SegmentSummary } from '@/lib/types';

const ALL_SEGMENTS: Segment[] = ['lead', 'new', 'active', 'at_risk', 'dormant', 'vip'];

const SEGMENT_MULTIPLIER: Record<Segment, number> = {
  dormant: 0.2,
  at_risk: 0.4,
  lead: 0.3,
  new: 0.6,
  active: 1.5,
  vip: 2.5,
};

const SEGMENT_TREND: Record<Segment, 'up' | 'down' | 'stable'> = {
  dormant: 'down',
  at_risk: 'down',
  lead: 'stable',
  new: 'stable',
  active: 'up',
  vip: 'up',
};

export async function GET() {
  try {
    const db = getServiceClient();
    const { data: restaurant, error: rErr } = await db
      .from('restaurants')
      .select('id, avg_ticket')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (rErr || !restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    const { count: total, error: totalErr } = await db
      .from('guest_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurant.id);
    if (totalErr) throw totalErr;

    const avgTicket = Number(restaurant.avg_ticket);
    const totalGuests = total ?? 0;

    const summaries: SegmentSummary[] = await Promise.all(
      ALL_SEGMENTS.map(async (segment) => {
        const { count, error } = await db
          .from('guest_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant.id)
          .eq('segment', segment);
        if (error) throw error;
        const c = count ?? 0;
        return {
          segment,
          count: c,
          percentage: totalGuests > 0 ? c / totalGuests : 0,
          trend: SEGMENT_TREND[segment],
          revenue_opportunity: c * avgTicket * SEGMENT_MULTIPLIER[segment],
        };
      }),
    );

    return NextResponse.json({ summaries });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
