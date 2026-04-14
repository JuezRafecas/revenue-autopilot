import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const tables = [
  'restaurants',
  'guests',
  'visits',
  'guest_profiles',
  'campaigns',
  'messages',
  'events',
  'attributions',
];

async function main() {
  let ok = true;
  for (const t of tables) {
    // NB: `head: true` returns 204 No Content even when the table is missing,
    // which hides PGRST205 errors. Always do a real select so missing tables
    // surface as errors.
    const { error, data } = await db.from(t).select('*').limit(1);
    if (error) {
      console.log(`[MISS] ${t}: ${error.message}`);
      ok = false;
    } else {
      const { count } = await db.from(t).select('*', { count: 'exact', head: true });
      console.log(`[OK]   ${t}: ${count ?? data?.length ?? 0} rows`);
    }
  }
  process.exit(ok ? 0 : 1);
}

main();
