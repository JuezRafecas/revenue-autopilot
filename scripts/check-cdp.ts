import { requireEnv } from './_env';
import { createClient } from '@supabase/supabase-js';

const db = createClient(
  requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  { auth: { persistSession: false } },
);

async function main() {
  const tables = [
    'restaurants',
    'guests',
    'guest_profiles',
    'visits',
    'cdp_visits',
    'cdp_guest_partners',
    'cdp_guest_unified',
  ];
  for (const t of tables) {
    const { count, error } = await db.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`[ERR] ${t}: ${error.message}`);
    else console.log(`[OK]  ${t}: ${count}`);
  }

  console.log('\nSample guests (5):');
  const { data: gs } = await db
    .from('guests')
    .select('id, name, phone, email')
    .limit(5);
  console.log(gs);

  console.log('\nSample visits with amount (5):');
  const { data: vs } = await db
    .from('visits')
    .select('id, visit_date, party_size, amount, outcome, shift')
    .not('amount', 'is', null)
    .limit(5);
  console.log(vs);

  console.log('\nSample guest_profiles with total_spent (5):');
  const { data: ps } = await db
    .from('guest_profiles')
    .select('id, total_visits, total_spent, avg_amount, days_since_last, segment')
    .gt('total_visits', 3)
    .order('total_spent', { ascending: false })
    .limit(5);
  console.log(ps);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
