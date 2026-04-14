import { AppShell } from '@/components/layout/AppShell';
import { NomiHub } from '@/components/nomi/NomiHub';
import { detectOpportunities } from '@/lib/agent/opportunities';
import { resolveRestaurant } from '@/lib/agent/restaurant';
import { getServiceClient } from '@/lib/supabase';
import type { GuestProfile, Restaurant } from '@/lib/types';
import type { Opportunity } from '@/lib/agent/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface InitialHubData {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'slug' | 'avg_ticket' | 'currency'> | null;
  opportunities: Opportunity[];
  total_guests: number;
  error: string | null;
}

async function loadInitialHub(): Promise<InitialHubData> {
  let supabase;
  try {
    supabase = getServiceClient();
  } catch (err) {
    return {
      restaurant: null,
      opportunities: [],
      total_guests: 0,
      error:
        err instanceof Error
          ? err.message
          : 'Supabase is not configured. Add credentials in .env.local.',
    };
  }

  try {
    const restaurant = await resolveRestaurant(supabase);
    const { data, error } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('restaurant_id', restaurant.id);
    if (error) throw error;
    const profiles = (data ?? []) as GuestProfile[];
    const opportunities = detectOpportunities(profiles, restaurant.avg_ticket);
    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        avg_ticket: restaurant.avg_ticket,
        currency: restaurant.currency,
      },
      opportunities,
      total_guests: profiles.length,
      error: null,
    };
  } catch (err) {
    return {
      restaurant: null,
      opportunities: [],
      total_guests: 0,
      error:
        err instanceof Error
          ? err.message
          : 'Unable to load the hub. Check the CDP.',
    };
  }
}

export default async function HubPage() {
  const initial = await loadInitialHub();

  return (
    <AppShell>
      <NomiHub initial={initial} />
    </AppShell>
  );
}
