import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveProfileId(db: SupabaseClient, input: string, restaurantId: string) {
  if (UUID_RE.test(input)) return input;

  // Text hash: look it up in cdp_guest_partners, reconcile via guest_email.
  const { data: cdpRow } = await db
    .from('cdp_guest_partners')
    .select('guest_partner_id, guest_email')
    .eq('guest_partner_id', input)
    .maybeSingle();
  if (!cdpRow) return null;

  if (cdpRow.guest_email) {
    const { data: guest } = await db
      .from('guests')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('email', cdpRow.guest_email)
      .maybeSingle();
    if (guest) {
      const { data: profile } = await db
        .from('guest_profiles')
        .select('id')
        .eq('guest_id', guest.id)
        .maybeSingle();
      if (profile) return profile.id;
    }
  }
  return null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const includeRaw = url.searchParams.get('include_raw') === 'true';

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

    const profileId = await resolveProfileId(db, id, restaurant.id);
    if (!profileId) {
      return NextResponse.json({ error: 'guest_partner not found' }, { status: 404 });
    }

    const { data: profile, error: pErr } = await db
      .from('guest_profiles')
      .select('*, guest:guests(*)')
      .eq('id', profileId)
      .maybeSingle();
    if (pErr) throw pErr;
    if (!profile) {
      return NextResponse.json({ error: 'guest_partner not found' }, { status: 404 });
    }

    let raw = undefined;
    if (includeRaw && profile.guest?.email) {
      const { data: cdpRow } = await db
        .from('cdp_guest_partners')
        .select('*')
        .eq('guest_email', profile.guest.email)
        .maybeSingle();
      raw = cdpRow ?? null;
    }

    const { data: messages } = await db
      .from('messages')
      .select('*')
      .eq('guest_id', profile.guest_id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      guest_partner: {
        profile: { ...profile, guest: undefined },
        guest: profile.guest,
        ...(raw !== undefined ? { raw } : {}),
      },
      messages: messages ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
