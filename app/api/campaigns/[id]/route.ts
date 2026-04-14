import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { campaignFromRow, type CampaignRow } from '@/lib/campaigns-db';
import type { AudienceFilter, CampaignStatus, CampaignTrigger } from '@/lib/types';

const ALLOWED_STATUS: CampaignStatus[] = ['draft', 'scheduled', 'active', 'paused'];

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ campaign: campaignFromRow(data as CampaignRow) });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}

interface PatchPayload {
  name?: string;
  description?: string | null;
  audience_filter?: AudienceFilter;
  trigger?: CampaignTrigger;
  status?: CampaignStatus;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: PatchPayload;
  try {
    body = (await req.json()) as PatchPayload;
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  if (body.status && !ALLOWED_STATUS.includes(body.status)) {
    return NextResponse.json(
      { error: `status ${body.status} cannot be set via PATCH` },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.audience_filter !== undefined) updates.audience_filter = body.audience_filter;
  if (body.trigger !== undefined) updates.trigger_config = body.trigger;
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === 'active') updates.started_at = new Date().toISOString();
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ campaign: campaignFromRow(data as CampaignRow) });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from('campaigns')
      .update({
        status: 'archived',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ id, status: 'archived' });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
