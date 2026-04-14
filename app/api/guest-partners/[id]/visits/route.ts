import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '200'), 500);

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

    // Resolve guest_profiles.id → guests.id. Accept either a UUID (profile id)
    // or a cdp guest_partner_id text hash.
    let profileQuery = db
      .from('guest_profiles')
      .select('id, guest_id')
      .eq('restaurant_id', restaurant.id);
    if (UUID_RE.test(id)) {
      profileQuery = profileQuery.eq('id', id);
    } else {
      // Reconcile via cdp_guest_partners.guest_email → guests.email
      const { data: cdpRow } = await db
        .from('cdp_guest_partners')
        .select('guest_email')
        .eq('guest_partner_id', id)
        .maybeSingle();
      if (!cdpRow?.guest_email) {
        return NextResponse.json({ error: 'guest_partner not found' }, { status: 404 });
      }
      const { data: guest } = await db
        .from('guests')
        .select('id')
        .eq('restaurant_id', restaurant.id)
        .eq('email', cdpRow.guest_email)
        .maybeSingle();
      if (!guest) {
        return NextResponse.json({ error: 'guest_partner not found' }, { status: 404 });
      }
      profileQuery = profileQuery.eq('guest_id', guest.id);
    }

    const { data: profile } = await profileQuery.maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: 'guest_partner not found' }, { status: 404 });
    }

    const { data: visits, error } = await db
      .from('visits')
      .select('*')
      .eq('guest_id', profile.guest_id)
      .order('visit_date', { ascending: false })
      .limit(limit);
    if (error) throw error;

    return NextResponse.json({
      guest_partner_id: profile.id,
      visits: visits ?? [],
      total: visits?.length ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
