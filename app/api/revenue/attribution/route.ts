import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { AttributionSummary, TemplateKey } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const campaignId = url.searchParams.get('campaign_id');

  try {
    const db = getServiceClient();
    const { data: restaurant } = await db
      .from('restaurants')
      .select('id')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (!restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    let query = db
      .from('attributions')
      .select('campaign_id, amount, attributed_at, message_id')
      .eq('restaurant_id', restaurant.id);
    if (from) query = query.gte('attributed_at', from);
    if (to) query = query.lte('attributed_at', to);
    if (campaignId) query = query.eq('campaign_id', campaignId);

    const { data: attributions, error } = await query;
    if (error) throw error;

    // Aggregate in memory (Supabase PostgREST has no group-by).
    type Agg = { amount: number; conversions: number; messages: Set<string> };
    const byCampaign = new Map<string, Agg>();
    for (const row of attributions ?? []) {
      const entry = byCampaign.get(row.campaign_id) ?? {
        amount: 0,
        conversions: 0,
        messages: new Set<string>(),
      };
      entry.amount += Number(row.amount ?? 0);
      entry.conversions += 1;
      entry.messages.add(row.message_id);
      byCampaign.set(row.campaign_id, entry);
    }

    const campaignIds = Array.from(byCampaign.keys());
    const campaignsRes = campaignIds.length
      ? await db
          .from('campaigns')
          .select('id, name, template_key, metric_sent')
          .in('id', campaignIds)
      : { data: [] as Array<{ id: string; name: string; template_key: string | null; metric_sent: number }> };

    const rows: AttributionSummary[] = (campaignsRes.data ?? []).map((c) => {
      const agg = byCampaign.get(c.id) ?? { amount: 0, conversions: 0, messages: new Set() };
      const sent = Number(c.metric_sent ?? 0);
      return {
        campaign_id: c.id,
        campaign_name: c.name,
        template_key: (c.template_key ?? null) as TemplateKey | null,
        messages_sent: sent,
        conversions: agg.conversions,
        revenue: agg.amount,
        rate: sent > 0 ? agg.conversions / sent : 0,
      };
    });

    return NextResponse.json({ rows });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
