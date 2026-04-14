import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { Segment, AudienceTier, GuestProfile, Guest } from '@/lib/types';

const VALID_SEGMENTS: Segment[] = ['lead', 'new', 'active', 'at_risk', 'dormant', 'vip'];
const VALID_TIERS: AudienceTier[] = ['vip', 'frequent', 'occasional'];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const segment = url.searchParams.get('segment');
  const tier = url.searchParams.get('tier');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '50'), 500);
  const offset = Number(url.searchParams.get('offset') ?? '0');

  if (segment && !VALID_SEGMENTS.includes(segment as Segment)) {
    return NextResponse.json({ error: `invalid segment: ${segment}` }, { status: 400 });
  }
  if (tier && !VALID_TIERS.includes(tier as AudienceTier)) {
    return NextResponse.json({ error: `invalid tier: ${tier}` }, { status: 400 });
  }

  try {
    const db = getServiceClient();
    const { data: restaurant, error: rErr } = await db
      .from('restaurants')
      .select('id')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (rErr || !restaurant) {
      return NextResponse.json({ error: 'restaurant not found' }, { status: 500 });
    }

    let query = db
      .from('guest_profiles')
      .select('*, guest:guests(*)', { count: 'exact' })
      .eq('restaurant_id', restaurant.id);

    if (segment) query = query.eq('segment', segment);
    if (tier) query = query.eq('tier', tier);

    const { data, count, error } = await query
      .order('total_spent', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;

    const guests = (data ?? []) as Array<GuestProfile & { guest: Guest | null }>;
    return NextResponse.json({ guests, total: count ?? guests.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
