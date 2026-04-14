import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const db = getServiceClient();
    const { data: existing, error: readErr } = await db
      .from('messages')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();
    if (readErr) throw readErr;
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (existing.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `cannot approve message in status ${existing.status}` },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const { error: updErr } = await db
      .from('messages')
      .update({ status: 'approved', approved_at: now })
      .eq('id', id);
    if (updErr) throw updErr;

    return NextResponse.json({ id, status: 'approved', approved_at: now, queued: true });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
