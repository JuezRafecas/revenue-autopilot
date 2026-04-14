import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { getServiceClient } from '@/lib/supabase';
import { DEFAULT_RESTAURANT } from '@/lib/constants';

interface CsvRow {
  guest_name: string;
  phone: string;
  email: string;
  visit_date: string;
  party_size: string;
  amount: string;
  shift: string;
  day_of_week: string;
  sector: string;
  visit_type: string;
  outcome: string;
  score: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required (multipart/form-data)' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse<CsvRow>(text, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0) {
      return NextResponse.json({ error: 'CSV parse failed', details: parsed.errors.slice(0, 3) }, { status: 400 });
    }

    const db = getServiceClient();

    // Upsert restaurant
    const { data: restaurant } = await db
      .from('restaurants')
      .upsert(
        {
          name: DEFAULT_RESTAURANT.name,
          slug: DEFAULT_RESTAURANT.slug,
          avg_ticket: DEFAULT_RESTAURANT.avg_ticket,
          currency: DEFAULT_RESTAURANT.currency,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single();

    if (!restaurant) {
      return NextResponse.json({ error: 'failed to create restaurant' }, { status: 500 });
    }

    // Dedupe guests
    const guestMap = new Map<string, { name: string; phone: string; email: string }>();
    for (const row of parsed.data) {
      const key = `${row.guest_name}|${row.phone}`;
      if (!guestMap.has(key)) {
        guestMap.set(key, { name: row.guest_name, phone: row.phone, email: row.email });
      }
    }

    const guestRows = Array.from(guestMap.values()).map((g) => ({
      restaurant_id: restaurant.id,
      name: g.name,
      phone: g.phone,
      email: g.email,
    }));

    const { data: insertedGuests, error: guestErr } = await db
      .from('guests')
      .insert(guestRows)
      .select('id, name, phone');
    if (guestErr) throw guestErr;

    const idByKey = new Map<string, string>();
    for (const g of insertedGuests ?? []) {
      idByKey.set(`${g.name}|${g.phone}`, g.id);
    }

    const visits = parsed.data
      .map((row) => {
        const key = `${row.guest_name}|${row.phone}`;
        const gid = idByKey.get(key);
        if (!gid) return null;
        return {
          guest_id: gid,
          restaurant_id: restaurant.id,
          visit_date: row.visit_date,
          party_size: parseInt(row.party_size, 10) || 2,
          amount: row.amount ? parseFloat(row.amount) : null,
          shift: row.shift || null,
          day_of_week: row.day_of_week || null,
          sector: row.sector || null,
          visit_type: row.visit_type || 'reservation',
          outcome: row.outcome || 'completed',
          score: row.score ? parseFloat(row.score) : null,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    const BATCH = 500;
    for (let i = 0; i < visits.length; i += BATCH) {
      const { error } = await db.from('visits').insert(visits.slice(i, i + BATCH));
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      guests: insertedGuests?.length ?? 0,
      visits: visits.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
