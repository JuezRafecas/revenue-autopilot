import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { EventType } from '@/lib/types';

const VALID_EVENT_TYPES: EventType[] = [
  'visit_completed',
  'visit_detected',
  'no_visit_threshold_reached',
  'low_occupancy_detected',
  'manual_enrollment',
];

export async function POST(req: Request) {
  let body: {
    event_type: EventType;
    guest_id?: string;
    visit_id?: string;
    payload?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  if (!body.event_type || !VALID_EVENT_TYPES.includes(body.event_type)) {
    return NextResponse.json(
      { error: `invalid event_type: ${body.event_type}` },
      { status: 400 },
    );
  }

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

    const { data, error } = await db
      .from('events')
      .insert({
        restaurant_id: restaurant.id,
        event_type: body.event_type,
        guest_id: body.guest_id ?? null,
        visit_id: body.visit_id ?? null,
        payload: body.payload ?? {},
      })
      .select('id, event_type, created_at')
      .single();
    if (error || !data) throw error ?? new Error('insert returned no row');

    return NextResponse.json({
      id: data.id,
      event_type: data.event_type,
      queued: true,
      created_at: data.created_at,
    });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
