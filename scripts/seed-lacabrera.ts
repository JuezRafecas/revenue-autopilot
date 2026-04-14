import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { requireEnv } from './_env';
import { parseCdpGuestPartnerCsv, cdpGuestPartnerToProfile } from '../lib/cdp';

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const RESTAURANT = {
  name: 'La Cabrera',
  slug: 'la-cabrera',
  avg_ticket: 45000,
  currency: 'ARS',
};

const BATCH = 1000;

async function main() {
  console.log('-> Parsing la_cabrera_guest_partner.csv');
  const csvPath = resolve(process.cwd(), 'la_cabrera_guest_partner.csv');
  const rows = parseCdpGuestPartnerCsv(readFileSync(csvPath, 'utf-8'));
  console.log(`   ${rows.length} rows parsed`);

  console.log('-> Upserting restaurant La Cabrera');
  const { data: existing } = await db
    .from('restaurants')
    .select('id')
    .eq('slug', RESTAURANT.slug)
    .maybeSingle();

  let restaurantId: string;
  if (existing) {
    restaurantId = existing.id;
    console.log(`   existing: ${restaurantId}`);
  } else {
    const { data, error } = await db
      .from('restaurants')
      .insert(RESTAURANT)
      .select('id')
      .single();
    if (error || !data) throw error;
    restaurantId = data.id;
    console.log(`   created:  ${restaurantId}`);
  }

  console.log('-> Inserting guests');
  const guestPayload = rows.map((r, idx) => ({
    restaurant_id: restaurantId,
    name: r.guest_name ?? `guest-${idx}`,
    phone: null,
    email: r.guest_email,
  }));

  const guestIdByPartnerId = new Map<string, string>();
  for (let i = 0; i < guestPayload.length; i += BATCH) {
    const slice = guestPayload.slice(i, i + BATCH);
    const { data, error } = await db.from('guests').insert(slice).select('id');
    if (error) throw error;
    // Rows come back in insert order; align with the matching source rows.
    data?.forEach((g, k) => {
      guestIdByPartnerId.set(rows[i + k].guest_partner_id, g.id);
    });
    process.stdout.write(`   ${Math.min(i + BATCH, guestPayload.length)}/${guestPayload.length}\r`);
  }
  console.log('');

  console.log('-> Inserting guest_profiles');
  const profilePayload = rows
    .map((r) => {
      const realGuestId = guestIdByPartnerId.get(r.guest_partner_id);
      if (!realGuestId) return null;
      const p = cdpGuestPartnerToProfile(r, restaurantId);
      const { id: _id, guest_id: _gid, tier: _tier, ...rest } = p;
      return { ...rest, guest_id: realGuestId };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  for (let i = 0; i < profilePayload.length; i += BATCH) {
    const slice = profilePayload.slice(i, i + BATCH);
    const { error } = await db.from('guest_profiles').insert(slice);
    if (error) throw error;
    process.stdout.write(`   ${Math.min(i + BATCH, profilePayload.length)}/${profilePayload.length}\r`);
  }
  console.log('');

  console.log('\n✓ Seed La Cabrera completado');
  console.log(`  restaurant: ${RESTAURANT.name} (${restaurantId})`);
  console.log(`  guests:     ${guestPayload.length}`);
  console.log(`  profiles:   ${profilePayload.length}`);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
