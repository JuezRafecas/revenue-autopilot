import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { requireEnv } from './_env';
import { DEFAULT_RESTAURANT } from '../lib/constants';

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

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

async function main() {
  console.log('→ Leyendo data/demo-visits.csv');
  const csvPath = resolve(process.cwd(), 'data/demo-visits.csv');
  const csvText = readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0) {
    console.error('✗ CSV parse errors:', parsed.errors.slice(0, 3));
    process.exit(1);
  }

  const rows = parsed.data;
  console.log(`  ${rows.length} filas parseadas`);

  console.log('→ Creando/obteniendo restaurante');
  const { data: existing } = await db
    .from('restaurants')
    .select('id')
    .eq('slug', DEFAULT_RESTAURANT.slug)
    .maybeSingle();

  let restaurantId: string;
  if (existing) {
    restaurantId = existing.id;
    console.log(`  restaurante existente: ${restaurantId}`);
  } else {
    const { data: created, error } = await db
      .from('restaurants')
      .insert({
        name: DEFAULT_RESTAURANT.name,
        slug: DEFAULT_RESTAURANT.slug,
        avg_ticket: DEFAULT_RESTAURANT.avg_ticket,
        currency: DEFAULT_RESTAURANT.currency,
      })
      .select('id')
      .single();
    if (error || !created) throw error;
    restaurantId = created.id;
    console.log(`  restaurante creado: ${restaurantId}`);
  }

  console.log('→ Deduplicando guests por (name + phone)');
  const guestMap = new Map<string, { name: string; phone: string; email: string }>();
  for (const row of rows) {
    const key = `${row.guest_name}|${row.phone}`;
    if (!guestMap.has(key)) {
      guestMap.set(key, { name: row.guest_name, phone: row.phone, email: row.email });
    }
  }
  console.log(`  ${guestMap.size} guests únicos`);

  console.log('→ Insertando guests');
  const guestIdByKey = new Map<string, string>();
  const guestsArray = Array.from(guestMap.entries());
  const BATCH = 500;
  for (let i = 0; i < guestsArray.length; i += BATCH) {
    const slice = guestsArray.slice(i, i + BATCH);
    const payload = slice.map(([, g]) => ({
      restaurant_id: restaurantId,
      name: g.name,
      phone: g.phone,
      email: g.email,
    }));
    const { data, error } = await db.from('guests').insert(payload).select('id, name, phone');
    if (error) throw error;
    for (const g of data ?? []) {
      guestIdByKey.set(`${g.name}|${g.phone}`, g.id);
    }
    process.stdout.write(`  ${Math.min(i + BATCH, guestsArray.length)}/${guestsArray.length}\r`);
  }
  console.log('');

  console.log('→ Insertando visitas');
  const visitPayload = rows.map((row) => {
    const key = `${row.guest_name}|${row.phone}`;
    const guestId = guestIdByKey.get(key);
    return {
      guest_id: guestId,
      restaurant_id: restaurantId,
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
  });

  for (let i = 0; i < visitPayload.length; i += BATCH) {
    const slice = visitPayload.slice(i, i + BATCH);
    const { error } = await db.from('visits').insert(slice);
    if (error) throw error;
    process.stdout.write(`  ${Math.min(i + BATCH, visitPayload.length)}/${visitPayload.length}\r`);
  }
  console.log('');

  console.log('\n✓ Seed completado.');
  console.log(`  Restaurante: ${DEFAULT_RESTAURANT.name}`);
  console.log(`  Guests: ${guestMap.size}`);
  console.log(`  Visitas: ${visitPayload.length}\n`);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
