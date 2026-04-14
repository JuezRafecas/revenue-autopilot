/**
 * Seed v2 — thin CLI wrapper around `lib/cdp-seed.ts:reseedFromCsvs`.
 *
 * Reads the 3 La Cabrera CSVs from the repo root and runs the shared
 * projection pipeline against Supabase.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { requireEnv } from './_env';
import { reseedFromCsvs } from '../lib/cdp-seed';

const db = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } },
);

const RESTAURANT = {
  name: 'La Cabrera',
  slug: 'la-cabrera',
  avg_ticket: 45000,
  currency: 'ARS',
};

async function resolveRestaurant() {
  const { data } = await db
    .from('restaurants')
    .select('id, avg_ticket')
    .eq('slug', RESTAURANT.slug)
    .maybeSingle();
  if (data) return data;
  const { data: created, error } = await db
    .from('restaurants')
    .insert(RESTAURANT)
    .select('id, avg_ticket')
    .single();
  if (error || !created) throw new Error(`create restaurant: ${error?.message}`);
  return created;
}

async function main() {
  const restaurant = await resolveRestaurant();
  console.log(`-> Restaurant: ${restaurant.id} (avg_ticket ${restaurant.avg_ticket})`);

  const visitCsv = readFileSync(
    resolve(process.cwd(), 'la_cabrera_cdp_visit.csv'),
    'utf-8',
  );
  const guestPartnerCsv = readFileSync(
    resolve(process.cwd(), 'la_cabrera_guest_partner.csv'),
    'utf-8',
  );
  const guestUnifiedCsv = readFileSync(
    resolve(process.cwd(), 'la_cabrera_guest_unified.csv'),
    'utf-8',
  );

  console.log('-> Running reseed pipeline (wipe + raw + project)');
  const counts = await reseedFromCsvs(db, {
    visitCsv,
    guestPartnerCsv,
    guestUnifiedCsv,
    restaurantId: restaurant.id,
    avgTicket: Number(restaurant.avg_ticket),
  });

  console.log('\n✓ Reseed v2 completed');
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
