import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import { classifyProfiles } from '@/lib/segmentation';
import { buildSegmentSummaries, totalRevenueAtStake } from '@/lib/revenue';
import type { GuestProfile } from '@/lib/types';

const FETCH_PAGE = 1000;
const UPSERT_BATCH = 500;

async function resolveRestaurant(db: SupabaseClient, restaurantId?: string) {
  if (restaurantId) {
    const { data, error } = await db
      .from('restaurants')
      .select('id, avg_ticket')
      .eq('id', restaurantId)
      .single();
    if (error || !data) throw new Error(`restaurant ${restaurantId} not found`);
    return data;
  }
  const { data, error } = await db
    .from('restaurants')
    .select('id, avg_ticket')
    .eq('slug', DEFAULT_RESTAURANT.slug)
    .maybeSingle();
  if (error) throw new Error(`restaurant lookup failed: ${error.message}`);
  if (!data) throw new Error(`restaurant with slug ${DEFAULT_RESTAURANT.slug} not found`);
  return data;
}

async function fetchAllProfiles(
  db: SupabaseClient,
  restaurantId: string,
): Promise<GuestProfile[]> {
  const all: GuestProfile[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await db
      .from('guest_profiles')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('id', { ascending: true })
      .range(from, from + FETCH_PAGE - 1);
    if (error) throw new Error(`fetch guest_profiles: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as GuestProfile[]));
    if (data.length < FETCH_PAGE) break;
    from += FETCH_PAGE;
  }
  return all;
}

async function persistClassified(db: SupabaseClient, profiles: GuestProfile[]) {
  for (let i = 0; i < profiles.length; i += UPSERT_BATCH) {
    const slice = profiles.slice(i, i + UPSERT_BATCH).map((p) => ({
      id: p.id,
      rfm_recency: p.rfm_recency,
      rfm_frequency: p.rfm_frequency,
      rfm_monetary: p.rfm_monetary,
      rfm_score: p.rfm_score,
      segment: p.segment,
      tier: p.tier,
      calculated_at: p.calculated_at,
    }));
    const { error } = await db.from('guest_profiles').upsert(slice, { onConflict: 'id' });
    if (error) throw new Error(`upsert batch ${i}: ${error.message}`);
  }
}

export async function POST(request: Request) {
  let body: { restaurant_id?: string } = {};
  try {
    const raw = await request.text();
    body = raw ? JSON.parse(raw) : {};
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  try {
    const db = getServiceClient();
    const restaurant = await resolveRestaurant(db, body.restaurant_id);
    const profiles = await fetchAllProfiles(db, restaurant.id);

    const classified = classifyProfiles(profiles);
    await persistClassified(db, classified);

    const summaries = buildSegmentSummaries(classified, Number(restaurant.avg_ticket));
    const revenue_at_stake = totalRevenueAtStake(summaries);

    return NextResponse.json({
      restaurant_id: restaurant.id,
      summaries,
      totals: {
        guests: classified.length,
        revenue_at_stake,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
