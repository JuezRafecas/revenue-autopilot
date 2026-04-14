import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { requireEnv } from './_env';
import {
  parseCdpVisitCsv,
  parseCdpGuestPartnerCsv,
  parseCdpGuestUnifiedCsv,
} from '../lib/cdp';

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const BATCH = 1000;

async function upsertBatches<T>(table: string, rows: T[], conflictTarget: string) {
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH) as unknown as Record<string, unknown>[];
    const { error } = await db.from(table).upsert(slice, { onConflict: conflictTarget });
    if (error) throw new Error(`${table} batch ${i}: ${error.message}`);
    process.stdout.write(`   ${Math.min(i + BATCH, rows.length)}/${rows.length}\r`);
  }
  console.log('');
}

async function main() {
  console.log('-> Parsing la_cabrera_cdp_visit.csv');
  const visits = parseCdpVisitCsv(
    readFileSync(resolve(process.cwd(), 'la_cabrera_cdp_visit.csv'), 'utf-8'),
  );
  console.log(`   ${visits.length} rows`);

  console.log('-> Parsing la_cabrera_guest_partner.csv');
  const partners = parseCdpGuestPartnerCsv(
    readFileSync(resolve(process.cwd(), 'la_cabrera_guest_partner.csv'), 'utf-8'),
  );
  console.log(`   ${partners.length} rows`);

  console.log('-> Parsing la_cabrera_guest_unified.csv');
  const unified = parseCdpGuestUnifiedCsv(
    readFileSync(resolve(process.cwd(), 'la_cabrera_guest_unified.csv'), 'utf-8'),
  );
  console.log(`   ${unified.length} rows`);

  console.log('\n-> Upserting cdp_visits');
  await upsertBatches('cdp_visits', visits, 'visit_id');

  console.log('-> Upserting cdp_guest_partners');
  await upsertBatches('cdp_guest_partners', partners, 'guest_partner_id');

  console.log('-> Upserting cdp_guest_unified');
  await upsertBatches('cdp_guest_unified', unified, 'guest_id');

  console.log('\n✓ Seed CDP raw completado');
  console.log(`  cdp_visits:         ${visits.length}`);
  console.log(`  cdp_guest_partners: ${partners.length}`);
  console.log(`  cdp_guest_unified:  ${unified.length}`);
}

main().catch((err) => {
  console.error('\n✗ Seed failed:', err);
  process.exit(1);
});
