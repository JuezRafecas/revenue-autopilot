import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { EventType } from '@/lib/types';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const processed = url.searchParams.get('processed');
  const eventType = url.searchParams.get('event_type') as EventType | null;
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
      .from('events')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (processed === 'true') query = query.not('processed_at', 'is', null);
    if (processed === 'false') query = query.is('processed_at', null);
    if (eventType) query = query.eq('event_type', eventType);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ events: data ?? [] });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
