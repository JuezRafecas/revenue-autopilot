import type { SupabaseClient } from '@supabase/supabase-js';
import type { Restaurant } from '../types';

/**
 * Single-tenant demo resolver. Until we have real auth, this picks the
 * restaurant in this order:
 *   1. DEMO_RESTAURANT_ID env var
 *   2. The first row in the restaurants table
 *
 * TODO: replace with real auth-scoped resolution once sessions exist.
 */
export async function resolveRestaurant(
  supabase: SupabaseClient
): Promise<Restaurant> {
  const demoId = process.env.DEMO_RESTAURANT_ID;

  if (demoId) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', demoId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as Restaurant;
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      'No hay ningún restaurante cargado todavía. Subí un CSV en /upload primero.'
    );
  }
  return data as Restaurant;
}
