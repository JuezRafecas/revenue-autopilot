import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { MessageStatus } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as MessageStatus | null;
  const campaignId = url.searchParams.get('campaign_id');
  const guestId = url.searchParams.get('guest_id');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '100'), 500);

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
      .from('messages')
      .select('*, guest:guests(*), campaign:campaigns(*)')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (status) query = query.eq('status', status);
    if (campaignId) query = query.eq('campaign_id', campaignId);
    if (guestId) query = query.eq('guest_id', guestId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ messages: data ?? [] });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
