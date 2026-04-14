import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { DashboardKPIs, Segment } from '@/lib/types';

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

const SEGMENT_MULTIPLIER: Record<Segment, number> = {
  dormant: 0.2,
  at_risk: 0.4,
  lead: 0.3,
  new: 0.6,
  active: 1.5,
  vip: 2.5,
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rangeKey = (url.searchParams.get('range') ?? '30d') as keyof typeof RANGE_DAYS;
  const days = RANGE_DAYS[rangeKey] ?? 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const db = getServiceClient();
    const { data: restaurant } = await db
      .from('restaurants')
      .select('id, avg_ticket')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    const [
      { count: activeCampaigns },
      { count: totalGuests },
      { count: messagesSent },
      { count: messagesResponded },
      attributionRes,
    ] = await Promise.all([
      db
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'active'),
      db
        .from('guest_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id),
      db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .gte('sent_at', cutoff),
      db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
        .gte('sent_at', cutoff)
        .in('status', ['responded', 'converted']),
      db
        .from('attributions')
        .select('amount')
        .eq('restaurant_id', restaurant.id)
        .gte('attributed_at', cutoff),
    ]);

    const revenueAttributed = (attributionRes.data ?? []).reduce(
      (acc, r) => acc + Number(r.amount ?? 0),
      0,
    );

    // Revenue at stake = sum over segments of count × avgTicket × multiplier.
    const segmentCounts = await Promise.all(
      (Object.keys(SEGMENT_MULTIPLIER) as Segment[]).map(async (seg) => {
        const { count } = await db
          .from('guest_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant.id)
          .eq('segment', seg);
        return { seg, count: count ?? 0 };
      }),
    );
    const avgTicket = Number(restaurant.avg_ticket);
    const revenueAtStake = segmentCounts.reduce(
      (acc, { seg, count }) => acc + count * avgTicket * SEGMENT_MULTIPLIER[seg],
      0,
    );

    // Base health score: share of active + new guests vs. dormant + leads.
    const counts = Object.fromEntries(segmentCounts.map(({ seg, count }) => [seg, count])) as Record<
      Segment,
      number
    >;
    const total = totalGuests ?? 0;
    const healthyPortion =
      total === 0 ? 0 : (counts.active + counts.vip + counts.new) / total;
    const baseHealthScore = Math.round(Math.min(100, Math.max(0, healthyPortion * 100)));

    const kpis: DashboardKPIs = {
      active_campaigns: activeCampaigns ?? 0,
      messages_sent_30d: messagesSent ?? 0,
      response_rate_30d:
        messagesSent && messagesSent > 0 ? (messagesResponded ?? 0) / messagesSent : 0,
      revenue_attributed_30d: revenueAttributed,
      revenue_at_stake: revenueAtStake,
      total_guests: total,
      base_health_score: baseHealthScore,
    };

    return NextResponse.json({ kpis });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
