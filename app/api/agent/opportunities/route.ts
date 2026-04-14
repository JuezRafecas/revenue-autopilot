import type { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { resolveRestaurant } from '@/lib/agent/restaurant';
import { detectOpportunities } from '@/lib/agent/opportunities';
import type { GuestProfile } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  let supabase;
  try {
    supabase = getServiceClient();
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : 'Supabase no está configurado.',
        hint: 'Agregá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.',
      },
      { status: 501 }
    );
  }

  let restaurant;
  try {
    restaurant = await resolveRestaurant(supabase);
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : 'No se pudo resolver el restaurante.',
      },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('restaurant_id', restaurant.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const profiles = (data ?? []) as GuestProfile[];
  const opportunities = detectOpportunities(profiles, restaurant.avg_ticket);

  return Response.json(
    {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        currency: restaurant.currency,
        avg_ticket: restaurant.avg_ticket,
      },
      total_guests: profiles.length,
      scanned_at: new Date().toISOString(),
      opportunities,
    },
    {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
