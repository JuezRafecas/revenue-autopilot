import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import { reseedFromCsvs } from '@/lib/cdp-seed';

export const maxDuration = 300;

async function readFile(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || typeof file === 'string') return null;
  return await file.text();
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'expected multipart/form-data' }, { status: 400 });
  }

  const guestPartnerCsv = await readFile(form.get('guest_partner_file'));
  if (!guestPartnerCsv) {
    return NextResponse.json(
      { error: 'missing guest_partner_file (required)' },
      { status: 400 },
    );
  }
  const visitCsv = (await readFile(form.get('visit_file'))) ?? '';
  const guestUnifiedCsv = (await readFile(form.get('guest_unified_file'))) ?? '';

  try {
    const db = getServiceClient();
    const { data: restaurant, error } = await db
      .from('restaurants')
      .select('id, avg_ticket')
      .eq('slug', DEFAULT_RESTAURANT.slug)
      .maybeSingle();
    if (error || !restaurant) {
      return NextResponse.json(
        { error: `restaurant ${DEFAULT_RESTAURANT.slug} not found — seed it first` },
        { status: 500 },
      );
    }

    const counts = await reseedFromCsvs(db, {
      visitCsv,
      guestPartnerCsv,
      guestUnifiedCsv,
      restaurantId: restaurant.id,
      avgTicket: Number(restaurant.avg_ticket),
    });

    return NextResponse.json({
      restaurant_id: restaurant.id,
      raw: {
        cdp_visits: counts.cdp_visits,
        cdp_guest_partners: counts.cdp_guest_partners,
        cdp_guest_unified: counts.cdp_guest_unified,
      },
      projected: {
        guests: counts.guests,
        visits: counts.visits,
        guest_profiles: counts.guest_profiles,
      },
      orphans: counts.orphans,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
