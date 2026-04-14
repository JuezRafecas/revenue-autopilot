import { createClient } from '@supabase/supabase-js';
import { requireEnv } from './_env';

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function truncate(table: string) {
  const { error } = await db.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw new Error(`Failed to truncate ${table}: ${error.message}`);
  console.log(`  ✓ ${table}`);
}

async function main() {
  console.log('→ Vaciando tablas');
  await truncate('actions');
  await truncate('guest_profiles');
  await truncate('visits');
  await truncate('guests');
  await truncate('restaurants');

  console.log('\n→ Re-ejecutando seed');
  await import('./seed');
}

main().catch((err) => {
  console.error('\n✗ Reset failed:', err);
  process.exit(1);
});
