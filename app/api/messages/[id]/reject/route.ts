import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let reason: string | undefined;
  try {
    const raw = await req.text();
    if (raw) reason = (JSON.parse(raw) as { reason?: string }).reason;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  try {
    const db = getServiceClient();
    const { data: existing } = await db
      .from('messages')
      .select('id, status')
      .eq('id', id)
      .maybeSingle();
    if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (existing.status !== 'pending_approval') {
      return NextResponse.json(
        { error: `cannot reject message in status ${existing.status}` },
        { status: 409 },
      );
    }

    const { error } = await db
      .from('messages')
      .update({ status: 'skipped', error_message: reason ?? null })
      .eq('id', id);
    if (error) throw error;

    return NextResponse.json({ id, status: 'skipped' });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
