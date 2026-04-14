import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

interface Body {
  guest_id: string;
  action_type: string;
  message: string;
  estimated_revenue?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const db = getServiceClient();

    const { data: restaurant } = await db
      .from('restaurants')
      .select('id')
      .limit(1)
      .single();

    const { data, error } = await db
      .from('actions')
      .insert({
        restaurant_id: restaurant?.id,
        guest_id: body.guest_id,
        action_type: body.action_type,
        message: body.message,
        channel: 'whatsapp',
        status: 'approved',
        estimated_revenue: body.estimated_revenue ?? null,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ action: data });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('actions')
      .select('*, guest:guests(id, name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ actions: data });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
