import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import type { MessageStatus } from '@/lib/types';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as MessageStatus | null;

  try {
    const db = getServiceClient();
    let query = db
      .from('messages')
      .select('*, guest:guests(*)')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ campaign_id: id, messages: data ?? [] });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
