import type { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { isValidDraft, persistCampaignDraft } from '@/lib/agent/persist';
import type { CampaignDraft } from '@/lib/agent/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let supabase;
  try {
    supabase = getServiceClient();
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Supabase no configurado.' },
      { status: 501 }
    );
  }

  const body = (await req.json()) as { draft?: CampaignDraft };
  if (!body.draft || !isValidDraft(body.draft)) {
    return Response.json(
      { error: 'draft inválido: falta restaurant_id, name, type, workflow, audience_filter o trigger.' },
      { status: 400 }
    );
  }

  try {
    const campaign = await persistCampaignDraft(supabase, {
      ...body.draft,
      source: 'nomi',
      reasoning: body.draft.reasoning,
    });
    return Response.json({ campaign }, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Error persistiendo la campaña.' },
      { status: 500 }
    );
  }
}
